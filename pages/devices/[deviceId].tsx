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

import {useRouter} from 'next/router'
import React from 'react'
import Link from 'next/link'
import {IoIosArrowDropleft} from 'react-icons/io'
import {Panel} from 'ui/Panel'
import {selectLocalDeviceId, selectReady, useTrackedSelector} from "@digitalstage/api-client-react";
import {Container} from '../../ui/Container'
import {DeviceSettings} from '../../components/devices/DeviceSettings'
import {Loading} from "../../components/global/Loading";
import {Heading3} from "../../ui/Heading";

const DevicePage = (): JSX.Element => {
    const {isReady: isRouterReady, query, replace} = useRouter()
    const [deviceId, setDeviceId] = React.useState<string | undefined>(undefined)
    const state = useTrackedSelector()
    const localDeviceId = selectLocalDeviceId(state)
    const isApiReady = selectReady(state)

    React.useEffect(() => {
        if (isRouterReady && isApiReady) {
            const id = Array.isArray(query.deviceId) ? query.deviceId[0] : query.deviceId
            if (id && state.devices.byId[id]) {
                setDeviceId(id)
            } else {
                replace("/devices")
            }
        }
    }, [isRouterReady, isApiReady, replace, query, state.devices.byId])


    if (!!deviceId) {
        return (
            <Container size="small">
                <Panel className="devicePanel">
                    <Link href="/devices">
                        <a
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            <IoIosArrowDropleft/>
                            &nbsp;Zurück zur Übersicht
                        </a>
                    </Link>
                    <Heading3 className="heading">
                        Gerät bearbeiten {localDeviceId === deviceId ? ' (Dieser Webbrowser)' : ''}
                    </Heading3>
                    {deviceId && <DeviceSettings deviceId={deviceId}/>}
                </Panel>
            </Container>
        )
    }
    return <Loading message="Lade Geräteeinstellungen..."/>
}
export default DevicePage
