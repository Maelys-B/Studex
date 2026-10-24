# Serveur Studex

API Node.js (Express + TypeScript) connectée à MySQL.

## Installation (une seule fois)

1. Lancer **WAMP** et attendre que l'icône soit verte.
2. Créer la base : dans phpMyAdmin (http://localhost/phpmyadmin), onglet **SQL**, exécuter le contenu de `db/schema.sql`, puis celui de `db/seed.sql`.
3. Installer les dépendances :
   ```bash
   cd server
   npm install
   ```
4. Copier `.env.example` en `.env`, puis mettre son mot de passe MySQL après `DB_PASSWORD=` (vide par défaut avec WAMP).

## Lancer le serveur

```bash
cd server
npm run dev
```

Le serveur tourne sur http://localhost:3000 et redémarre tout seul à chaque modification.

## Routes

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/health` | vérifier que le serveur répond |
| GET | `/api/cards` | toutes les cartes du jeu |
