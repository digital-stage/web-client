import { useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import DevicePanel from '../components/devices/DevicePanel'

const Devices = () => {
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const deviceIds = useStageSelector<string[]>((state) => state.devices.allIds)

    if (ready) {
        return (
            <div>
                <h1>Devices</h1>
                {deviceIds.map((deviceId) => (
                    <div className="deviceWrapper">
                        <DevicePanel key={deviceId} id={deviceId} />
                    </div>
                ))}
                <style jsx>{`
                    div.deviceWrapper {
                        padding: 1rem;
                    }
                `}</style>
            </div>
        )
    }
    return <div>Loading</div>
}
export default Devices
