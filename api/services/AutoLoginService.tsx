import { batch, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { setInitialized, setToken, setUser, signInWithToken } from '@digitalstage/api-client-react'
import cookie from 'js-cookie'

const AutoLoginService = () => {
    console.log('RERENDER AutoLoginService')
    const dispatch = useDispatch()

    useEffect(() => {
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
export default AutoLoginService
