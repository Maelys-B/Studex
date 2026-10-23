import type { Card } from '../types'

export const CARD_POOL: Card[] = [
    // ---------- collection ----------
    { id: 1, name: 'Mon ordi qui rame', rarity: 'commun', type: 'collection' },
    { id: 2, name: 'Le café tiède', rarity: 'commun', type: 'collection' },
    { id: 3, name: 'La salle 204 sans prise', rarity: 'uncommun', type: 'collection' },
    { id: 4, name: 'Le TP de 8h', rarity: 'uncommun', type: 'collection' },
    { id: 5, name: 'Le groupe de projet fantôme', rarity: 'rare', type: 'collection' },
    { id: 6, name: 'La cafèt\' en fin de mois', rarity: 'rare', type: 'collection' },
    { id: 7, name: 'Le prof qui a oublié le micro', rarity: 'epic', type: 'collection' },
    { id: 8, name: 'La nuit blanche avant le rendu', rarity: 'epic', type: 'collection' },
    { id: 9, name: 'Le 20/20 mythique', rarity: 'legendary', type: 'collection' },
    { id: 10, name: 'Le diplôme en poche', rarity: 'legendary', type: 'collection' },

    // ---------- battle ----------
    { id: 11, name: 'Ça marche sur ma machine', rarity: 'commun', type: 'battle' },
    { id: 12, name: 'Café de la machine', rarity: 'commun', type: 'battle' },
    { id: 13, name: 'Le Wi-Fi de l\'école', rarity: 'uncommun', type: 'battle' },
    { id: 14, name: 'Ctrl+Z', rarity: 'uncommun', type: 'battle' },
    { id: 15, name: 'Rendu à 23h59', rarity: 'rare', type: 'battle' },
    { id: 16, name: 'Stack Overflow à la rescousse', rarity: 'rare', type: 'battle' },
    { id: 17, name: 'git push --force', rarity: 'epic', type: 'battle' },
    { id: 18, name: 'Le merge conflict', rarity: 'epic', type: 'battle' },
    { id: 19, name: 'rm -rf /', rarity: 'legendary', type: 'battle' },
    { id: 20, name: 'Le serveur en prod un vendredi', rarity: 'legendary', type: 'battle' },

    // ---------- student ----------
    { id: 21, name: 'Alice Martin', rarity: 'commun', type: 'student' },
    { id: 22, name: 'Bastien Leroy', rarity: 'commun', type: 'student' },
    { id: 23, name: 'Chloé Dubois', rarity: 'uncommun', type: 'student' },
    { id: 24, name: 'David Moreau', rarity: 'uncommun', type: 'student' },
    { id: 25, name: 'Emma Laurent', rarity: 'rare', type: 'student' },
    { id: 26, name: 'Farid Benali', rarity: 'rare', type: 'student' },
    { id: 27, name: 'Gaëlle Petit', rarity: 'epic', type: 'student' },
    { id: 28, name: 'Hugo Roux', rarity: 'epic', type: 'student' },
    { id: 29, name: 'Inès Garnier', rarity: 'legendary', type: 'student' },
    { id: 30, name: 'Jules Fontaine', rarity: 'legendary', type: 'student' },
]
