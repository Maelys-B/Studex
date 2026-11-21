import { prisma } from '../lib/prisma.js'
import type { ReportReason } from '../generated/prisma/client.js'

export type ReportData = {
    reporter_id: number,
    reported_user_id: number | null,
    card_id: number | null,
    reason: ReportReason,
    message: string | null,
}

export const reportRepository = {
    create(data: ReportData) {
        return prisma.report.create({ data })
    },
}
