export type Talent = 'striker' | 'guardian' | 'energizer'

export type TalentEffect = {
    attackBonus?: number,
    defenseBonus?: number,
    startEnergy?: number,
}

export const TALENTS: Record<Talent, TalentEffect> = {
    striker: { attackBonus: 10 },
    guardian: { defenseBonus: 15},
    energizer: { startEnergy: 1 }
}
