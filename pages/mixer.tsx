import {ReactiveMixingPanel} from '../components/mixer/ReactiveMixingPanel'
import Head from 'next/head'
import React from 'react'
import {Container} from 'ui/Container'
import {useStageAvailable} from "../components/global/useStageAvailable";
import { Loading } from 'components/global/Loading';

const Mixer = () => {
    const stageAvailable = useStageAvailable()

    if (stageAvailable) {
        return (
            <>
                <Head>
                    <title>Mischpult</title>
                </Head>
                <Container size="small">
                    <ReactiveMixingPanel/>
                </Container>
            </>
        )
    }
    return <Loading/>
}
export default Mixer
