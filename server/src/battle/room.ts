import type { Action, PlayerSetup, PlayerView } from '../shared/type.js'

export type ChooseAction = (view: PlayerView, random: () => number) => Action

export type Participant = 
    | { kind: 'human', name: string, setup: PlayerSetup }
    | { kind: 'bot', name: string, setup: PlayerSetup, chooseAction: ChooseAction }

export type CreateRoom = (playerA: Participant, playerB: Participant) => string