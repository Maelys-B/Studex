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
                        {attack.kind === 'defense' ? (
                            <strong className="bcard__shield" aria-label={`Bouclier ${attack.damage}`}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" />
                                </svg>
                                {attack.damage}
                            </strong>
                        ) : (
                            <strong>{attack.damage}</strong>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}