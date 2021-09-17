import * as React from 'react'
import {useEffect} from 'react'
import {useRouter} from 'next/router'
import {logout, useStageSelector, InternalActionTypes} from '@digitalstage/api-client-react'
import {batch, useDispatch} from 'react-redux'

const Logout = (): JSX.Element => {
    const {replace} = useRouter()
    const dispatch = useDispatch()
    const initialized = useStageSelector((state) => state.auth.initialized)
    const token = useStageSelector((state) => state.auth.token)
    const signedOut = initialized && !token

    useEffect(() => {
        if (initialized && token) {
            logout(token)
                .then(() =>
                    batch(() => {
                        dispatch({
                            type: InternalActionTypes.LOGOUT,
                        })
                        dispatch({
                            type: InternalActionTypes.RESET,
                        })
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
