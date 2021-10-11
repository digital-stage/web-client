import React from "react";
import {useRoom} from "./RoomContext";
import {RoomPositionWithAngle} from "./types";
import {Rotator} from "./Rotator";
import {rotatePointAroundOrigin} from "./utils";

export type DragBounceFunc = (pos: { x: number, y: number }) => { x: number, y: number }

const RoomItem = ({
                      caption,
                      color,
                      x,
                      y: invertedY,
                      rZ,
                      offsetX,
                      offsetY: invertedOffsetY,
                      offsetRz,
                      size,
                      dragBounceFunc: customDragBounceFunc,
                      selected,
                      onClicked,
                      onChange,
                      onFinalChange,
                      children
                  }: {
    x: number,
    y: number,
    rZ: number,
    offsetX?: number,
    offsetY?: number,
    offsetRz?: number,
    size: number,
    color?: string,
    caption?: string,
    selected?: boolean,
    onClicked?: (e: MouseEvent | TouchEvent) => void
    onChange: (position: RoomPositionWithAngle) => void
    onFinalChange?: (position: RoomPositionWithAngle) => void
    dragBounceFunc?: DragBounceFunc,
    children?: React.ReactNode
}) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = React.useState<boolean>(false)
    const dragged = React.useRef<boolean>(false)
    const y = React.useMemo<number>(() => {
        return invertedY * -1
    }, [invertedY])
    const offsetY = React.useMemo<number | undefined>(() => {
        if (invertedOffsetY)
            return invertedOffsetY * -1
        return undefined
    }, [invertedOffsetY])

    const {
        interactionLayer,
        factor,
        width: roomWidth,
        height: roomHeight,
        rotation: roomRotation,
        room,
        actualWidth,
        actualHeight
    } = useRoom()

    const lastPosition = React.useRef<RoomPositionWithAngle>({x, y, rZ})

    React.useEffect(() => {
        if (ref.current) {
            const currentRef = ref.current
            const onDragEnd = (e: MouseEvent | TouchEvent) => {
                if (e.cancelable) {
                    e.preventDefault()
                }
                e.stopPropagation()
                global.window.removeEventListener("touchcancel", onDragEnd)
                global.window.removeEventListener("touchend", onDragEnd)
                global.window.removeEventListener("mouseup", onDragEnd)
                setDragging(false)
                if (dragged.current) {
                    if (onFinalChange) {
                        onFinalChange({
                            x: lastPosition.current.x,
                            y: lastPosition.current.y * -1,
                            rZ: lastPosition.current.rZ
                        })
                    }
                } else {
                    if (onClicked) {
                        onClicked(e)
                    }
                }
            }
            const onDragStart = (e: MouseEvent | TouchEvent) => {
                if (e.cancelable) {
                    e.preventDefault()
                }
                e.stopPropagation()
                dragged.current = false
                setDragging(true)
                global.window.addEventListener("touchcancel", onDragEnd)
                global.window.addEventListener("touchend", onDragEnd)
                global.window.addEventListener("mouseup", onDragEnd)
            }
            const handleClicked = (e: MouseEvent) => {
                e.stopPropagation()
            }
            currentRef.addEventListener("touchstart", onDragStart)
            currentRef.addEventListener("mousedown", onDragStart)
            currentRef.addEventListener("click", handleClicked)
            return () => {
                currentRef.removeEventListener("touchstart", onDragStart)
                currentRef.removeEventListener("mousedown", onDragStart)
                currentRef.removeEventListener("click", handleClicked)
            }
        }
    }, [onClicked, onFinalChange])

    const dragBounceFunc = React.useMemo<DragBounceFunc>(() => {
        if (customDragBounceFunc)
            return customDragBounceFunc
        return ({x, y}: { x: number, y: number }) => ({
            x: Math.min((roomWidth / 2), Math.max(-(roomWidth / 2), x)),
            y: Math.min((roomHeight / 2), Math.max(-(roomHeight / 2), y)),
        })
    }, [customDragBounceFunc, roomHeight, roomWidth])
    React.useEffect(() => {
        // Assure that all dependencies are matched to avoid unnecessary event handler registrations
        if (dragging) {
            const centerX = actualWidth / 2
            const centerY = actualHeight / 2
            const xOffset = offsetX || 0
            const yOffset = offsetY || 0
            const onTouchMove = (e: TouchEvent) => {
                e.preventDefault()
                e.stopPropagation()
                const touch = e.changedTouches.item(0)
                if (touch) {
                    dragged.current = true
                    const absoluteX = touch.pageX + (room?.scrollLeft || 0)
                    const absoluteY = touch.pageY + (room?.scrollTop || 0)
                    let position = {
                        x: (absoluteX - centerX) / factor,
                        y: (absoluteY - centerY) / factor
                    }
                    if (roomRotation) {
                        position = rotatePointAroundOrigin(position.x, position.y, -roomRotation)
                    }
                    const bounced = dragBounceFunc(position)
                    const positionWithoutOffset: RoomPositionWithAngle = {
                        x: bounced.x - xOffset,
                        y: bounced.y - yOffset,
                        rZ: lastPosition.current.rZ
                    }
                    lastPosition.current = positionWithoutOffset
                    onChange({
                        x: positionWithoutOffset.x,
                        y: -1 * positionWithoutOffset.y,
                        rZ: positionWithoutOffset.rZ
                    })
                }
            }
            const onMouseMove = (e: MouseEvent) => {
                if (e.cancelable) {
                    e.preventDefault()
                }
                e.stopPropagation()
                if (e.movementX !== 0 || e.movementY !== 0) {
                    dragged.current = true
                    let movementX = e.movementX / factor
                    let movementY = e.movementY / factor
                    // First normalize x and y, since we could have an rotated room
                    if (roomRotation) {
                        const rotated = rotatePointAroundOrigin(movementX, movementY, -roomRotation)
                        movementX = rotated.x
                        movementY = rotated.y
                    }
                    // Add offset and movement and check using drag bounce
                    let positionWithOffset = {
                        x: lastPosition.current.x + movementX + xOffset,
                        y: lastPosition.current.y + movementY + yOffset
                    }
                    const bounced = dragBounceFunc(positionWithOffset)
                    // Use drag bounce result, but subtract offset again
                    const position: RoomPositionWithAngle = {
                        x: bounced.x - xOffset,
                        y: bounced.y - yOffset,
                        rZ: lastPosition.current.rZ
                    }
                    lastPosition.current = position
                    onChange({
                        x: position.x,
                        y: -1 * position.y,
                        rZ: position.rZ
                    })
                }
            }
            global.window.addEventListener("touchmove", onTouchMove, {passive: false})
            global.window.addEventListener("mousemove", onMouseMove)
            return () => {
                global.window.removeEventListener("touchmove", onTouchMove)
                global.window.removeEventListener("mousemove", onMouseMove)
            }
        }
    }, [interactionLayer, dragBounceFunc, dragging, onChange, factor, offsetX, offsetY, roomRotation, actualWidth, actualHeight, room?.scrollLeft, room?.scrollTop])

    React.useEffect(() => {
        lastPosition.current = {
            x,
            y,
            rZ
        }
    }, [rZ, x, y])

    const handleRotation = React.useCallback((rZ: number) => {
        const relativeRz = rZ - (offsetRz || 0)
        onChange({
            x: lastPosition.current.x,
            y: lastPosition.current.y * -1,
            rZ: relativeRz
        })
        lastPosition.current.rZ = relativeRz
    }, [offsetRz, onChange])
    const handleFinalRotation = React.useCallback((rZ: number) => {
        const relativeRz = rZ - (offsetRz || 0)
        if (onFinalChange) {
            onFinalChange({
                x: lastPosition.current.x,
                y: lastPosition.current.y * -1,
                rZ: relativeRz
            })
        }
        lastPosition.current.rZ = relativeRz
    }, [offsetRz, onFinalChange])

    return (
        <>
            <div ref={ref} className="item" style={{
                transform: `translate(${(x + (offsetX || 0) - (size / 2)) * factor}px, ${((y + (offsetY || 0) - (size / 2)) * factor)}px) rotate(${roomRotation ? -roomRotation : 0}deg)`,
                width: `${size * factor}px`,
                height: `${size * factor}px`,
            }}>
                <div className="cage" style={{
                    width: `${size * factor}px`,
                    height: `${size * factor}px`,
                    transform: `rotate(${rZ + (offsetRz || 0) + (roomRotation || 0)}deg`,
                    borderColor: selected ? `var(---primary)` : `transparent`,
                }}>
                    {children}
                    {selected && <Rotator
                        x={x + (offsetX || 0)}
                        y={y + (offsetY || 0)}
                        rZ={rZ + (offsetRz || 0)}
                        onChange={handleRotation}
                        onFinalChange={handleFinalRotation}
                    />
                    }
                </div>
                {caption && <span>{caption}</span>}
                {process.env.NODE_ENV !== "production" &&
                <span className="info">({Math.round(x)}|{-1 * Math.round(y)}) with {Math.round(rZ)}&deg;</span>}
            </div>
            <style jsx>{`
                .item {
                    user-select: none;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    cursor: move;
                    color: ${color ? color : 'inherit'};
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow: visible;
                }
                .item .cage {
                    position: relative;
                    user-select: none;
                    width: 100%;
                    height: 100%;
                    border-width: 2px;
                    border-style: solid;
                    border-color: transparent;
                }
                .item span {
                    display: inline-block;
                    user-select: none;
                    text-align: center;
                    white-space: nowrap;
                    padding-top: 8px;
                }
                .item img {
                    user-select: none;
                }
                .info {
                  font-size: 0.6rem;
                  text-align: center;
                  white-space: nowrap;
                  margin: 0;
                  padding: 0;
                }
            `}</style>
        </>
    )
}
export {RoomItem}