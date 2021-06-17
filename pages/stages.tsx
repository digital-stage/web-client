import React, { useEffect } from 'react'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import SmallContainer from '../ui/container/SmallContainer'
import StagesList from '../components/StagesList'

const Stages = () => {
    const { loading, user } = useAuth()
    const { replace } = useRouter()

    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])

    return (
        <SmallContainer>
            <h1>Meine Bühnen</h1>
            <StagesList />
        </SmallContainer>
    )
}
export default Stages
