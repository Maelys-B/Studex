import type { Avatar } from '../types.js'

export const FRAME_COLORS = ['#2aa9ad', '#ffe100', '#00e5ff', '#0800ff', '#e100ff']

const AVATAR_LIMITS: Record<keyof Avatar, number> = {
    skin: 4, hair: 6, eyes: 5, mouth: 4, outfit: 6
}

export type StudentCardInput = {
    first_name: string,
    last_name: string,
    subtitle: string,
    color: string,
    avatar: Avatar
}

function isValidChoice(value: unknown, max: number): value is number {
    return Number.isInteger(value) && (value as number) >= 0 && (value as number) < max
}

export function validateStudentCard(body: any): StudentCardInput | string {
    const first_name = typeof body?.first_name === 'string' ? body.first_name.trim() : ''
    const rawLastName = typeof body?.last_name === 'string' ? body.last_name.trim() : ''
    const subtitle = typeof body?.subtitle === 'string' ? body.subtitle.trim() : ''

    const last_name = rawLastName.charAt(0).toUpperCase()

    const NAME_PATTERN = /^[\p{L}][\p{L} '-]*$/u
    const SUBTITLE_PATTERN = /^[\p{L}\p{N} .,!?'’:()-]*$/u

    if (first_name.length < 2 || first_name.length > 20) return 'Le prénom doit faire entre 2 et 20 caractères'
    if (!NAME_PATTERN.test(first_name)) return 'Le prénom contient des caractères non autorisés'
    if (last_name.length === 0) return 'Le nom doit faire dot faire au moins 1 caractères'
    if (!NAME_PATTERN.test(rawLastName)) return 'Le nom contient des caractères non autorisés'
    if (subtitle.length > 80) return "L'accroche ne doit pas dépasser 80 caractères"
    if (!SUBTITLE_PATTERN.test(subtitle)) return "L'accroche contient des caractères non autorisés"
    if (!FRAME_COLORS.includes(body?.color)) return 'Couleur invalide'

    const avatar = {} as Avatar
    for (const key of Object.keys(AVATAR_LIMITS) as (keyof Avatar)[]) {
        const value = body?.avatar?.[key]
        if (!isValidChoice(value, AVATAR_LIMITS[key])) return `Avatar invalide : ${key}`
        avatar[key] = value
    }

    return {first_name, last_name, subtitle, color:body.color, avatar}
}