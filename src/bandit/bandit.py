# src/bandit/bandit.py
# ============================================================
# Rôle : Implémenter le Multi-Armed Bandit ε-greedy
# ============================================================

import random
import csv
import os
from river import tree, neighbors, linear_model, metrics, preprocessing

def creer_modeles(max_depth=10, n_neighbors=5):
    """Crée les 3 modèles d'online learning."""
    return {
        "HoeffdingTree": tree.HoeffdingTreeClassifier(max_depth=max_depth),
        "KNN_ADWIN": neighbors.KNNClassifier(n_neighbors=n_neighbors),
        "SGD": (
            preprocessing.StandardScaler() |
            linear_model.LogisticRegression()
        )
    }

class Bandit:
    def __init__(self, epsilon=0.1, max_depth=10, n_neighbors=5):
        self.epsilon      = epsilon
        self.modeles      = creer_modeles(max_depth, n_neighbors)
        # On utilise une métrique d'Accuracy pour chaque modèle
        self.scores       = {nom: metrics.Accuracy() for nom in self.modeles}
        self.modele_actif = "HoeffdingTree"
        self.step         = 0
        self.historique   = []

    def choisir_modele(self):
        """ε-greedy : Exploration vs Exploitation"""
        if random.random() < self.epsilon:
            # Exploration : choix aléatoire
            return random.choice(list(self.modeles.keys()))
        else:
            # Exploitation : on choisit celui qui a le meilleur score actuel
            # On vérifie que la métrique a déjà reçu au moins une mise à jour
            scores_valides = {
                nom: self.scores[nom].get()
                for nom in self.modeles
            }
            
            # Si tous les scores sont à 0 (début), on garde l'actif
            if all(s == 0 for s in scores_valides.values()):
                return self.modele_actif
                
            return max(scores_valides, key=scores_valides.get)

    def predict_and_learn(self, x, y):
        """Cycle complet : Prédiction, Apprentissage et Mise à jour du bandit"""
        self.step += 1

        # 1. Choisir le modèle (stratégie bandit)
        nouveau = self.choisir_modele()

        # 2. Logger si changement de stratégie
        if nouveau != self.modele_actif:
            self.historique.append({
                "step"         : self.step,
                "ancien"       : self.modele_actif,
                "nouveau"      : nouveau,
                "raison"       : "bandit",
                "score_ancien" : round(self.scores[self.modele_actif].get(), 4),
                "score_nouveau": round(self.scores[nouveau].get(), 4)
            })
            self.modele_actif = nouveau

        # 3. Prédire avec le modèle choisi par le bandit
        pred = self.modeles[self.modele_actif].predict_one(x)

        # 4. Tous les modèles apprennent en parallèle pour rester à jour
        for nom, modele in self.modeles.items():
            # Avant d'apprendre, on peut aussi mettre à jour les scores de tous 
            # les modèles pour une comparaison plus juste (Optionnel)
            p = modele.predict_one(x)
            if p is not None:
                self.scores[nom].update(y, p)
            
            # Apprentissage effectif
            modele.learn_one(x, y)

        return pred

    def reset(self):
        """Remise à zéro des métriques (appelé lors d'une dérive ADWIN)"""
        self.scores = {nom: metrics.Accuracy() for nom in self.modeles}
        print(f"    [Bandit] Reset des scores à l'étape {self.step}")

    def sauvegarder_logs(self, chemin=None):
        """Sauvegarde l'historique dans un fichier CSV"""
        if chemin is None:
            # Chemin relatif propre
            base_dir = os.path.dirname(os.path.abspath(__file__))
            chemin = os.path.join(base_dir, "../../data/logs/changements_modele.csv")
            
        os.makedirs(os.path.dirname(chemin), exist_ok=True)
        
        if not self.historique:
            print("[Bandit] Aucun changement à logger.")
            return

        champs = ["step", "ancien", "nouveau", "raison", "score_ancien", "score_nouveau"]
        with open(chemin, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=champs)
            writer.writeheader()
            writer.writerows(self.historique)
        print(f"[Bandit] CSV sauvegardé : {len(self.historique)} événements.")

    def afficher_scores(self):
        """Affichage visuel des performances"""
        print("\n┌─────────────────────────────────────────┐")
        print("│         Scores finaux du Bandit         │")
        print("├─────────────────────────────────────────┤")
        for nom, score in self.scores.items():
            actif = " ◄ ACTIF" if nom == self.modele_actif else ""
            val = score.get()
            barre = int(val * 20) * "█" + (20 - int(val * 20)) * "░"
            print(f"│ {nom:<15} {barre} {val:.4f}{actif}")
        print("└─────────────────────────────────────────┘")