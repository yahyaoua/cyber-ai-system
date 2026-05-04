# src/main.py
# ============================================================
# Point d'entrée principal du projet Auto-ML adaptatif
# Lance le pipeline complet : stream → bandit → ADWIN → logs
# ============================================================

import sys
import os

# Ajouter le dossier parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.bandit.bandit import Bandit
from src.bandit.drift_detection import DetecteurDerive
from src.data.simulate_drift import (
    charger_stream_normal,
    charger_stream_avec_derive
)


def run(mode="derive", n=20000, epsilon=0.1):
    """
    Lance le pipeline Auto-ML complet.

    mode    : "normal" → sans dérive
              "derive" → avec dérive artificielle à mi-chemin
    n       : nombre d'exemples à traiter
    epsilon : taux d'exploration du bandit (0.1 = 10%)
    """
    print("\n" + "="*50)
    print("   AUTO-ML ADAPTATIF — CYBER-AI-SYSTEM")
    print("="*50)
    print(f"   Mode    : {mode}")
    print(f"   N       : {n} exemples")
    print(f"   Epsilon : {epsilon}")
    print("="*50 + "\n")

    # --- 1. Créer le bandit et le détecteur ---
    bandit    = Bandit(epsilon=epsilon)
    detecteur = DetecteurDerive(bandit, delta=0.002)

    # --- 2. Charger le stream ---
    if mode == "derive":
        stream = charger_stream_avec_derive(n=n)
    else:
        stream = charger_stream_normal(n=n)

    # --- 3. Boucle principale ---
    print("\n[Main] Démarrage du stream...\n")

    for i, (x, y) in enumerate(stream):

        # Afficher la progression toutes les 2000 étapes
        if i % 2000 == 0 and i > 0:
            prec = bandit.scores[bandit.modele_actif].get()
            print(f"  Étape {i:>6} | "
                  f"Modèle : {bandit.modele_actif:<15} | "
                  f"Précision : {prec:.4f}")

        # Prédire + apprendre via le bandit
        pred = bandit.predict_and_learn(x, y)

        # Mettre à jour ADWIN avec le résultat
        detecteur.update(pred, y)

    # --- 4. Afficher les résultats ---
    print("\n[Main] Stream terminé !")
    bandit.afficher_scores()
    detecteur.afficher_resume()

    # --- 5. Sauvegarder les logs ---
    bandit.sauvegarder_logs()

    # --- 6. Tracer le graphique ---
    detecteur.plot_precision()

    return bandit, detecteur


# Point d'entrée
if __name__ == "__main__":
    bandit, detecteur = run(mode="derive", n=20000)