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

import {ReactiveMixingPanel} from '../components/mixer/ReactiveMixingPanel'
import Head from 'next/head'
import React from 'react'
import {Container} from 'ui/Container'
import {useStageAvailableOrForward} from "../components/global/useStageAvailableOrForward";
import { Loading } from 'components/global/Loading';

const Mixer = () => {
    const stageAvailable = useStageAvailableOrForward()

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
