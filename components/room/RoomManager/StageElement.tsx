import React, { useCallback, useEffect, useState } from 'react'
import { Image, Text, Transformer } from 'react-konva'

interface StageElementProps {
    label: string
    x: number
    y: number
    rZ: number
    offsetX: number
    offsetY: number
    offsetRz: number
    image: CanvasImageSource
    size: number
    onChanged: (x: number, y: number, rZ: number) => void
    onClick: () => void
    selected: boolean
}

const StageElement = ({
    x,
    y,
    rZ,
    offsetX,
    offsetRz,
    offsetY,
    label,
    image,
    onChanged,
    size,
    onClick,
    selected,
}: StageElementProps) => {
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: offsetX + x,
        y: offsetY + y,
        rZ: offsetRz + rZ,
    })
    useEffect(() => {
        setPosition({
            x: offsetX + x,
            y: offsetY + y,
            rZ: offsetRz + rZ,
        })
    }, [x, y, rZ, offsetX, offsetY, offsetRz])

    return (
        <>
            <Image
                x={position.x}
                y={position.y}
                rotation={position.rZ}
                width={size}
                height={size}
                offsetX={size / 2}
                offsetY={size / 2}
                image={image}
                draggable
                onDragMove={(e) => {
                    setPosition({
                        x: e.target.attrs.x,
                        y: e.target.attrs.y,
                        rZ: e.target.attrs.rotation,
                    })
                }}
                onClick={onClick}
                onDragEnd={() => {
                    onChanged(position.x, position.y, position.rZ)
                }}
                onTransform={(e) => {
                    setPosition((prev) => ({
                        x: prev.x,
                        y: prev.y,
                        rZ: e.target.attrs.rotation,
                    }))
                }}
                onTransformEnd={() => {
                    onChanged(position.x, position.y, position.rZ)
                }}
            />
            {selected ? <Transformer resizeEnabled={false} rotateEnabled /> : undefined}
            <Text fill="#fff" x={position.x - size / 4} y={position.y + size / 2} text={label} />
        </>
    )
}
export type { StageElementProps }
export default StageElement
