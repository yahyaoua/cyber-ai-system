# src/api/main.py
# ============================================================
# Rôle : API FastAPI pour exposer le système Auto-ML
# Lancer avec : python src/api/main.py
# ============================================================

import sys
import os

# Ajouter la racine du projet au path Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

import time
import threading
import psutil
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from river.stream import iter_pandas

from src.bandit.bandit import Bandit
from src.bandit.drift_detection import DetecteurDerive
from src.data.simulate_drift import charger_dataset


# ============================================================
# ÉTAT GLOBAL DU SYSTÈME
# ============================================================
bandit    = Bandit(epsilon=0.1, max_depth=18, n_neighbors=7)
detecteur = DetecteurDerive(bandit, delta=0.003, verbose=True)

stats = {
    "total_predictions" : 0,
    "total_derives"     : 0,
    "heure_demarrage"   : time.time(),
    "latences"          : []
}


# ============================================================
# STREAM EN ARRIÈRE-PLAN
# ============================================================
# Remplacer dans lancer_stream_background()

def lancer_stream_background():
    from src.data.simulate_drift import charger_stream_complet

    while True:
        print("[Stream] Chargement train + test...")
        stream, features, target = charger_stream_complet()
        print("[Stream] Démarrage du flux complet...")

        for x, y in stream:
            debut = time.time()
            pred  = bandit.predict_and_learn(x, y)
            detecteur.update(pred, y)

            latence = round((time.time() - debut) * 1000, 2)
            stats["latences"].append(latence)
            if len(stats["latences"]) > 100:
                stats["latences"].pop(0)

            stats["total_predictions"] += 1
            stats["total_derives"] = len(detecteur.derives_detectees)
            time.sleep(0.05)

        print("[Stream] Cycle terminé, redémarrage...")

# ============================================================
# LIFESPAN — démarre le stream au lancement de l'API
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lancer le stream dans un thread daemon
    thread = threading.Thread(
        target=lancer_stream_background,
        daemon=True
    )
    thread.start()
    print("[API] Stream background démarré ✓")
    yield
    print("[API] Arrêt de l'API")


# ============================================================
# INITIALISATION FASTAPI
# ============================================================
app = FastAPI(
    title="Cyber AI System — Auto-ML adaptatif",
    description="API de détection d'intrusions réseau",
    version="1.0.0",
    lifespan=lifespan
)

# CORS pour le dashboard React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODÈLES PYDANTIC
# ============================================================
class DonneesReseau(BaseModel):
    features   : dict
    label_reel : Optional[int] = None


class ReponsePredict(BaseModel):
    prediction         : int
    modele_utilise     : str
    precision_actuelle : float
    latence_ms         : float
    nb_derives         : int


# ============================================================
# ROUTES
# ============================================================

@app.get("/status")
def status():
    """Vérifie que l'API est vivante"""
    return {
        "status"  : "ok",
        "message" : "Cyber AI System opérationnel",
        "version" : "1.0.0",
        "modele"  : bandit.modele_actif,
        "step"    : bandit.step
    }


@app.get("/metrics")
def metrics():
    """Retourne toutes les métriques en temps réel"""
    scores_modeles = {
        nom: round(score.get(), 4)
        for nom, score in bandit.scores.items()
    }

    latence_moy = round(
        sum(stats["latences"]) / len(stats["latences"]), 2
    ) if stats["latences"] else 0.0

    uptime = round(time.time() - stats["heure_demarrage"], 1)

    return {
        "modele_actif"       : bandit.modele_actif,
        "scores_modeles"     : scores_modeles,
        "total_predictions"  : stats["total_predictions"],
        "total_derives"      : stats["total_derives"],
        "latence_moy_ms"     : latence_moy,
        "step_actuel"        : bandit.step,
        "uptime_secondes"    : uptime,
        "cpu_percent"        : psutil.cpu_percent(),
        "ram_percent"        : psutil.virtual_memory().percent,
        "ram_utilisee_mb"    : round(
            psutil.virtual_memory().used / 1024**2, 1
        ),
        "historique_derives" : detecteur.derives_detectees[-10:],
        "precisions_recentes": detecteur.precisions[-100:]
    }


@app.post("/predict", response_model=ReponsePredict)
def predict(donnees: DonneesReseau):
    """Reçoit des données et retourne une prédiction"""
    debut = time.time()
    try:
        x = donnees.features
        y = donnees.label_reel

        if y is not None:
            pred = bandit.predict_and_learn(x, y)
            detecteur.update(pred, y)
        else:
            pred = bandit.modeles[bandit.modele_actif].predict_one(x)

        latence = round((time.time() - debut) * 1000, 2)
        stats["latences"].append(latence)
        if len(stats["latences"]) > 100:
            stats["latences"].pop(0)

        stats["total_predictions"] += 1
        stats["total_derives"] = len(detecteur.derives_detectees)

        prec = bandit.scores[bandit.modele_actif].get()

        return ReponsePredict(
            prediction         = int(pred) if pred is not None else -1,
            modele_utilise     = bandit.modele_actif,
            precision_actuelle = round(prec, 4),
            latence_ms         = latence,
            nb_derives         = stats["total_derives"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reset")
def reset():
    """Force un reset du bandit"""
    bandit.reset()
    return {
        "status"  : "reset effectué",
        "step"    : bandit.step,
        "message" : "Scores remis à zéro, modèles conservés"
    }


# ============================================================
# LANCEMENT
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",          # ← CORRECTION : "main:app" pas "src.api.main:app"
        host="0.0.0.0",
        port=8000,
        reload=False,        # ← CORRECTION : False pour éviter conflits avec thread
        app_dir="src/api"    # ← indique à uvicorn où chercher main.py
    )