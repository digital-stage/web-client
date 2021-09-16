import { batch, useDispatch } from 'react-redux'
import React from 'react'
import cookie from 'js-cookie'
import {setInitialized, setToken, setUser, signInWithToken } from '../redux/actions'


const AutoLoginService = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        const token = cookie.get('token')
        if (token) {
            signInWithToken(token)
                .then((user) => {
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
            dispatch(setInitialized(true))
        }
    }, [dispatch])
    return null
}
export { AutoLoginService }
