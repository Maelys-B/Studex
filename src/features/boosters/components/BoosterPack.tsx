import boosterImage from "../assets/booster/booster.webp"
import "../assets/BoosterPack.css"

export function BoosterPack({ disabled }: { disabled: boolean }) {
    return (
        <img
            className={`pack${disabled ? " pack--empty" : ""}`}
            src={boosterImage}
            alt="Booster Studex"
            draggable={false}
        />
    )
}
