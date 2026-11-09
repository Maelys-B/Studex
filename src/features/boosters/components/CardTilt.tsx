import { useRef } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import '../assets/CardTilt.css'

const MAX_TILT_DEG = 14

export function CardTilt({ children }: { children: ReactNode }) {
    const innerRef = useRef<HTMLDivElement>(null)

    const handleMove = (e: PointerEvent<HTMLDivElement>) => {
        const inner = innerRef.current
        if (!inner || e.pointerType !== 'mouse') return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1

        inner.style.setProperty('--tilt-x', `${-y * MAX_TILT_DEG}deg`)
        inner.style.setProperty('--tilt-y', `${x * MAX_TILT_DEG}deg`)
        inner.setAttribute('data-pressed', '')
    }

    const handleLeave = () => {
        const inner = innerRef.current
        if (!inner) return

        inner.style.removeProperty('--tilt-x')
        inner.style.removeProperty('--tilt-y')
        inner.removeAttribute('data-pressed')
    }

    return (
        <div className="card-tilt" onPointerMove={handleMove} onPointerLeave={handleLeave}>
            <div className="card-tilt__inner" ref={innerRef}>
                {children}
            </div>
        </div>
    )
}
