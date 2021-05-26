import React, { useCallback, useEffect, useRef } from 'react'
import { Image, Text, Transformer } from 'react-konva'

interface StageElementProps {
    label: string
    x: number
    y: number
    rZ: number
    onChanged: (position: { x: number; y: number; rZ: number }) => void
    onChangeFinished: (position: { x: number; y: number; rZ: number }) => void
    image: CanvasImageSource
    size: number
    onClick: () => void
    selected: boolean
    color: string
}

const StageElement = ({
    label,
    x,
    y,
    rZ,
    image,
    onChanged,
    onChangeFinished,
    size,
    onClick,
    selected,
    color,
}: StageElementProps) => {
    const ref = useRef<any>()
    const transformerRef = useRef<any>()
    const handleChange = useCallback(
        (e) => {
            onChanged({
                x: e.target.attrs.x,
                y: e.target.attrs.y,
                rZ: e.target.attrs.rotation,
            })
        },
        [onChanged]
    )
    const handleChangeEnd = useCallback(
        (e) => {
            onChanged({
                x: e.target.attrs.x,
                y: e.target.attrs.y,
                rZ: e.target.attrs.rotation,
            })
            onChangeFinished({
                x: e.target.attrs.x,
                y: e.target.attrs.y,
                rZ: e.target.attrs.rotation,
            })
        },
        [onChanged, onChangeFinished]
    )
    useEffect(() => {
        if (transformerRef.current && ref.current && selected) {
            // we need to attach transformer manually
            transformerRef.current.nodes([ref.current])
            transformerRef.current.getLayer().batchDraw()
        }
    }, [selected, transformerRef, ref])
    return (
        <>
            <Image
                ref={ref}
                x={x}
                y={y}
                rotation={rZ}
                width={size}
                height={size}
                offsetX={size / 2}
                offsetY={size / 2}
                image={image}
                draggable
                onDragMove={handleChange}
                onClick={onClick}
                onDragEnd={handleChangeEnd}
                onTransform={handleChange}
                onTransformEnd={handleChangeEnd}
            />
            {selected ? (
                <Transformer ref={transformerRef} resizeEnabled={false} rotateEnabled />
            ) : undefined}
            <Text fill={color} x={x - size / 4} y={y + size / 2} text={label} />
        </>
    )
}
export type { StageElementProps }
export default StageElement
