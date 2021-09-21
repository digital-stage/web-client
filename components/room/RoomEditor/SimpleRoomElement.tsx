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

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { FACTOR } from './RoomElement'
import { Group as KonvaGroup, Star as KonvaStar } from 'react-konva/ReactKonvaCore'
import { Transformer } from 'react-konva/lib/ReactKonvaCore'

const Element = ({
    x,
    y,
    rZ,
    size,
    stageWidth,
    stageHeight,
    onChange,
    selected,
    onSelected,
}: {
    x: number
    y: number
    rZ: number
    size: number
    stageWidth: number
    stageHeight: number
    onChange: (event: { x?: number; y?: number; rZ?: number }) => any
    selected: boolean
    onSelected: () => void
}) => {
    const imageRef = React.useRef<any>()
    const transformerRef = React.useRef<any>()
    const realX = useMemo(() => (stageWidth / 2 + x) * FACTOR, [stageWidth, x])
    const realY = useMemo(() => (stageHeight / 2 + y) * FACTOR, [stageHeight, y])
    const maximumX = useMemo(() => stageWidth * FACTOR - size, [stageWidth, size])
    const maximumY = useMemo(() => stageHeight * FACTOR - size, [stageHeight, size])
    const dragBoundFunc = useCallback(
        (pos) => ({
            x: Math.min(maximumX, Math.max(size, pos.x)),
            y: Math.min(maximumY, Math.max(size, pos.y)),
        }),
        [size, maximumY, maximumX]
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
                if (event.x || event.y) onChange(event)
            }
        },
        [onChange, stageHeight, stageWidth]
    )
    const handleTransformEnd = useCallback(
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
   React.useEffect(() => {
        if (selected && transformerRef.current && imageRef.current) {
            // Link both
            transformerRef.current.nodes([imageRef.current])
            transformerRef.current.getLayer().batchDraw()
        }
    }, [selected, transformerRef, imageRef])
    return (
        <KonvaGroup
            draggable={true}
            x={realX}
            y={realY}
            dragBoundFunc={dragBoundFunc}
            onDragEnd={handleDragEnd}
            onClick={onSelected}
            onTap={onSelected}
        >
            <KonvaStar
                ref={imageRef}
                fill="blue"
                stroke="red"
                numPoints={5}
                innerRadius={5}
                outerRadius={size}
                offsetX={size / 2}
                offsetY={size / 2}
                dragBoundFunc={dragBoundFunc}
                draggable={true}
                onDragEnd={handleDragEnd}
                rotation={rZ}
                onTransformEnd={handleTransformEnd}
            />
            {selected ? (
                <Transformer
                    ref={transformerRef}
                    borderEnabled={true}
                    resizeEnabled={false}
                    rotateEnabled={true}
                />
            ) : null}
        </KonvaGroup>
    )
}
export { Element }
