# src/bandit/drift_detection.py
# ============================================================
# Rôle : Détecter les dérives dans le flux de données
# en utilisant ADWIN et déclencher un reset du bandit
# ============================================================

import os
import matplotlib.pyplot as plt
from river import drift


# ============================================================
# CLASSE : DetecteurDerive
# ============================================================
class DetecteurDerive:
    """
    ADWIN (Adaptive Windowing) surveille une fenêtre glissante
    de résultats (1 = bonne prédiction, 0 = mauvaise).

    Si la précision chute brusquement → dérive détectée
    → reset automatique du bandit
    """

    def __init__(self, bandit, delta=0.002, verbose=True):
        # ← CORRECTION : indentation correcte (4 espaces)
        self.bandit             = bandit
        self.adwin              = drift.ADWIN(delta=delta)
        self.derives_detectees  = []
        self.precisions         = []
        self.verbose            = verbose  # True = affiche les dérives, False = silencieux

    # ----------------------------------------------------------
    # MÉTHODE : Mettre à jour ADWIN à chaque étape
    # ----------------------------------------------------------
    def update(self, pred, y_reel):
        """
        Appeler à chaque étape après predict_and_learn().

        pred   : prédiction du modèle (0 ou 1)
        y_reel : vraie valeur (0 ou 1)

        ADWIN reçoit 1 si correct, 0 si erreur.
        Il surveille si le taux de bonnes prédictions change.
        """
        # 1 = bonne prédiction, 0 = mauvaise
        correct = int(pred == y_reel) if pred is not None else 0

        # Mettre à jour ADWIN
        self.adwin.update(correct)

        # Sauvegarder la précision courante du modèle actif
        prec = self.bandit.scores[self.bandit.modele_actif].get()
        self.precisions.append(round(prec, 4))

        # Vérifier si dérive détectée
        if self.adwin.drift_detected:
            step = self.bandit.step

            # ← CORRECTION : afficher seulement si verbose=True
            if self.verbose:
                print(f"\n  !! DÉRIVE DÉTECTÉE à l'étape {step} !!")
                print(f"     Modèle actif avant reset : {self.bandit.modele_actif}")

            # Logger la dérive dans l'historique du bandit
            self.bandit.historique.append({
                "step"         : step,
                "ancien"       : self.bandit.modele_actif,
                "nouveau"      : "RESET",
                "raison"       : "ADWIN_drift",
                "score_ancien" : round(
                    self.bandit.scores[self.bandit.modele_actif].get(), 4
                ),
                "score_nouveau": 0.0
            })

            # Enregistrer l'étape de dérive
            self.derives_detectees.append(step)

            # Déclencher le reset du bandit
            self.bandit.reset()

    # ----------------------------------------------------------
    # MÉTHODE : Tracer la courbe de précision avec les dérives
    # ----------------------------------------------------------
    def plot_precision(self, chemin=None):
        """
        Génère un graphique avec :
        - Courbe bleue  : précision glissante dans le temps
        - Lignes rouges : moments où ADWIN a détecté une dérive
        """
        if chemin is None:
            chemin = os.path.join(
                os.path.dirname(__file__),
                "../../data/logs/precision_derives.png"
            )
        os.makedirs(os.path.dirname(chemin), exist_ok=True)

        plt.figure(figsize=(14, 5))

        # --- Courbe principale de précision ---
        plt.plot(
            self.precisions,
            color="#378ADD",
            linewidth=1,
            alpha=0.85,
            label="Précision glissante"
        )

        # --- Zone ombrée pour mieux voir la courbe ---
        plt.fill_between(
            range(len(self.precisions)),
            self.precisions,
            alpha=0.08,
            color="#378ADD"
        )

        # --- Lignes verticales rouges aux dérives ---
        for i, step in enumerate(self.derives_detectees):
            label = "Dérive détectée (ADWIN)" if i == 0 else ""
            plt.axvline(
                x=step,
                color="#E24B4A",
                linestyle="--",
                linewidth=1.8,
                alpha=0.85,
                label=label
            )
            plt.text(
                step + len(self.precisions) * 0.01,
                max(self.precisions) * 0.97,
                f"Dérive {i+1}",
                color="#E24B4A",
                fontsize=8
            )

        plt.xlabel("Étapes du stream", fontsize=11)
        plt.ylabel("Précision", fontsize=11)
        plt.title(
            "Précision glissante — Auto-ML adaptatif avec détection ADWIN",
            fontsize=12
        )
        plt.ylim(0, 1.05)
        plt.legend(fontsize=10)
        plt.tight_layout()
        plt.savefig(chemin, dpi=150)
        plt.show()
        print(f"\n[ADWIN] Graphique sauvegardé → {chemin}")

    # ----------------------------------------------------------
    # MÉTHODE : Résumé des dérives détectées
    # ----------------------------------------------------------
    def afficher_resume(self):
        """Affiche un résumé dans le terminal"""
        print("\n┌─────────────────────────────────────────┐")
        print("│         Résumé détection ADWIN           │")
        print("├─────────────────────────────────────────┤")
        print(f"│  Dérives détectées : {len(self.derives_detectees):<20}│")
        if self.derives_detectees:
            for i, step in enumerate(self.derives_detectees):
                print(f"│  Dérive {i+1} à l'étape : {step:<18}│")
        if self.precisions:
            print(f"│  Précision finale  : {self.precisions[-1]:.4f}               │")
        print("└─────────────────────────────────────────┘")