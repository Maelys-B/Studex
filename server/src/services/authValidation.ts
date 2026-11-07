export const regexMotDePasse = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function nettoyerEmail(rawEmail: string): string {
    return rawEmail.trim().toLowerCase()
}
