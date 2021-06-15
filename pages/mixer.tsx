import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import MixingPanel from '../components2/mixer/MixingPanel'
import Block from '../components/ui/Block'

const Mixer = () => {
    const { loading, user } = useAuth()
    const { replace } = useRouter()
    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])

    return (
        <Block padding={2}>
            <MixingPanel />
        </Block>
    )
}
export default Mixer
