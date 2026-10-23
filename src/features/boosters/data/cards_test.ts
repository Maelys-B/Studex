import type { Card } from '../types'
import carteEtudiante01 from '../assets/carte_étudiante/carte_étudiante_01.png'
import carteEtudiante02 from '../assets/carte_étudiante/carte_étudiante_02.png'
import carteEtudiante03 from '../assets/carte_étudiante/carte_étudiante_03.png'
import carteEtudiante04 from '../assets/carte_étudiante/carte_étudiante_04.png'
import carteEtudiante05 from '../assets/carte_étudiante/carte_étudiante_05.png'

export const CARD_POOL: Card[] = [
    // ---------- collection ----------
    {
        id: 31,
        name: 'Maëlys.B',
        subtitle: 'Adore le tennis mais elle est nul',
        image: carteEtudiante01,
        color: '#2aa9ad',
        rarity: 'uncommun',
        type: 'student'
    },
    {
        id: 32,
        name: 'Théo.B',
        subtitle: 'Le roi du style entrepreneur',
        image: carteEtudiante02,
        color: '#ffe100',
        rarity: 'rare',
        type: 'student'
    },
    {
        id: 33,
        name: 'Mahé.P',
        subtitle: 'Un chien',
        image: carteEtudiante03,
        color: '#00e5ff',
        rarity: 'commun',
        type: 'student'
    },
    {
        id: 34,
        name: 'Antoine.A',
        subtitle: 'Un canadian Pinguoin',
        image: carteEtudiante04,
        color: '#0800ff',
        rarity: 'epic',
        type: 'student'
    },
    {
        id: 35,
        name: 'Julien.V',
        subtitle: 'Le roi des girondins',
        image: carteEtudiante05,
        color: '#e100ff',
        rarity: 'legendary',
        type: 'student'
    },
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
]
