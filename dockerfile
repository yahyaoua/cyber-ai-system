# Dockerfile
# ============================================================
# Containerise l'API FastAPI du système Auto-ML
# ============================================================

# Image de base Python 3.11 légère
FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# ============================================================
# ÉTAPE 1 : Copier et installer les dépendances
# On copie d'abord requirements.txt AVANT le reste du code
# → Docker met en cache cette couche si requirements.txt
#   ne change pas (accélère les rebuilds)
# ============================================================
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# ============================================================
# ÉTAPE 2 : Copier tout le code du projet
# ============================================================
COPY . .

# ============================================================
# ÉTAPE 3 : Exposer le port de l'API
# ============================================================
EXPOSE 8000

# ============================================================
# ÉTAPE 4 : Commande de démarrage
# ============================================================
CMD ["python", "src/api/main.py"]