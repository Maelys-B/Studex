export type Talent = 'striker' | 'guardian' | 'energizer'

export const TALENTS: { id: Talent, label: string, description: string}[] = [
    { id: 'striker', label: 'Attaquant', description: '+10 dégâts sur toutes les attaques de ton équipe' },
    { id: 'guardian', label: 'Gardien', description: '+15 de bouclier sur toutes les défenses de ton équipe' },
    { id: 'energizer', label: 'Énergique', description: '+1 énergie au début du combat' },
]