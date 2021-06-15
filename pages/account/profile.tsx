import React, { useEffect } from 'react'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import Container from '../../components/ui/Container'
import Block from '../../components/ui/Block'
import LoadingOverlay from '../../components/LoadingOverlay'
import ProfileEditor from '../../components2/account/ProfileEditor'
import DefaultPanel from '../../ui/panels/DefaultPanel'

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
        <Container>
            <Block paddingTop={4} paddingBottom={4}>
                <h2>Mein Benutzerprofil</h2>
                <DefaultPanel>
                    <ProfileEditor />
                </DefaultPanel>
            </Block>
        </Container>
    )
}
export default Profile
