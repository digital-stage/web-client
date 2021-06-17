import { IoMdMic, IoMdMicOff } from 'react-icons/io'
import React from 'react'
import { Device, Stage, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import styles from './StreamController.module.css'
import Button from '../ui/Button'
import useSelectedDevice from '../lib/useSelectedDevice'
import DeviceSelector from './DeviceSelector'

const StreamController = () => {
    const { selectedDeviceId } = useSelectedDevice()
    const stage = useStageSelector<Stage | undefined>(
        (state) => state.globals.stageId && state.stages.byId[state.globals.stageId]
    )
    const selectedDevice = useStageSelector<Device | undefined>(
        (state) => state.devices.byId[selectedDeviceId]
    )
    const connection = useConnection()

    return (
        <div className={styles.wrapper}>
            <DeviceSelector />
            {selectedDevice && (
                <>
                    {stage?.audioType === selectedDevice.type && (
                        <Button
                            round
                            onClick={() =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: selectedDevice._id,
                                    sendAudio: !selectedDevice.sendAudio,
                                } as ClientDevicePayloads.ChangeDevice)
                            }
                        >
                            {selectedDevice.sendAudio ? <IoMdMic /> : <IoMdMicOff />}
                        </Button>
                    )}
                </>
            )}
        </div>
    )
}
export default StreamController
