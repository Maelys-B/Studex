import type { Avatar } from '../../boosters/types'

// head : petit décalage de la tête propre à chaque pose (x et y en % de l'image, rotate en degrés)
export const POSES = [
    { id: 'debout', label: 'Debout',     head: { x: 0, y: 0, rotate: 0 } },
    { id: 'cafe',   label: 'Café',       head: { x: 0, y: 0, rotate: 0 } },
    { id: 'ordi',   label: 'Ordinateur', head: { x: 0, y: 0, rotate: 0 } }
] as const

export const SKIN_TONES = ['#ffe3d0', '#f1c27d', '#c68642', '#8d5524'] as const

const OUTFITS_PER_POSE = 4

// Calques de bas en haut : la peau et la tenue dépendent de la pose
export const AVATAR_ORDER = ['skin', 'outfit', 'mouth', 'eyes', 'hair'] as const satisfies readonly (keyof Avatar)[]

// Ordre des choix dans le formulaire
export const AVATAR_CHOICES = ['pose', ...AVATAR_ORDER] as const satisfies readonly (keyof Avatar)[]

const files = import.meta.glob('./avatar/*.webp', { eager: true, import: 'default' }) as Record<string, string>

const file = (name: string) => files[`./avatar/${name}.webp`]
const count = (prefix: string) => Object.keys(files).filter(f => f.startsWith(`./avatar/${prefix}_`)).length

export function getAvatarPart(category: keyof Avatar, avatar: Avatar): string | undefined {
    const pose = POSES[avatar.pose]?.id
    if (category === 'skin') return file(`body_${pose}`)
    if (category === 'outfit') return file(`outfit_${pose}_${avatar.outfit}`)
    return file(`${category}_${avatar[category]}`)
}

// Accessoire dessiné devant le personnage (gobelet, ordinateur), absent pour certaines poses
export const getPoseProp = (poseIndex: number) => file(`prop_${POSES[poseIndex]?.id}`)

export const AVATAR_COUNTS: Record<keyof Avatar, number> = {
    pose: POSES.length,
    skin: SKIN_TONES.length,
    outfit: OUTFITS_PER_POSE,
    mouth: count('mouth'),
    eyes: count('eyes'),
    hair: count('hair')
}
