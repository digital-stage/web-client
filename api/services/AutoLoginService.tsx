import { batch, useDispatch } from 'react-redux'
import React from 'react'
import { setInitialized, setToken, setUser, signInWithToken } from '@digitalstage/api-client-react'
import cookie from 'js-cookie'
import debug from 'debug'

const report = debug('AutoLoginService')

const AutoLoginService = () => {
    report('RERENDER')
    const dispatch = useDispatch()

    React.useEffect(() => {
        console.log('Verifying token')
        const token = cookie.get('token')
        if (token) {
            signInWithToken(token)
                .then((user) => {
                    console.log('Signed in')
                    batch(() => {
                        dispatch(setUser(user))
                        dispatch(setToken(token))
                    })
                })
                .catch((err) => {
                    console.error(err)
                })
                .finally(() => dispatch(setInitialized(true)))
        } else {
            console.log('No token available')
            dispatch(setInitialized(true))
        }
    }, [dispatch])
    return null
}
export { AutoLoginService }
