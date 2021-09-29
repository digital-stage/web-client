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

import {DeviceSettings} from '../../components/devices/DeviceSettings'
import {useRouter} from 'next/router'
import React from 'react'
import Link from 'next/link'
import {useStageSelector} from '@digitalstage/api-client-react'
import {Container} from '../../ui/Container'
import {IoIosArrowDropleft} from 'react-icons/io'
import {Panel} from 'ui/Panel'
import {Loading} from "../../components/global/Loading";

const DevicePage = () => {
  const {isReady, query, replace} = useRouter()
  const [deviceId, setDeviceId] = React.useState<string>()
  const localDeviceId = useStageSelector((state) => state.globals.localDeviceId)

  React.useEffect(() => {
    if (isReady) {
      const id = Array.isArray(query.deviceId) ? query.deviceId[0] : query.deviceId
      if (id) {
        setDeviceId(id)
      } else {
        replace("/devices")
      }
    }
  }, [isReady, replace, query])

  const deviceFound = useStageSelector(state => state.globals.ready && deviceId ? !!state.devices.byId[deviceId] : undefined)
  React.useEffect(() => {
    if (deviceFound === false) {
      replace("/devices")
    }
  }, [deviceFound, replace])

  if (deviceFound) {
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
          <h3 className="heading">
            Gerät bearbeiten {localDeviceId === deviceId ? ' (Dieser Webbrowser)' : ''}
          </h3>
          <DeviceSettings deviceId={deviceId}/>
        </Panel>
      </Container>
    )
  }
  return <Loading message="Lade Geräteeinstellungen..."/>
}
export default DevicePage
