const images = import.meta.glob<string>('./cards_*/*.webp', {
    eager: true,
    import: 'default'
})

const imagesByName: Record<string, string> = {}
for (const [path, url] of Object.entries(images)) {
    imagesByName[path.split('/').pop()!] = url
}

export function getCardImage(fileName?: string): string | undefined {
    if (!fileName) return undefined
    return imagesByName[fileName]
}
