import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import MixingPanel from '../components/mixer/MixingPanel'
import Block from '../componentsOld/ui/Block'

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
