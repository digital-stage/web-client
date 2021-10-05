import React from "react";
import {RoomContext} from "./RoomContext";
import {RoomPositionWithAngle} from "./types";
import {Rotator} from "./Rotator";

export type DragBounceFunc = (pos: { x: number, y: number }) => { x: number, y: number }

const RoomItem = ({
                      caption,
                      color,
                      x,
                      y,
                      rZ,
                      offsetX,
                      offsetY,
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
    onClicked?: (e: MouseEvent) => void
    onChange: (position: RoomPositionWithAngle) => void
    onFinalChange?: (position: RoomPositionWithAngle) => void
    dragBounceFunc?: DragBounceFunc,
    children?: React.ReactNode
}) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = React.useState<boolean>(false)
    const dragged = React.useRef<boolean>(false)

    const {interactionLayer, factor, width: roomWidth, height: roomHeight} = React.useContext(RoomContext)

    const lastPosition = React.useRef<RoomPositionWithAngle>({x, y, rZ})

    React.useEffect(() => {
        if (ref.current) {
            const currentRef = ref.current
            const onDragEnd = (e: MouseEvent) => {
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
                        onFinalChange(lastPosition.current)
                    }
                } else {
                    if (onClicked) {
                        onClicked(e)
                    }
                }
            }
            const onDragStart = (e: MouseEvent) => {
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
        if (dragging) {
            const handleDrag = (movementX: number, movementY: number) => {
                if (movementX !== 0 || movementY !== 0) {
                    dragged.current = true
                    // Add offset and movement and check using drag bounce
                    const bounced = dragBounceFunc({
                        x: lastPosition.current.x + movementX + (offsetX || 0),
                        y: lastPosition.current.y + movementY + (offsetY || 0)
                    })
                    // Use drag bounce result, but subtract offset again
                    const position: RoomPositionWithAngle = {
                        x: bounced.x - (offsetX || 0),
                        y: bounced.y - (offsetY || 0),
                        rZ: lastPosition.current.rZ
                    }
                    lastPosition.current = position
                    onChange(position)
                }
            }
            let previousTouch: Touch = undefined
            const onTouchMove = (e: TouchEvent) => {
                e.stopPropagation()
                if (e.touches.length === 1) {
                    // Use only single touch
                    const touch = e.touches[0]
                    if (previousTouch) {
                        const movementX = (touch.pageX - previousTouch.pageX) / factor
                        const movementY = (touch.pageY - previousTouch.pageY) / factor
                        handleDrag(movementX, movementY)
                    }
                    previousTouch = touch
                }
            }
            const onMouseMove = (e: MouseEvent) => {
                if (e.cancelable) {
                    e.preventDefault()
                }
                e.stopPropagation()
                const movementX = e.movementX / factor
                const movementY = e.movementY / factor
                handleDrag(movementX, movementY)
            }
            global.window.addEventListener("touchmove", onTouchMove)
            global.window.addEventListener("mousemove", onMouseMove)
            return () => {
                global.window.removeEventListener("touchmove", onTouchMove)
                global.window.removeEventListener("mousemove", onMouseMove)
            }
        }
    }, [interactionLayer, dragBounceFunc, dragging, onChange, factor, offsetX, offsetY])

    React.useEffect(() => {
        lastPosition.current = {
            x,
            y,
            rZ
        }
    }, [rZ, x, y])

    const handleRotation = React.useCallback((rZ: number) => {
        onChange({
            ...lastPosition.current,
            rZ
        })
        lastPosition.current.rZ = rZ
    }, [onChange])
    const handleFinalRotation = React.useCallback((rZ: number) => {
        if (onFinalChange) {
            onFinalChange({
                ...lastPosition.current,
                rZ
            })
        }
        lastPosition.current.rZ = rZ
    }, [onFinalChange])

    return (
        <>
            <div ref={ref} className="item" style={{
                transform: `translate(${(x + (offsetX || 0) - (size / 2)) * factor}px, ${((y + (offsetY || 0) - (size / 2)) * factor)}px)`,
                width: `${size * factor}px`,
                height: `${size * factor}px`,
            }}>
                <div className="cage" style={{
                    width: `${size * factor}px`,
                    height: `${size * factor}px`,
                    transform: `rotate(${rZ + (offsetRz || 0)}deg`,
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
            </div>
            <style jsx>{`
                .item {
                    user-select: none;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    cursor: move;
                    overflow: visible;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: ${color ? color : 'inherit'};
                }
                .item .cage {
                    user-select: none;
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-width: 2px;
                    border-style: solid;
                    border-color: transparent;
                }
                .item span {
                    display: inline-block;
                    user-select: none;
                }
                .item img {
                    user-select: none;
                }
            `}</style>
        </>
    )
}
export {RoomItem}