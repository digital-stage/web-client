import {DeviceSettings} from '../../components/devices/DeviceSettings'
import { useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import {SettingsLayout} from 'components/settings/SettingsLayout'

const DeviceSettingsPage = () => {
    const selectedDeviceId = useStageSelector<string>((state) => state.globals.selectedDeviceId)
    return (
        <SettingsLayout>
            <DeviceSettings deviceId={selectedDeviceId} />
        </SettingsLayout>
    )
}
export default DeviceSettingsPage
