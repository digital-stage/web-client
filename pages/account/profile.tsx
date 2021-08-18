import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import ProfileEditor from 'components/account/ProfileEditor'
import { useStageSelector } from '@digitalstage/api-client-react'
import Container from 'ui/Container'
import Panel from '../../ui/Panel'

const Profile = () => {
    const signedOut = useStageSelector((state) => state.auth.initialized && state.auth.token)
    const { replace } = useRouter()
    useEffect(() => {
        if (signedOut) {
            replace('/account/login')
        }
    }, [replace, signedOut])

    return (
        <Container>
            <h2>Mein Benutzerprofil</h2>
            <Panel>
                <ProfileEditor />
            </Panel>
        </Container>
    )
}
export default Profile
