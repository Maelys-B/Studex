import { useLayoutEffect, useRef } from 'react'
import type { FocusEvent } from 'react'
import { NavLink, useLocation } from 'react-router'

type AppNavProps = {
    isAdmin: boolean
    onLogout: () => void
}

// Raideur des ressorts : le bord qui mène part vite, le bord qui suit traîne et crée l'étirement
const LEAD_STIFFNESS = 420
const TRAIL_STIFFNESS = 160

// Le col mesure 41 % de la hauteur de la forme quand elle est étirée au maximum, comme sur le modèle
const NECK_RATIO = 0.41

// Sous 1, le ressort dépasse à peine sa cible avant de se poser, ce qui rend l'arrivée plus souple
const DAMPING = 0.82

// Dessine une pastille de left à right ; plus elle est étirée, plus son milieu se creuse
function buildShape(left: number, right: number, height: number, stretch: number) {
    const width = right - left
    const radius = Math.min(height / 2, width / 2)
    const amount = Math.min(stretch / (height * 1.6), 1)
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

    let index = activeIndex()
    let goal = index
    let { left, right } = edgesOf(index)
    let leftSpeed = 0
    let rightSpeed = 0
    let frame = 0
    let lastTime = 0

    const draw = () => {
        const edges = edgesOf(index)
        const stretch = Math.max(right - left - (edges.right - edges.left), 0)
        path.setAttribute('d', buildShape(left, right, shape.clientHeight, stretch))

        // Un mot passe en foncé dès que le blanc est derrière lui
        for (const link of getLinks()) {
            const middle = link.offsetLeft + link.offsetWidth / 2
            link.toggleAttribute('data-lit', middle > left && middle < right)
        }
    }

    const snap = () => {
        index = goal
        ;({ left, right } = edgesOf(index))
        leftSpeed = 0
        rightSpeed = 0
        draw()
    }

    const tick = (time: number) => {
        const delta = Math.min((time - lastTime) / 1000, 1 / 30)
        lastTime = time

        const edges = edgesOf(index)
        const movingRight = edges.left + edges.right > left + right
        const leftStiffness = movingRight ? TRAIL_STIFFNESS : LEAD_STIFFNESS
        const rightStiffness = movingRight ? LEAD_STIFFNESS : TRAIL_STIFFNESS

        leftSpeed += (leftStiffness * (edges.left - left) - 2 * DAMPING * Math.sqrt(leftStiffness) * leftSpeed) * delta
        rightSpeed += (rightStiffness * (edges.right - right) - 2 * DAMPING * Math.sqrt(rightStiffness) * rightSpeed) * delta
        left += leftSpeed * delta
        right += rightSpeed * delta

        // Mot par mot : on vise le mot suivant juste avant d'atteindre le mot actuel, pour ne pas marquer d'arrêt
        const leadGap = movingRight ? edges.right - right : left - edges.left
        const trailGap = movingRight ? edges.left - left : right - edges.right
        const wordWidth = edges.right - edges.left
        if (index !== goal && leadGap < wordWidth * 0.25 && trailGap < wordWidth) {
            index += Math.sign(goal - index)
        }

        draw()

        const settled = index === goal
            && Math.abs(edges.left - left) < 0.3 && Math.abs(edges.right - right) < 0.3
            && Math.abs(leftSpeed) < 3 && Math.abs(rightSpeed) < 3
        if (settled) {
            frame = 0
            snap()
        } else {
            frame = requestAnimationFrame(tick)
        }
    }

    const goTo = (target: number) => {
        goal = target
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
        // La taille de la barre suit l'écran et le chargement de la police
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
