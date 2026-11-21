import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const { DB_USER = 'root', DB_PASSWORD = '', DB_HOST = 'localhost', DB_PORT = '3306', DB_NAME = 'studex' } = process.env
const credentials = DB_PASSWORD
    ? `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}`
    : encodeURIComponent(DB_USER)

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: { path: 'prisma/migrations' },
    datasource: { url: `mysql://${credentials}@${DB_HOST}:${DB_PORT}/${DB_NAME}` },
})
