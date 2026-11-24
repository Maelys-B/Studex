import type { Action, PlayerView } from '../../shared/type.js'

const ABILITY_CHANCE = 0.7

function pick<T>(items: T[], random: () => number): T {
    return items[Math.floor(random() * items.length)]
}

export function chooseRandomAction(view: PlayerView, random: () => number): Action {
    const actions = view.legalActions
    if (actions.length === 0) {
        throw new Error('Aucune action possible')
    }

    const abilities = actions.filter(action => action.type === 'USE_ABILITY')
    if (abilities.length === 0) {
        return pick(actions, random)
    }
    if (random() < ABILITY_CHANCE) {
        return pick(abilities, random)
    }
    return pick(actions.filter(action => action.type !== 'PASS'), random)
}