import { CustomStageDevicePosition, StageDevice, User } from '@digitalstage/api-client-react'
import React, { useEffect, useState } from 'react'
import StageElement from './StageElement'
import ElementSelection from './ElementSelection'

const StageDeviceElement = ({
    globalMode,
    offsetX,
    offsetY,
    offsetRz,
    stageDevice,
    customStageDevice,
    onChange,
    onSelected,
    selected,
    user,
    color,
    stageDeviceImage,
}: {
    globalMode: boolean
    offsetX: number
    offsetY: number
    offsetRz: number
    stageDevice: StageDevice
    customStageDevice?: CustomStageDevicePosition
    onChange: (position: { x: number; y: number; rZ: number }) => void
    onSelected: (selection: ElementSelection) => void
    selected?: ElementSelection
    user?: User
    color: string
    stageDeviceImage: CanvasImageSource
}) => {
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: offsetX + stageDevice.x,
        y: offsetY + stageDevice.y,
        rZ: offsetRz + stageDevice.rZ,
    })
    useEffect(() => {
        if (!globalMode && customStageDevice) {
            setPosition({
                x: offsetX + customStageDevice.x,
                y: offsetY + customStageDevice.y,
                rZ: offsetRz + customStageDevice.rZ,
            })
        } else {
            setPosition({
                x: offsetX + stageDevice.x,
                y: offsetY + stageDevice.y,
                rZ: offsetRz + stageDevice.rZ,
            })
        }
    }, [globalMode, stageDevice, customStageDevice, offsetX, offsetY, offsetRz])

    useEffect(() => {
        if (selected) {
            if (
                selected.stageDeviceId === stageDevice._id &&
                customStageDevice &&
                !selected.customStageDeviceId
            ) {
                onSelected({
                    ...selected,
                    customStageDeviceId: customStageDevice._id,
                })
            }
        }
    }, [selected, stageDevice._id, customStageDevice])

    return (
        <StageElement
            x={position.x}
            y={position.y}
            rZ={position.rZ}
            size={96}
            image={stageDeviceImage}
            onChanged={(currPos) => {
                setPosition(currPos)
            }}
            onChangeFinished={({ x, y, rZ }) => {
                setPosition({ x, y, rZ })
                onChange({
                    x: x - offsetX,
                    y: y - offsetY,
                    rZ: rZ - offsetRz,
                })
            }}
            selected={
                selected &&
                (selected.type === 'sd' || selected.type === 'csd') &&
                selected.stageDeviceId === stageDevice._id
            }
            onClick={() =>
                onSelected({
                    stageDeviceId: stageDevice._id,
                    customStageDeviceId: customStageDevice && customStageDevice._id,
                    type: globalMode ? 'sd' : 'csd',
                })
            }
            label={`${user?.name}: ${stageDevice?.name || stageDevice._id}`}
            color={color}
            opacity={globalMode || customStageDevice ? 1 : 0.6}
        />
    )
}
StageDeviceElement.defaultProps = {
    customStageDevice: undefined,
    user: undefined,
    selected: undefined,
}
export default StageDeviceElement
