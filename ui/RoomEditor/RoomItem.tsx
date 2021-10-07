import React from "react";
import {RoomContext} from "./RoomContext";
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
  onClicked?: (e: MouseEvent) => void
  onChange: (position: RoomPositionWithAngle) => void
  onFinalChange?: (position: RoomPositionWithAngle) => void
  dragBounceFunc?: DragBounceFunc,
  children?: React.ReactNode
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState<boolean>(false)
  const dragged = React.useRef<boolean>(false)
  const y = React.useMemo(() => {
    return invertedY * -1
  }, [invertedY])
  const offsetY = React.useMemo(() => {
    return invertedOffsetY * -1
  }, [invertedOffsetY])

  const {
    interactionLayer,
    factor,
    width: roomWidth,
    height: roomHeight,
    rotation: roomRotation
  } = React.useContext(RoomContext)

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
          let positionWithOffset = {
            x: lastPosition.current.x + movementX + (offsetX || 0),
            y: lastPosition.current.y + movementY + (offsetY || 0)
          }
          const bounced = dragBounceFunc(positionWithOffset)
          // Use drag bounce result, but subtract offset again
          const position: RoomPositionWithAngle = {
            x: bounced.x - (offsetX || 0),
            y: bounced.y - (offsetY || 0),
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
      let previousTouch: Touch = undefined
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation()
        if (e.touches.length === 1) {
          // Use only single touch
          const touch = e.touches[0]
          if (previousTouch) {
            let x = touch.pageX / factor
            let y = touch.pageY / factor
            let rX = previousTouch.pageX / factor
            let rY = previousTouch.pageY / factor
            let movementX = x - rX
            let movementY = y - rY
            if (roomRotation) {
              const rotated = rotatePointAroundOrigin(movementX, movementY, -roomRotation)
              movementX = rotated.x
              movementY = rotated.y
            }
            // Invert the y axis
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
        let mX = e.movementX
        let mY = e.movementY
        // First normalize x and y, since we could have an rotated room
        if (roomRotation) {
          const rotated = rotatePointAroundOrigin(e.movementX, e.movementY, -roomRotation)
          mX = rotated.x
          mY = rotated.y
        }
        handleDrag(mX / factor, mY / factor)
      }
      global.window.addEventListener("touchmove", onTouchMove)
      global.window.addEventListener("mousemove", onMouseMove)
      return () => {
        global.window.removeEventListener("touchmove", onTouchMove)
        global.window.removeEventListener("mousemove", onMouseMove)
      }
    }
  }, [interactionLayer, dragBounceFunc, dragging, onChange, factor, offsetX, offsetY, roomRotation])

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
        transform: `translate(${(x + (offsetX || 0) - (size / 2)) * factor}px, ${((y + (offsetY || 0) - (size / 2)) * factor)}px) rotate(${-roomRotation || 0}deg)`,
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
        {process.env.NODE_ENV !== "production" && <span className="info">({Math.round(x)}|{Math.round(y)}) with {Math.round(rZ)}&deg;</span>}
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