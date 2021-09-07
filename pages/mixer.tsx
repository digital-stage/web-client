import {ReactiveMixingPanel} from '../components/mixer/ReactiveMixingPanel'
import Head from 'next/head'
import React from 'react'
import {Container} from 'ui/Container'

const Mixer = () => {
    return (
        <>
            <Head>
                <title>Mischpult</title>
            </Head>
            <Container size="small">
                <ReactiveMixingPanel />
            </Container>
        </>
    )
}
export default Mixer
