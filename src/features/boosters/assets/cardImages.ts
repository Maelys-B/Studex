// Les cartes reçues du serveur contiennent seulement le nom du fichier (ex. collection_01.webp).
// On retrouve ici l'illustration correspondante dans les dossiers carte_* de assets.
// Les noms de fichiers doivent donc être uniques d'un dossier à l'autre.
const images = import.meta.glob<string>('./carte_*/*.webp', {
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
