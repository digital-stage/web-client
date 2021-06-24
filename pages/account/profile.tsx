import React, { useEffect } from 'react'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import DefaultContainer from 'fastui/components/container/DefaultContainer'
import LoadingOverlay from '../../components/LoadingOverlay'
import ProfileEditor from '../../components/account/ProfileEditor'
import DefaultPanel from '../../fastui/components/panels/DefaultPanel'

const Profile = () => {
    const { user, loading } = useAuth()

    const { replace } = useRouter()
    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])

    if (loading) return <LoadingOverlay>Lade Nutzerdaten...</LoadingOverlay>

    return (
        <DefaultContainer>
            <h2>Mein Benutzerprofil</h2>
            <DefaultPanel>
                <ProfileEditor />
            </DefaultPanel>
        </DefaultContainer>
    )
}
export default Profile
