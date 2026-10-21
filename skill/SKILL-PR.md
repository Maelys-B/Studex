---
name: git-commit-pr
description: Génère des messages de commit au format Conventional Commits (type en anglais, description en français) et des descriptions de Pull Request en français. Se déclenche quand l'utilisateur écrit "commit" (génère le message du commit à partir des changements en cours) ou "PR" (génère titre + description de PR à partir de l'ensemble des commits de la branche/étape).
---

# Git Commit & PR Helper

## Déclencheurs

- L'utilisateur écrit **"commit"** (seul ou dans une phrase courte, ex: "commit", "fais le commit", "commit stp") → générer un message de commit.
- L'utilisateur écrit **"PR"** (seul ou dans une phrase courte, ex: "PR", "fais la PR", "prépare la PR") → générer un titre + une description de PR.

Ne pas déclencher sur ces mots s'ils apparaissent dans un contexte clairement différent (ex: une question générale sur Git, un message qui parle "d'un commit" au passé sans demander d'en générer un).

## Quand "commit" est demandé

1. Inspecter les changements en cours avec `git status` et `git diff` (et `git diff --staged` si des fichiers sont déjà ajoutés).
2. Si rien n'est stagé, analyser les fichiers modifiés/untracked pertinents.
3. Résumer ce qui a été fait, pas comment le diff est écrit ligne à ligne — comprendre l'intention du changement.
4. Produire un message au format **Conventional Commits**, avec le type en anglais et la description en français :
   - Type parmi : `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `perf`, `build`, `ci`
   - Scope optionnel entre parenthèses si pertinent, ex: `feat(navbar):`
   - Une seule phrase courte en français après les deux-points, minuscule, sans point final
   - Pas de corps/liste à puces — une phrase doit suffire à résumer le changement
5. Ne jamais exécuter `git commit` automatiquement sauf si l'utilisateur le demande explicitement — proposer le message, laisser l'utilisateur valider.

### Exemple de sortie

```
feat(shortcodes): ajouter l'affichage de carte leaflet pour les lieux de formation
```

## Quand "PR" est demandé

1. Déterminer la portée : soit tous les commits de la branche courante par rapport à la branche de base (`git log main..HEAD` ou équivalent), soit les changements de l'étape/session en cours si aucun commit n'a encore été fait.
2. Lister les commits concernés avec `git log --oneline <base>..HEAD` pour identifier les types de changements inclus.
3. Générer :
   - **Titre de PR** : une ligne concise, format Conventional Commits (type en anglais, description en français) si un seul type domine (ex: `feat: ajouter la grille de cartes de formation avec filtrage AJAX`), sinon un titre descriptif neutre en français si plusieurs types sont mélangés.
   - **Description de PR** en français, structurée ainsi :
     - **Résumé** : 1-2 phrases sur l'objectif global du changement
     - **Changements** : liste à puces des changements principaux (regrouper par thème si nombreux commits)
     - **Notes** (optionnel) : points d'attention pour le relecteur, dépendances, choses à tester
4. Adapter le niveau de détail à la taille du diff : une petite PR = description courte, une grosse PR = liste plus structurée.
5. Ne pas exécuter de commande de création de PR (`gh pr create`, etc.) sauf si l'utilisateur le demande explicitement — proposer le contenu, laisser l'utilisateur valider.

### Exemple de sortie

**Titre :** `feat: ajouter une grille de cartes de formation responsive avec filtrage AJAX`

**Description :**

**Résumé**
Ajoute une grille de cartes de formation générée dynamiquement via AJAX, avec filtrage et affichage responsive.

**Changements**
- Génération des cartes de formation en AJAX depuis les données ACF
- Correctifs de layout mobile pour les cartes en vedette
- Synchronisation du menu hamburger avec le breakpoint 1024px

**Notes**
- Tester le filtrage sur mobile et desktop avant merge
