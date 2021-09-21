/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Head from 'next/head'
import {Container, SIZE} from '../ui/Container'
import { useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import { useRouter } from 'next/router'
import { Loading } from 'components/global/Loading'


const Index = () => {
    const { isReady, replace } = useRouter()
    const insideStage = useStageSelector<boolean>((state) =>
        state.globals.ready ? !!state.globals.stageId : undefined
    )

    React.useEffect(() => {
        if (isReady && insideStage !== undefined) {
            if (insideStage) {
                replace('/stage')
            } else {
                replace('/stages')
            }
        }
    }, [isReady, insideStage, replace])

    return (
        <Container size={SIZE.small}>
            <Head>
                <title>Welcome to Digital Stage</title>
                <meta name="description" content="Digital Stage" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Loading />
        </Container>
    )
}
export default Index
