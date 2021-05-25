import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import MixingPanel from '../components/mixer/MixingPanel'
import Block from '../components/ui/Block'

const Mixer = () => {
    const { push } = useRouter()
    const { loading, user } = useAuth()

    useEffect(() => {
        if (!loading && !user && push) {
            push('/account/login')
        }
    }, [loading, user, push])

    return (
        <Block padding={2}>
            <MixingPanel />
        </Block>
    )
}
export default Mixer
