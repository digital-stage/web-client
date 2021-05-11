import * as React from 'react'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import { useAuth } from '@digitalstage/api-client-react'
import { useEffect } from 'react'
import LoadingOverlay from '../../components/LoadingOverlay'

const Logout = (): JSX.Element => {
    const router = useRouter()
    const { loading, user, logout } = useAuth()
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })

    useEffect(() => {
        if (!loading) {
            if (user) {
                logout()
                    .then(() => router.push('/account/login'))
                    .catch((err) => {
                        console.error(err)
                    })
            } else {
                router.push('/account/login')
            }
        }
    }, [loading, user, logout])

    return (
        <LoadingOverlay>
            <h2>{f('signingOut')}</h2>
        </LoadingOverlay>
    )
}

export default Logout
