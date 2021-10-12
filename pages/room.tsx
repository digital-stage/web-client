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

import {selectRender3DAudio, useTrackedSelector} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import React from 'react'
import {RoomEditor} from '../components/room/RoomEditor'
import {Loading} from "../components/global/Loading";

const Room = () => {
    const {isReady, push} = useRouter()
    const state = useTrackedSelector()
    const connectionReady = state.globals.ready
    const stageId = state.globals.stageId
    const renderSpatialAudio = selectRender3DAudio(state)
    React.useEffect(() => {
        if (isReady && connectionReady) {
            if (!stageId) {
                push('/stages')
            } else if (!renderSpatialAudio) {
                push('/stage')
            }
        }
    }, [isReady, push, stageId, connectionReady, renderSpatialAudio])

    if (connectionReady && stageId && renderSpatialAudio) {
        return (
            <div className="roomWrapper">
                {stageId && process.browser ? <RoomEditor/> : null}
            </div>
        )
    }
    return <Loading message="Lade 3D Editor ..."/>
}
export default Room
