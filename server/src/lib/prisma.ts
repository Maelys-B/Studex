import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient, Prisma } from '../generated/prisma/client.js'

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    allowPublicKeyRetrieval: true,
    // MySQL renvoie les TIMESTAMP dans le fuseau de la session, Prisma les lit comme de l'UTC :
    // on met la session en UTC pour éviter un décalage d'une ou deux heures sur les dates.
    initSql: "SET time_zone = '+00:00'",
})

export const prisma = new PrismaClient({ adapter })

/** Le client Prisma ou le `tx` d'une transaction : les repositories acceptent les deux. */
export type Db = PrismaClient | Prisma.TransactionClient

/** Erreur P2002 : une contrainte unique est violée (doublon). */
export function isUniqueViolation(err: unknown): boolean {
    return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
}
