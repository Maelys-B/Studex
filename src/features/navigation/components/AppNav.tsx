import { useLayoutEffect, useRef } from 'react'
import type { FocusEvent } from 'react'
import { NavLink, useLocation } from 'react-router'

type AppNavProps = {
    isAdmin: boolean
    onLogout: () => void
}

const LEAD_STIFFNESS = 240

const STRETCH_RATIO = 1.85

const STRETCH_GROW = 20
const STRETCH_SHRINK = 13

const ARRIVAL_RATIO = 0.06

const NECK_RATIO = 0.41

function buildShape(left: number, right: number, height: number, stretch: number) {
    const width = right - left
    const radius = Math.min(height / 2, width / 2)
    const amount = Math.min(stretch / (height * 1.1), 1)
    const pinch = amount * amount * (3 - 2 * amount)
    const neck = (height / 2) * (1 - NECK_RATIO) * pinch
    const reach = Math.max(width / 2 - radius, 0) * 0.85
    const middle = left + width / 2
    const handle = reach * 0.45

    return [
        `M ${left + radius} 0`,
        `L ${middle - reach} 0`,
        `C ${middle - handle} 0 ${middle - handle} ${neck} ${middle} ${neck}`,
        `C ${middle + handle} ${neck} ${middle + handle} 0 ${middle + reach} 0`,
        `L ${right - radius} 0`,
        `A ${radius} ${radius} 0 0 1 ${right - radius} ${height}`,
        `L ${middle + reach} ${height}`,
        `C ${middle + handle} ${height} ${middle + handle} ${height - neck} ${middle} ${height - neck}`,
        `C ${middle - handle} ${height - neck} ${middle - handle} ${height} ${middle - reach} ${height}`,
        `L ${left + radius} ${height}`,
        `A ${radius} ${radius} 0 0 1 ${left + radius} 0`,
        'Z'
    ].join(' ')
}

function createBlob(nav: HTMLElement, shape: SVGSVGElement, path: SVGPathElement) {
    const getLinks = () => Array.from(nav.querySelectorAll<HTMLElement>('a'))
    const activeIndex = () => Math.max(getLinks().findIndex(link => link.classList.contains('active')), 0)

    const edgesOf = (index: number) => {
        const link = getLinks()[index]
        return { left: link.offsetLeft, right: link.offsetLeft + link.offsetWidth }
    }

    const restWidth = (middle: number) => {
        const words = getLinks().map(link => ({
            middle: link.offsetLeft + link.offsetWidth / 2,
            width: link.offsetWidth
        }))
        const next = words.findIndex(word => word.middle >= middle)
        if (next === 0) return words[0].width
        if (next === -1) return words[words.length - 1].width

        const previous = words[next - 1]
        const progress = (middle - previous.middle) / (words[next].middle - previous.middle)
        return previous.width + (words[next].width - previous.width) * progress
    }

    let goal = activeIndex()
    let { left, right } = edgesOf(goal)
    let movingRight = true
    let leadSpeed = 0
    let pull = 0
    let distance = 0
    let frame = 0
    let lastTime = 0

    const draw = () => {
        const stretch = Math.max(right - left - restWidth((left + right) / 2), 0)
        path.setAttribute('d', buildShape(left, right, shape.clientHeight, stretch))

        for (const link of getLinks()) {
            const middle = link.offsetLeft + link.offsetWidth / 2
            link.toggleAttribute('data-lit', middle > left && middle < right)
        }
    }

    const snap = () => {
        ;({ left, right } = edgesOf(goal))
        leadSpeed = 0
        pull = 0
        draw()
    }

    const tick = (time: number) => {
        const delta = Math.min((time - lastTime) / 1000, 1 / 30)
        lastTime = time

        const target = edgesOf(goal)
        const leadGoal = movingRight ? target.right : target.left
        let lead = movingRight ? right : left

        leadSpeed += (LEAD_STIFFNESS * (leadGoal - lead) - 2 * Math.sqrt(LEAD_STIFFNESS) * leadSpeed) * delta
        lead += leadSpeed * delta

        const leadGap = Math.abs(leadGoal - lead)
        const pullGoal = leadGap > distance * ARRIVAL_RATIO ? shape.clientHeight * STRETCH_RATIO : 0
        const rate = pullGoal > pull ? STRETCH_GROW : STRETCH_SHRINK
        pull += (pullGoal - pull) * (1 - Math.exp(-rate * delta))

        const width = restWidth((left + right) / 2) + pull
        if (movingRight) {
            right = lead
            left = Math.min(Math.max(left, right - width), target.left)
        } else {
            left = lead
            right = Math.max(Math.min(right, left + width), target.right)
        }

        draw()

        const settled = leadGap < 0.3 && Math.abs(leadSpeed) < 3 && pull < 0.5
            && Math.abs(target.left - left) < 0.3 && Math.abs(target.right - right) < 0.3
        if (settled) {
            frame = 0
            snap()
        } else {
            frame = requestAnimationFrame(tick)
        }
    }

    const goTo = (target: number) => {
        if (target === goal && frame) return

        goal = target
        const edges = edgesOf(goal)
        const nextMovingRight = edges.left + edges.right > left + right
        if (nextMovingRight !== movingRight) leadSpeed = 0
        movingRight = nextMovingRight
        distance = Math.abs(movingRight ? edges.right - right : edges.left - left)

        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            snap()
        } else if (!frame) {
            lastTime = performance.now()
            frame = requestAnimationFrame(tick)
        }
    }

    draw()

    return {
        goToActive: () => goTo(activeIndex()),
        goToLink: (link: HTMLElement) => goTo(getLinks().indexOf(link)),
        refresh: () => {
            if (!frame) snap()
        },
        stop: () => {
            cancelAnimationFrame(frame)
            frame = 0
        }
    }
}

export function AppNav({ isAdmin, onLogout }: AppNavProps) {
    const { pathname } = useLocation()
    const linksRef = useRef<HTMLDivElement>(null)
    const shapeRef = useRef<SVGSVGElement>(null)
    const pathRef = useRef<SVGPathElement>(null)
    const blobRef = useRef<ReturnType<typeof createBlob>>(null)

    useLayoutEffect(() => {
        const links = linksRef.current
        const shape = shapeRef.current
        const path = pathRef.current
        if (!links || !shape || !path) return

        const blob = createBlob(links, shape, path)
        blobRef.current = blob
        const observer = new ResizeObserver(() => blob.refresh())
        observer.observe(links)
        return () => {
            observer.disconnect()
            blob.stop()
        }
    }, [])

    useLayoutEffect(() => {
        blobRef.current?.goToActive()
    }, [pathname, isAdmin])

    const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget)) blobRef.current?.goToActive()
    }

    const pages = [
        { to: '/', label: 'Boosters' },
        { to: '/ma-carte', label: 'Ma carte' },
        { to: '/collection', label: 'Collection' },
        ...(isAdmin ? [{ to: '/admin', label: 'Modération' }] : []),
        { to: '/amis', label: 'Amis' }
    ]

    return (
        <nav className="app-nav">
            <div
                className="app-nav__links"
                ref={linksRef}
                onMouseLeave={() => blobRef.current?.goToActive()}
                onBlur={handleBlur}
            >
                <svg className="app-nav__shape" ref={shapeRef} aria-hidden="true">
                    <path ref={pathRef} />
                </svg>
                {pages.map(page => (
                    <NavLink
                        key={page.to}
                        to={page.to}
                        onMouseEnter={e => blobRef.current?.goToLink(e.currentTarget)}
                        onFocus={e => blobRef.current?.goToLink(e.currentTarget)}
                    >
                        {page.label}
                    </NavLink>
                ))}
            </div>

            <button className="app-nav__logout" onClick={onLogout} aria-label="Se déconnecter">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
                </svg>
                <span>Se déconnecter</span>
            </button>
        </nav>
    )
}
