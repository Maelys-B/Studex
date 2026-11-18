const FORBIDDEN_WORDS = [
    'connard', 'connasse', 'salope', 'pute', 'putain', 'merde', 'enculer', 'encule',
    'pd', 'fdp', 'ntm', 'nazi', 'hitler', 'viol', 'bite', 'couille', 'nique', 'niquer'
]

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' }

function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[013457@$]/g, c => LEET[c])
}

export function containsForbiddenWord(text: string): boolean {
    const normalized = normalize(text)

    const words = normalized.split(/[^a-z]+/).filter(Boolean)
    if (words.some(word => FORBIDDEN_WORDS.includes(word))) return true

    const compact = normalized.replace(/[^a-z]/g, '')
    return FORBIDDEN_WORDS.some(word => word.length >= 5 && compact.includes(word))
}