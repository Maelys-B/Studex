import boosterImage from "../assets/booster/booster.webp"
import dropsImage from "../assets/booster/gouttes.webp"
import openingVideo from "../assets/booster/court.webm"
import "../assets/BoosterPack.css"

type BoosterPackProps = {
    disabled: boolean
    opening: boolean
    onClick: () => void
    onAnimationEnd: () => void
}

export function BoosterPack({ disabled, opening, onClick, onAnimationEnd }: BoosterPackProps) {
    return (
        <div className="pack-scene">
            <div className={`pack-plinth${disabled ? " pack-plinth--off" : ""}`} aria-hidden="true" />
            {opening ? (
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
            ) : (
                <>
                    <img className="pack-drops" src={dropsImage} alt="" draggable={false} />
                    <button className="pack-button" onClick={onClick} disabled={disabled}>
                        <img
                            className={`pack${disabled ? " pack--empty" : ""}`}
                            src={boosterImage}
                            alt="Booster Studex"
                            draggable={false}
                        />
                    </button>
                </>
            )}
        </div>
    )
}
