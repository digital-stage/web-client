import {DeviceSettings} from '../../components/devices/DeviceSettings'
import { useRouter } from 'next/router'
import React from 'react'
import Link from 'next/link'
import { useStageSelector } from '@digitalstage/api-client-react'
import {Container} from '../../ui/Container'
import { IoIosArrowDropleft } from 'react-icons/io'
import {Panel} from 'ui/Panel'

const DevicePage = () => {
    const { query } = useRouter()
    const deviceId = Array.isArray(query.deviceId) ? query.deviceId[0] : query.deviceId
    const localDeviceId = useStageSelector((state) => state.globals.localDeviceId)

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
                        <IoIosArrowDropleft />
                        &nbsp;Zurück zur Übersicht
                    </a>
                </Link>
                <h3 className="heading">
                    Gerät bearbeiten {localDeviceId === deviceId ? ' (Dieser Webbrowser)' : ''}
                </h3>
                <DeviceSettings deviceId={deviceId} />
            </Panel>
        </Container>
    )
}
export default DevicePage
