import type { Avatar } from '../../boosters/types'
import { POSES, SKIN_TONES, getAvatarPart, getPoseProp } from '../assets/avatarParts'
import '../assets/AvatarView.css'

const HEAD_PARTS = ['mouth', 'eyes', 'hair'] as const

export function AvatarView({ avatar }: { avatar: Avatar }) {
    const pose = POSES[avatar.pose]
    const body = getAvatarPart('skin', avatar)
    const prop = getPoseProp(avatar.pose)

    return (
        <div className="avatar">
            <div className="avatar__layer avatar__skin">
                <img src={body} alt="" draggable={false} />
                <div
                    className="avatar__tint"
                    style={{
                        backgroundColor: SKIN_TONES[avatar.skin],
                        maskImage: `url(${body})`,
                        WebkitMaskImage: `url(${body})`
                    }}
                />
            </div>

            <img className="avatar__layer" src={getAvatarPart('outfit', avatar)} alt="" draggable={false} />

            <div
                className="avatar__layer avatar__head"
                style={{ transform: `translate(${pose.head.x}%, ${pose.head.y}%) rotate(${pose.head.rotate}deg)` }}
            >
                {HEAD_PARTS.map(part => (
                    <img
                        key={part}
                        className="avatar__layer"
                        src={getAvatarPart(part, avatar)}
                        alt=""
                        draggable={false}
                    />
                ))}
            </div>

            {prop && <img className="avatar__layer" src={prop} alt="" draggable={false} />}
        </div>
    )
}
