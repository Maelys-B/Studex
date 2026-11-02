import boosterImage from "../assets/booster/booster.webp"
import openingVideo from "../assets/booster/court.webm"
import "../assets/BoosterPack.css"

type BoosterPackProps = {
    disabled: boolean
    opening: boolean
    onClick: () => void
    onAnimationEnd: () => void
}

export function BoosterPack({ disabled, opening, onClick, onAnimationEnd }: BoosterPackProps) {
    if (opening) {
        return (
            <div className="pack-slot">
                <video
                    className="pack-video"
                    src={openingVideo}
                    autoPlay
                    muted
                    playsInline
                    onEnded={onAnimationEnd}
                />
            </div>
        )
    }
    return (
        <button className="pack-button" onClick={onClick} disabled={disabled}>
            <img
                className={`pack${disabled ? " pack--empty" : ""}`}
                src={boosterImage}
                alt="Booster Studex"
                draggable={false}
            />
        </button>
    )
}
