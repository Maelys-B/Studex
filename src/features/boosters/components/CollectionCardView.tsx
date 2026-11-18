import type { CSSProperties } from "react";
import type { Card } from "../types";
import { RARITY_COLORS } from "./rarityColors";
import { getCardImage } from "../assets/cardImages";
import "../assets/CollectionCardView.css";

export function CollectionCardView({ card }: { card: Card}) {
    return (
        <div className="ccard" style={{ '--frame': RARITY_COLORS[card.rarity] } as CSSProperties}>
            <div className="ccard__art">
                <img src={getCardImage(card.image)} alt="" />
            </div>
            <h2 className="ccard__title">{card.name}</h2>
            <div className="ccard__text">
                <p>{card.description}</p>
                <span className="ccard__number">{card.position_collection}</span>
            </div>
        </div>
    )
}