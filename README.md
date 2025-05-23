📱📦 Projet : Application Mobile de Gestion des Commandes & proformmas
=========================================================================

Ce projet est divisé en deux parties distinctes hébergées sur GitHub :

1. **Frontend (React Native)** : https://github.com/rymamr/Gestion_commandes
2. **Backend API (PHP)** : https://github.com/rymamr/gestion_commandes_api

Chacune des parties contient son propre guide d'installation et de configuration.

========================================================

🟦 README - Frontend React Native (https://github.com/rymamr/Gestion_commandes)
-------------------------------------------------------------------------------

# 📱 Application Mobile - Gestion des Commandes

Cette application mobile, développée avec **React Native**, permet de gérer les produits, les clients, les proformas et les commandes.  
Elle est utilisée principalement dans un contexte commercial (exemple : entreprise MS Contact).

## 🚀 Fonctionnalités

- 🔐 Connexion utilisateur
- 📦 Gestion des produits
- 👥 Gestion des clients
- 🧾 Création de proformas
- 📋 Création des commandes

## 🛠️ Prérequis

- Node.js
- Expo CLI
- Un émulateur Android/iOS ou un appareil mobile réel
- Connexion au backend PHP

## ▶️ Installation

```bash
git clone https://github.com/rymamr/Gestion_commandes.git
cd Gestion_commandes
npm install
npx expo start
```

## 🔗 Connexion à l’API PHP

Cette application mobile communique avec une API développée en PHP :  
👉 [gestion_commandes_api (backend)](https://github.com/rymamr/gestion_commandes_api)

### 🔧 Configuration de l’URL de l’API

Dans les fichiers source, configurez l’URL vers votre backend PHP (ex : `clients.tsx`, `produits.tsx`) :

```js
const API_URL = "http://192.168.1.100/gestion_commandes_api/";
```

> Remplacez `192.168.1.100` par l’adresse IP locale de votre PC

---

🧑‍💻 Auteur : [rymamr](https://github.com/rymamr)

========================================================
