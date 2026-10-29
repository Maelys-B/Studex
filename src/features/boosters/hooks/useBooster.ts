import type { BoosterContent, BoosterStatus } from '../types'
import { useCallback, useEffect, useState } from 'react'
import { fetchBoosterStatus, requestOpenBooster } from '../services/boosterApi'

export function useBooster(userId: number) {
    const [content, setContent] = useState<BoosterContent | null>(null)
    const [index, setIndex] = useState(0)
    const [status, setStatus] = useState<BoosterStatus | null>(null)
    const [clockOffset, setClockOffset] = useState(0)
    const [now, setNow] = useState(() => Date.now())
    const [error, setError] = useState<string | null>(null)

    const cards = content ? [...content.collection, content.battle, content.student] : []

    const applyStatus = useCallback((newStatus: BoosterStatus) => {
        setStatus(newStatus)
        setClockOffset(newStatus.serverNow - Date.now())
    }, [])

    const refresh = useCallback(() => {
        fetchBoosterStatus(userId)
            .then(applyStatus)
            .catch((err: Error) => setError(err.message))
    }, [userId, applyStatus])

    useEffect(() => {
        refresh()
    }, [refresh])

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        if (!status?.nextAt) return
        const delay = Math.max(0, status.nextAt - (Date.now() + clockOffset)) + 500
        const id = setTimeout(refresh, delay)
        return () => clearTimeout(id)
    }, [status, clockOffset, refresh])

    const open = async () => {
        try {
            const result = await requestOpenBooster(userId)
            if (!result) {
                refresh()
                return
            }
            applyStatus(result)
            setContent(result.content)
            setIndex(0)
            setError(null)
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
        }
    }

    const next = () => setIndex(i => Math.min(i + 1, cards.length - 1))

    const previous = () => setIndex(i => Math.max(i - 1, 0))

    const close = () => {
        setContent(null)
        setIndex(0)
    }

    const msBeforeNext = status?.nextAt
        ? Math.max(0, status.nextAt - (now + clockOffset))
        : 0

    return {
        currentCard: cards[index],
        isLast: index === cards.length - 1,
        index,
        cards,
        stored: status?.stored ?? 0,
        max: status?.max ?? 0,
        msBeforeNext,
        error,
        open,
        next,
        previous,
        close
    }
}
