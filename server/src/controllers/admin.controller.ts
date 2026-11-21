import type { Request, Response } from 'express'
import { HttpError } from '../errors/HttpError.js'
import { adminService } from '../services/admin.service.js'

export const adminController = {
    async listPendingCards(_req: Request, res: Response) {
        res.json(await adminService.listPendingCards())
    },

    async setCardStatus(req: Request, res: Response) {
        const status = req.body?.status
        if (status !== 'approved' && status !== 'rejected') {
            throw new HttpError(400, 'Statut invalide')
        }

        const cardId = Number(req.params.id)
        if (!Number.isInteger(cardId)) throw new HttpError(404, 'Carte introuvable')

        await adminService.setCardStatus(cardId, status)
        res.json({ status })
    },
}
