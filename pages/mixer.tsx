import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import MixingPanel from '../components/mixer/MixingPanel'

const Mixer = () => {
    const { loading, user } = useAuth()
    const { replace } = useRouter()
    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])

    return <MixingPanel />
}
export default Mixer
