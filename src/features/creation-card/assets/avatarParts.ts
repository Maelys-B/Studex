import type { Avatar } from '../../boosters/types'

// head: small head offset specific to each pose (x and y in % of the image, rotate in degrees)
export const POSES = [
    { id: 'standing', label: 'Debout',     head: { x: 0, y: 0, rotate: 0 } },
    { id: 'coffee',   label: 'Café',       head: { x: 0, y: 0, rotate: 0 } },
    { id: 'computer', label: 'Ordinateur', head: { x: 0, y: 0, rotate: 0 } }
] as const

export const DEFAULT_SKIN = '#f1c27d'

const OUTFITS_PER_POSE = 4

// Choice per part (everything except skin, which is a free color)
export type AvatarChoice = Exclude<keyof Avatar, 'skin'>

// Order of the choices in the form
export const AVATAR_CHOICES = ['pose', 'outfit', 'mouth', 'eyes', 'hair'] as const satisfies readonly AvatarChoice[]

const files = import.meta.glob('./avatar/*.webp', { eager: true, import: 'default' }) as Record<string, string>

const file = (name: string) => files[`./avatar/${name}.webp`]
const count = (prefix: string) => Object.keys(files).filter(f => f.startsWith(`./avatar/${prefix}_`)).length

export function getAvatarPart(category: keyof Avatar, avatar: Avatar): string | undefined {
    const pose = POSES[avatar.pose]?.id
    if (category === 'skin') return file(`body_${pose}`)
    if (category === 'outfit') return file(`outfit_${pose}_${avatar.outfit}`)
    return file(`${category}_${avatar[category]}`)
}

// Prop drawn in front of the character (cup, computer), missing for some poses
export const getPoseProp = (poseIndex: number) => file(`prop_${POSES[poseIndex]?.id}`)

export const AVATAR_COUNTS: Record<AvatarChoice, number> = {
    pose: POSES.length,
    outfit: OUTFITS_PER_POSE,
    mouth: count('mouth'),
    eyes: count('eyes'),
    hair: count('hair')
}
