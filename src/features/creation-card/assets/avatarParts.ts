import type { Avatar } from '../../boosters/types'

export const POSES = [
    { id: 'standing', label: 'Debout',     head: { x: 0, y: 0, rotate: 0 } },
    { id: 'coffee',   label: 'Café',       head: { x: 0, y: 0, rotate: 0 } },
    { id: 'computer', label: 'Ordinateur', head: { x: 0, y: 0, rotate: 0 } }
] as const

export const DEFAULT_SKIN = '#f1c27d'

const OUTFITS_PER_POSE = 4

export type AvatarChoice = Exclude<keyof Avatar, 'skin'>

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

export const getPoseProp = (poseIndex: number) => file(`prop_${POSES[poseIndex]?.id}`)

export const AVATAR_COUNTS: Record<AvatarChoice, number> = {
    pose: POSES.length,
    outfit: OUTFITS_PER_POSE,
    mouth: count('mouth'),
    eyes: count('eyes'),
    hair: count('hair')
}
