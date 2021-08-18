import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSvgImage } from './useImage'
import {
    Text,
    Image,
    Group,
    Transformer,
    Circle,
    Line as KonvaLine,
} from 'react-konva/es/ReactKonvaCore'
import 'konva/lib/shapes/Text'
import 'konva/lib/shapes/Image'
import 'konva/lib/shapes/Transformer'
import 'konva/lib/shapes/Circle'
import 'konva/lib/shapes/Line'

// @ts-ignore
export const FACTOR = process.browser && navigator?.maxTouchPoints > 1 ? 50 : 100

const RoomElement = ({
    modified,
    name,
    size,
    src,
    onChange,
    onFinalChange,
    x,
    y,
    rZ,
    stageWidth,
    stageHeight,
    onSelected,
    selected,
    color,
    showOnlineStatus,
    online,
    linePoints,
    lineDash,
}: {
    modified?: boolean
    name: string
    size: number
    src: string
    x: number
    y: number
    rZ: number
    stageWidth: number
    stageHeight: number
    onChange: (event: { x?: number; y?: number; rZ?: number }) => any
    onFinalChange: (event: { x?: number; y?: number; rZ?: number }) => any
    onSelected: () => any
    selected: boolean
    color: string
    showOnlineStatus?: boolean
    online?: boolean
    linePoints?: number[]
    lineDash?: number[]
}) => {
    const sourceImage = useSvgImage(src, size, size, color)
    const imageRef = useRef<any>()
    const transformerRef = useRef<any>()

    const maximumX = useMemo(() => stageWidth * FACTOR - size, [stageWidth, size])
    const maximumY = useMemo(() => stageHeight * FACTOR - size, [stageHeight, size])
    const realX = useMemo(() => (stageWidth / 2 + x) * FACTOR, [stageWidth, x])
    const realY = useMemo(() => (stageHeight / 2 + y) * FACTOR, [stageHeight, y])
    const dragBoundFunc = useCallback(
        (pos) => ({
            x: Math.min(maximumX, Math.max(size, pos.x)),
            y: Math.min(maximumY, Math.max(size, pos.y)),
        }),
        [size, maximumY, maximumX]
    )
    const handleDrag = useCallback(
        (e: any) => {
            if (e.target) {
                const event: {
                    x?: number
                    y?: number
                } = {}
                event.y = e.target.y() / FACTOR - stageHeight / 2
                event.x = e.target.x() / FACTOR - stageWidth / 2
                if (event.x || event.y) onChange(event)
            }
        },
        [onChange, stageHeight, stageWidth]
    )
    const handleDragEnd = useCallback(
        (e: any) => {
            if (e.target) {
                const event: {
                    x?: number
                    y?: number
                } = {}
                event.y = e.target.y() / FACTOR - stageHeight / 2
                event.x = e.target.x() / FACTOR - stageWidth / 2
                if (event.x || event.y) {
                    onFinalChange(event)
                }
            }
        },
        [onFinalChange, stageHeight, stageWidth]
    )

    const handleTransform = useCallback(
        (e: any) => {
            if (e.target) {
                const rZ = e.target.rotation()
                if (rZ) {
                    onChange({ rZ })
                }
            }
        },
        [onChange]
    )
    const handleTransformEnd = useCallback(
        (e: any) => {
            if (e.target) {
                const rZ = e.target.rotation()
                if (rZ) {
                    onFinalChange({ rZ })
                }
            }
        },
        [onFinalChange]
    )

    useEffect(() => {
        if (selected && transformerRef.current && imageRef.current) {
            // Link both
            transformerRef.current.nodes([imageRef.current])
            transformerRef.current.getLayer().batchDraw()
        }
    }, [selected, transformerRef, imageRef])

    return (
        <>
            {linePoints ? (
                <KonvaLine
                    strokeWidth={1}
                    stroke={color}
                    dash={lineDash || [2, 5]}
                    points={linePoints.map((point, index) => {
                        if (index % 2 === 0) {
                            return (stageWidth / 2 + point) * FACTOR
                        }
                        return (stageHeight / 2 + point) * FACTOR
                    })}
                />
            ) : null}

            <Group
                draggable={true}
                x={realX}
                y={realY}
                dragBoundFunc={dragBoundFunc}
                onDragMove={handleDrag}
                onDragEnd={handleDragEnd}
                onClick={onSelected}
                onTap={onSelected}
            >
                <Text
                    text={name}
                    draggable={false}
                    width={size * 4}
                    align="center"
                    x={-(size * 2)}
                    y={size / 2}
                    fill="#f4f4f4ee"
                />
                {showOnlineStatus ? (
                    <Circle
                        x={size / 2}
                        y={size / 2 - 10}
                        radius={size / 20}
                        fill={online ? 'green' : 'red'}
                    />
                ) : null}
                {sourceImage ? (
                    <Image
                        opacity={modified ? 1 : 0.5}
                        ref={imageRef}
                        image={sourceImage}
                        alt={name}
                        width={size}
                        height={size}
                        draggable={false}
                        offsetX={size / 2}
                        offsetY={size / 2}
                        rotation={rZ}
                        onTransform={handleTransform}
                        onTransformEnd={handleTransformEnd}
                    />
                ) : null}
                {selected ? (
                    <Transformer
                        ref={transformerRef}
                        borderEnabled={true}
                        resizeEnabled={false}
                        rotateEnabled={true}
                    />
                ) : null}
            </Group>
        </>
    )
}
export default RoomElement
