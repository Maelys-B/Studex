# Serveur Studex

API Node.js (Express + TypeScript) connectée à MySQL.

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
| GET | `/api/boosters` | stock de boosters du joueur (recalculé avec le temps écoulé) |
| POST | `/api/boosters/open` | ouvre un booster : retire un booster du stock et renvoie les 5 cartes tirées |
