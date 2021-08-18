import * as React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { logout, useStageSelector } from '@digitalstage/api-client-react'
import { useDispatch } from 'react-redux'
import InternalActionTypes from '../../api/redux/actions/InternalActionTypes'

const Logout = (): JSX.Element => {
    const { replace } = useRouter()
    const dispatch = useDispatch()
    const initialized = useStageSelector((state) => state.auth.initialized)
    const token = useStageSelector((state) => state.auth.token)
    const signedOut = initialized && !token

    useEffect(() => {
        if (initialized && token) {
            logout(token).then(() =>
                dispatch({
                    type: InternalActionTypes.LOGOUT,
                })
            )
        }
    }, [dispatch, initialized, token])

    useEffect(() => {
        if (signedOut) {
            replace('/account/login')
        }
    }, [signedOut, replace])

    return (
        <div>
            <h2>Abmelden ...</h2>
        </div>
    )
}

export default Logout
