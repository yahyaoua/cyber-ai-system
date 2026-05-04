# src/data/simulate_drift.py
# ============================================================
# Rôle : Charger le dataset UNSW-NB15 comme un stream
# et simuler une dérive artificielle pour tester le système
# ============================================================

import os
import pandas as pd
import numpy as np
from river.stream import iter_pandas


# ============================================================
# FONCTION : Charger le dataset proprement
# ============================================================
def charger_dataset(chemin=None):
    """
    Charge le CSV UNSW-NB15 et retourne :
    - df       : le dataframe complet nettoyé
    - features : liste des colonnes features
    - target   : nom de la colonne cible ("label")
    """
    if chemin is None:
        chemin = os.path.join(
            os.path.dirname(__file__),
            "../../data/unsw-nb15/UNSW_NB15_training-set.csv"
        )

    print(f"[Data] Chargement du dataset : {chemin}")
    df = pd.read_csv(chemin)

    # Colonnes à supprimer (métadonnées inutiles pour le ML)
    target = "label"
    cols_supprimer = [
        c for c in ["id", "attack_cat"]
        if c in df.columns
    ]
    features = [
        c for c in df.columns
        if c not in [target] + cols_supprimer
    ]

    df = df[features + [target]].copy()

    # Convertir les colonnes object en numérique si possible
    for col in df[features].select_dtypes(include="object").columns:
        df[col] = pd.Categorical(df[col]).codes

    print(f"[Data] Dataset chargé : {df.shape[0]} lignes, {len(features)} features")
    print(f"[Data] Classes : {df[target].value_counts().to_dict()}")

    return df, features, target


# ============================================================
# FONCTION : Stream normal (sans dérive)
# ============================================================
def charger_stream_normal(chemin=None, n=10000):
    """
    Retourne les n premières lignes comme un stream river.
    Utilisé pour tester le bandit sans dérive.

    Exemple :
        stream = charger_stream_normal(n=10000)
        for x, y in stream:
            pred = bandit.predict_and_learn(x, y)
    """
    df, features, target = charger_dataset(chemin)
    df = df.iloc[:n]

    print(f"[Data] Stream normal prêt : {n} exemples")
    return iter_pandas(X=df[features], y=df[target])


# ============================================================
# FONCTION : Stream avec dérive artificielle
# ============================================================
def charger_stream_avec_derive(chemin=None, n=20000, point_derive=0.5):
    """
    Retourne un stream avec une dérive artificielle simulée.

    n            : nombre total d'exemples
    point_derive : moment de la dérive (0.5 = à mi-chemin)

    Comment la dérive est simulée :
    - Partie 1 (avant dérive) : données normales
    - Partie 2 (après dérive) :
        a) Labels inversés  → le modèle commence à se tromper
        b) Bruit gaussien   → les features changent de distribution
    Cela représente un changement de comportement du réseau
    (ex : nouvelle catégorie d'attaque non vue avant)
    """
    df, features, target = charger_dataset(chemin)
    df = df.iloc[:n].copy()

    mi = int(n * point_derive)

    # --- Partie 1 : données normales ---
    df1 = df.iloc[:mi].copy()

    # --- Partie 2 : dérive artificielle ---
    df2 = df.iloc[mi:].copy()

    # a) Inverser les labels (0 → 1, 1 → 0)
    #    Le modèle qui prédisait bien va maintenant se tromper
    df2[target] = 1 - df2[target]

    # b) Ajouter du bruit gaussien sur les features numériques
    #    Simule un changement de distribution des données réseau
    cols_num = df2[features].select_dtypes(include=np.number).columns
    bruit = np.random.normal(loc=0, scale=1.5, size=df2[cols_num].shape)
    df2[cols_num] = df2[cols_num] + bruit

    # --- Recombiner les deux parties ---
    df_final = pd.concat([df1, df2], ignore_index=True)

    print(f"[Data] Stream avec dérive prêt :")
    print(f"       - {mi} étapes normales")
    print(f"       - {n - mi} étapes avec dérive (à partir de l'étape {mi})")

    return iter_pandas(X=df_final[features], y=df_final[target])


# ============================================================
# FONCTION : Afficher les infos du dataset (pour le notebook)
# ============================================================
def afficher_info_dataset(chemin=None):
    """
    Affiche un résumé du dataset dans le terminal.
    Utile pour documenter dans le notebook.
    """
    df, features, target = charger_dataset(chemin)

    print("\n┌─────────────────────────────────────────┐")
    print("│         Infos dataset UNSW-NB15          │")
    print("├─────────────────────────────────────────┤")
    print(f"│  Lignes totales  : {df.shape[0]:<22}│")
    print(f"│  Features        : {len(features):<22}│")
    print(f"│  Classe 0 (normal) : {df[target].value_counts().get(0, 0):<20}│")
    print(f"│  Classe 1 (attaque): {df[target].value_counts().get(1, 0):<20}│")
    print("└─────────────────────────────────────────┘")

    return df, features, target