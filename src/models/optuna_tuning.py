# src/models/optuna_tuning.py
# ============================================================
# Rôle : Optimiser automatiquement les hyperparamètres
# ============================================================

import sys
import os
import json
import warnings
warnings.filterwarnings("ignore")

# Ajout du chemin racine pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import optuna
import pandas as pd
from river.stream import iter_pandas

from src.bandit.bandit import Bandit
from src.bandit.drift_detection import DetecteurDerive
from src.data.simulate_drift import charger_dataset

# ============================================================
# FONCTION : Évaluer une combinaison de paramètres
# ============================================================
def evaluer_parametres(epsilon, max_depth, n_neighbors, delta,
                        df, features, target, n=2000, verbose=False):
    """
    Évalue la performance d'une configuration sur n exemples.
    """
    bandit = Bandit(
        epsilon=epsilon,
        max_depth=max_depth,
        n_neighbors=n_neighbors
    )
    detecteur = DetecteurDerive(bandit, delta=delta)

    stream = iter_pandas(
        X=df[features].iloc[:n],
        y=df[target].iloc[:n]
    )

    for x, y in stream:
        pred = bandit.predict_and_learn(x, y)
        detecteur.update(pred, y)

    if verbose:
        bandit.afficher_scores()
        detecteur.afficher_resume()

    # CORRECTION : On utilise .get() et on vérifie la validité du score
    # (River >= 0.14 n'utilise plus n_samples)
    scores = [s.get() for s in bandit.scores.values()]
    
    return max(scores) if scores else 0.0

# ============================================================
# FONCTION OBJECTIVE : ce qu'Optuna cherche à maximiser
# ============================================================
def objective(trial, df, features, target):
    """Suggère des paramètres et retourne le score."""
    epsilon     = trial.suggest_float("epsilon",     0.01, 0.3)
    max_depth   = trial.suggest_int(  "max_depth",   5,    30)
    n_neighbors = trial.suggest_int(  "n_neighbors", 3,    15)
    delta       = trial.suggest_float("delta",       0.001, 0.01, log=True)

    # On utilise 5000 exemples pour l'optimisation (compromis vitesse/précision)
    score = evaluer_parametres(
        epsilon, max_depth, n_neighbors, delta,
        df, features, target, n=5000
    )
    return score

# ============================================================
# FONCTION PRINCIPALE : lancer l'optimisation
# ============================================================
def optimiser(n_trials=30, chemin_resultats=None):
    """Lance l'optimisation Optuna sur n_trials essais."""
    if chemin_resultats is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        chemin_resultats = os.path.join(base_dir, "../../data/logs/optuna_resultats.json")

    print("\n" + "="*50)
    print("   OPTUNA — Optimisation des hyperparamètres")
    print("="*50)

    df, features, target = charger_dataset()

    optuna.logging.set_verbosity(optuna.logging.WARNING)
    study = optuna.create_study(direction="maximize", study_name="automl_cyber")

    # Barre de progression native d'Optuna
    study.optimize(
        lambda trial: objective(trial, df, features, target),
        n_trials=n_trials,
        show_progress_bar=True
    )

    print(f"\n   Meilleure précision : {study.best_value:.4f}")

    os.makedirs(os.path.dirname(chemin_resultats), exist_ok=True)
    tous_les_trials = [
        {
            "trial": t.number,
            "precision": round(t.value, 4) if t.value is not None else None,
            "params": t.params,
            "state": str(t.state)
        }
        for t in study.trials
    ]
    resultats = {
        "meilleure_precision" : round(study.best_value, 4),
        "meilleurs_params"    : study.best_params,
        "nombre_trials"       : n_trials,
        "tous_les_trials"     : tous_les_trials
    }
    with open(chemin_resultats, "w", encoding="utf-8") as f:
        json.dump(resultats, f, indent=2, ensure_ascii=False)

    return study.best_params, study.best_value

def run_avec_meilleurs_params():
    """Lance Optuna puis le pipeline final."""
    from src.data.simulate_drift import charger_stream_avec_derive

    # 1. Optimiser
    best_params, best_score = optimiser(n_trials=30)

    print("\n\n" + "="*50)
    print("   PIPELINE FINAL (Top Paramètres)")
    print("="*50)

    # 2. Initialisation
    bandit = Bandit(
        epsilon    = best_params["epsilon"],
        max_depth  = best_params["max_depth"],
        n_neighbors= best_params["n_neighbors"]
    )
    detecteur = DetecteurDerive(bandit, delta=best_params["delta"])

    # 3. Exécution finale sur 20 000 exemples
    stream = charger_stream_avec_derive(n=20000)

    for i, (x, y) in enumerate(stream):
        if i % 2000 == 0 and i > 0:
            # Sécurité ici aussi : .get() suffit
            prec = bandit.scores[bandit.modele_actif].get()
            print(f"  Étape {i:>6} | Modèle : {bandit.modele_actif:<15} | Acc : {prec:.4f}")
        
        pred = bandit.predict_and_learn(x, y)
        detecteur.update(pred, y)

    bandit.afficher_scores()
    detecteur.afficher_resume()

if __name__ == "__main__":
    run_avec_meilleurs_params()