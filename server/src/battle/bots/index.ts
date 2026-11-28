import type { ChooseAction } from '../room.js'
import { chooseRandomAction } from './randomBot.js'

export type BotProfile ={
    userId: number,
    name: string,
    chooseAction: ChooseAction
}

export const BOTS = new Map<string, BotProfile>([
    ['random', { userId: -1, name: 'Bot aléatoire', chooseAction: chooseRandomAction }]
])