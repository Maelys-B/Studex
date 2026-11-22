export type Talent = 'striker' | 'guardian' | 'recruiter'

export type TalentEffect = {
    attackBonus?: number,
    defenseBonus?: number,
    extraReserve?: number,
}

export const TALENTS: Record<Talent, TalentEffect> = {
    striker: { attackBonus: 10 },
    guardian: { defenseBonus: 15},
    recruiter: { extraReserve: 1 }
}
