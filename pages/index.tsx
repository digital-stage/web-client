import Head from 'next/head'
import {Container, SIZE} from '../ui/Container'
import { useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import {LoadingShaft} from '../ui/LoadingShaft'
import { useRouter } from 'next/router'

const Index = () => {
    const { replace } = useRouter()
    const insideStage = useStageSelector<boolean>((state) =>
        state.globals.ready ? !!state.globals.stageId : undefined
    )

    React.useEffect(() => {
        if (insideStage !== undefined) {
            if (insideStage) {
                replace('/stage')
            } else {
                replace('/stages')
            }
        }
    }, [insideStage, replace])

    return (
        <Container size={SIZE.small}>
            <Head>
                <title>Welcome to Digital Stage</title>
                <meta name="description" content="Digital Stage" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="overlay">
                <LoadingShaft />
                <h2>Stimme die Instrumente...</h2>
            </div>
        </Container>
    )
}
export default Index
