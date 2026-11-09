import type { ReactNode } from 'react'
import '../assets/ui.css'

const SPARK = 'M0 0C22 -5 52 -13 66 -9C74 -6 74 3 67 7C52 14 22 6 0 0Z'

export function Sparks({ className = '' }: { className?: string }) {
    return (
        <svg className={`page-sparks ${className}`} viewBox="0 0 60 60" aria-hidden="true">
            <path d={SPARK} transform="translate(6 30) rotate(-58) scale(0.55)" />
            <path d={SPARK} transform="translate(8 34) rotate(-18) scale(0.62)" />
            <path d={SPARK} transform="translate(8 40) rotate(16) scale(0.5)" />
        </svg>
    )
}

export function PageTitle({ children }: { children: ReactNode }) {
    return (
        <h1 className="page-title">
            {children}
            <Sparks />
            <svg className="page-title__line" viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="page-title-swoosh">
                        <stop offset="0" stopColor="#fff" />
                        <stop offset="1" stopColor="#35d4e8" />
                    </linearGradient>
                </defs>
                <path d="M2 20C60 8 150 6 238 4L236 13C150 13 70 16 6 24Z" />
            </svg>
        </h1>
    )
}
