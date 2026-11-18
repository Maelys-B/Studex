export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function normalizeEmail(rawEmail: string): string {
    return rawEmail.trim().toLowerCase()
}
