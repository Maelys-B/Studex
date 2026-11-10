// Cards received from the server only contain the file name (e.g. collection_01.webp).
// The matching illustration is looked up here in the cards_* folders of assets.
// File names must therefore be unique across folders.
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
