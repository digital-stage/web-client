import * as React from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@digitalstage/api-client-react'
import { useEffect } from 'react'
import debug from 'debug'
import LoadingOverlay from '../../componentsOld/LoadingOverlay'

const reportError = debug('logout').extend('error')

const Logout = (): JSX.Element => {
    const router = useRouter()
    const { loading, user, logout } = useAuth()

    useEffect(() => {
        if (!loading) {
            if (user) {
                logout()
                    .then(() => router.push('/account/login'))
                    .catch((err) => {
                        reportError(err)
                    })
            } else {
                router.push('/account/login').catch((err) => {
                    reportError(err)
                })
            }
        }
    }, [loading, user, logout])

    return (
        <LoadingOverlay>
            <h2>Abmelden ...</h2>
        </LoadingOverlay>
    )
}

export default Logout
