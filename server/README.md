# Serveur Studex

API Node.js (Express + TypeScript) connectée à MySQL avec l'ORM Prisma.

## Installation (une seule fois)

1. Lancer **WAMP** et attendre que l'icône soit verte.
2. Créer une base vide `studex` dans phpMyAdmin (http://localhost/phpmyadmin).
3. Copier `.env.example` en `.env`, puis mettre son mot de passe MySQL après `DB_PASSWORD=` (vide par défaut avec WAMP).
4. Installer les dépendances (génère aussi le client Prisma) :
   ```bash
   cd server
   npm install
   ```
5. Créer les tables puis ajouter les cartes du jeu :
   ```bash
   npm run db:deploy
   npm run db:seed
   ```

### Base déjà créée avec l'ancien `db/schema.sql`

Les tables existent déjà : il faut dire à Prisma que la première migration est déjà en place, puis appliquer les suivantes.

```bash
npx prisma migrate resolve --applied 0_init
npm run db:deploy
```

## Base de données (Prisma)

- Le schéma est dans `prisma/schema.prisma`, les migrations dans `prisma/migrations/`.
- Après une modification du schéma : `npm run db:migrate -- --name ce_qui_change` (crée et applique la migration, puis régénère le client).
- Prisma ne gère pas les contraintes `CHECK` : celle de `reports` (`one_target`) est écrite à la main dans `prisma/migrations/0_init/migration.sql`.
- **WAMP crée les nouvelles tables en MyISAM** (sans clés étrangères ni transactions). Avant de créer une table avec Prisma, mettre `default_storage_engine=InnoDB` dans le `my.ini` de MySQL (icône WAMP → MySQL → my.ini) puis redémarrer WAMP. Sinon, ajouter `ENGINE=InnoDB` à la main dans le SQL de la migration (`npm run db:migrate -- --create-only --name ...`).

## Architecture

Chaque requête traverse les couches dans cet ordre, et chaque couche n'appelle que celle du dessous :

| Dossier | Rôle |
|---|---|
| `src/routes/` | relie une URL à ses middlewares et à son controller |
| `src/controllers/` | lit la requête, vérifie le format des données (400), appelle le service et envoie la réponse |
| `src/services/` | règles du jeu et transactions ; signale une erreur avec `HttpError` (404, 409…) |
| `src/repositories/` | seul endroit qui parle à la base, via Prisma |
| `src/middleware/` | `verifyToken`, `verifyAdmin`, `requireCard`, et `errorHandler` qui transforme les erreurs en réponses JSON |
| `src/lib/prisma.ts` | le client Prisma partagé par toute l'application |

Les fichiers de logique pure (`boosterLogic.ts`, `wordFilter.ts`, `authValidation.ts`, `studentCardValidation.ts`) et `mailer.ts` sont dans `src/services/`.

## Lancer le serveur

```bash
cd server
npm run dev
```

Le serveur tourne sur http://localhost:3000 et redémarre tout seul à chaque modification.

## Routes

🔒 : token JWT requis (`Authorization: Bearer <token>`). 🃏 : le joueur doit avoir créé sa carte et elle ne doit pas être refusée. 👑 : réservé aux admins.

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| GET | `/api/health` | | vérifier que le serveur répond |
| POST | `/api/auth/register` | | créer un compte |
| POST | `/api/auth/login` | | se connecter |
| GET | `/api/auth/profile` | 🔒 | joueur connecté |
| PATCH | `/api/profile` | 🔒 | modifier son pseudo et son e-mail |
| PATCH | `/api/profile/password` | 🔒 | changer son mot de passe |
| GET | `/api/cards` | | cartes validées du jeu |
| GET | `/api/cards/showcase` | | cartes de la vitrine de connexion |
| GET | `/api/cards/mine` | 🔒 | sa carte étudiante |
| POST | `/api/cards/mine` | 🔒 | créer sa carte étudiante (à valider par un admin) |
| PUT | `/api/cards/mine` | 🔒 | modifier sa carte (repasse en attente) |
| GET | `/api/boosters` | 🔒 🃏 | stock de boosters (recalculé avec le temps écoulé) |
| POST | `/api/boosters/open` | 🔒 🃏 | ouvrir un booster et recevoir les 5 cartes tirées |
| GET | `/api/collection` | 🔒 🃏 | cartes du joueur |
| DELETE | `/api/collection` | 🔒 🃏 | retirer un exemplaire de cartes, ou toutes leurs copies (`all: true`) |
| GET | `/api/friends` | 🔒 🃏 | liste d'amis |
| GET | `/api/friends/search?q=` | 🔒 🃏 | chercher des joueurs par pseudo |
| POST | `/api/friends/requests` | 🔒 🃏 | envoyer une demande d'ami |
| GET | `/api/friends/requests` | 🔒 🃏 | demandes reçues |
| PATCH | `/api/friends/requests/:id` | 🔒 🃏 | accepter ou refuser une demande |
| DELETE | `/api/friends/:userId` | 🔒 🃏 | retirer un ami |
| POST | `/api/reports` | 🔒 | signaler une carte ou un joueur (e-mail envoyé aux admins) |
| GET | `/api/admin/cards/pending` | 🔒 👑 | cartes en attente de validation |
| PATCH | `/api/admin/cards/:id` | 🔒 👑 | valider ou refuser une carte |
