import { useStageSelector } from '@digitalstage/api-client-react'
import { AuthUser } from '../redux/state/Auth'
import { shallowEqual } from 'react-redux'

interface AuthContextT {
    signedIn: boolean
    signedOut: boolean
    user?: AuthUser
    token?: string
}

const useAuth = (): AuthContextT => {
    const signedIn = useStageSelector<boolean>(
        (state) => state.auth.initialized && !!state.auth.token
    )
    const signedOut = useStageSelector<boolean>(
        (state) => state.auth.initialized && !state.auth.token
    )
    const user = useStageSelector<AuthUser | undefined>((state) => state.auth.user, shallowEqual)
    const token = useStageSelector<string | undefined>((state) => state.auth.token)

    return {
        signedIn,
        signedOut,
        user,
        token,
    }
}
export default useAuth
