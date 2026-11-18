import type { User } from '../../auth/types'
import { PageTitle } from '../../ui/components/PageTitle'
import { MyCardPage } from '../../creation-card/components/MyCardPage'
import { ProfileForm } from './ProfileForm'
import { PasswordForm } from './PasswordForm'
import '../assets/ProfilePage.css'

type ProfilePageProps = {
    user: User,
    onUpdate: () => void,
    onLogout: () => void
}

export function ProfilePage({ user, onUpdate, onLogout }: ProfilePageProps) {
    return (
        <section className="page-shell profile-page">
            <div className="page-shell__head">
                <PageTitle>Profil</PageTitle>
                <button className="profile-page__logout" type="button" onClick={onLogout}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
                    </svg>
                    Se déconnecter
                </button>
            </div>

            <div className="profile-page__account">
                <ProfileForm user={user} onUpdate={onUpdate} />
                <PasswordForm onUpdate={() => {}} />
            </div>

            <div className="profile-page__card">
                <MyCardPage />
            </div>
        </section>
    )
}
