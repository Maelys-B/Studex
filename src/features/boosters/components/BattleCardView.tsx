import type { CSSProperties } from "react";
import type { Card } from "../types";
import { RARITY_COLORS } from "./rarityColors";
import { getCardImage } from "../assets/cardImages";
import "../assets/BattleCardView.css";

export function BattleCardView({ card }: { card: Card}) {
    return (
        <div className="bcard" style={{ '--frame': RARITY_COLORS[card.rarity] } as CSSProperties}>
            <div className="bcard__art">
                <img src={getCardImage(card.image)} alt="" />
                <span className="bcard__number">N° {String(card.position_collection).padStart(3, '0')}</span>
                <span className="bcard__hp"><small>PV</small> {card.hp}</span>
            </div>
            <ul className="bcard__attacks">
                {card.attacks?.map(attack => (
                    <li key={attack.name}>
                        <span className="bcard__cost">
                            {Array.from({ length: attack.cost }, (_, i) => <span key={i}>☕</span>)}
                        </span>
                        <div>
                            <h3>{attack.name}</h3>
                            <p>{attack.description}</p>
                        </div>
                        <strong>{attack.damage}</strong>
                    </li>
                ))}
            </ul>
        </div>
    )
}