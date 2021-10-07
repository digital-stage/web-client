import React from "react";
import {useRoom} from "./RoomContext";

const Rotator = ({
                     x,
                     y,
                     rZ,
                     onChange,
                     onFinalChange
                 }: { x: number, y: number, rZ: number, onChange: (rZ: number) => void, onFinalChange: (rZ: number) => void }) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = React.useState<boolean>(false)
    const lastRz = React.useRef<number>(rZ)

    const {width: roomWidth, height: roomHeight, interactionLayer, factor, rotation: roomRotation} = useRoom()

    React.useEffect(() => {
        if (ref.current) {
            const currentRef = ref.current
            const onDragEnd = (e: MouseEvent | TouchEvent) => {
                if(e.cancelable) {
                    e.preventDefault()
                }
                e.stopPropagation()
                global.window.removeEventListener("touchcancel", onDragEnd)
                global.window.removeEventListener("touchend", onDragEnd)
                global.window.removeEventListener("mouseup", onDragEnd)
                onFinalChange(lastRz.current)
                setDragging(false)
            }
            const onDragStart = (e: MouseEvent | TouchEvent) => {
                if(e.cancelable) {
                    e.preventDefault()
                }
                e.stopPropagation()
                setDragging(true)
                global.window.addEventListener("touchcancel", onDragEnd)
                global.window.addEventListener("touchend", onDragEnd)
                global.window.addEventListener("mouseup", onDragEnd)
            }
            const handleClicked = (e: MouseEvent | TouchEvent) => {
                e.stopPropagation()
                e.preventDefault()
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
    }, [onFinalChange])

    const absoluteX = React.useMemo<number>(() => ((roomWidth / 2) + x) * factor, [factor, roomWidth, x])
    const absoluteY = React.useMemo<number>(() => ((roomHeight / 2) + y) * factor, [factor, roomHeight, y])

    React.useEffect(() => {
        if (interactionLayer && dragging) {
            const handleDrag = (angle: number) => {
                onChange(angle)
                lastRz.current = angle
            }
            let nodePos: { x: number, y: number } | null = null
            const handleTouchMove = (e: any) => {
                e.preventDefault()
                e.stopPropagation()
                if (e.touches.length === 1) {
                    if (!nodePos) {
                        if (e.touches[0].target && e.touches[0].target.parentElement) {
                            const rect = (e.touches[0].target.parentElement as HTMLDivElement).getBoundingClientRect()
                            nodePos = {
                                x: rect.x + (rect.width / 2),
                                y: rect.y + (rect.height / 2)
                            }
                        }
                    }
                    if (nodePos) {
                        const angle = Math.atan2(e.touches[0].pageX - nodePos.x, -(e.touches[0].pageY - nodePos.y)) * (180 / Math.PI)
                        handleDrag(angle - (roomRotation || 0))
                    }
                }
            }
            const handleMouseMove = (e: MouseEvent) => {
                if(e.cancelable) {
                    e.preventDefault()
                }
                e.stopPropagation()
                const angle = Math.atan2(e.offsetX - absoluteX, -(e.offsetY - absoluteY)) * (180 / Math.PI)
                handleDrag(angle)
            }
            global.window.addEventListener("touchmove", handleTouchMove, { passive: false })
            interactionLayer.addEventListener("mousemove", handleMouseMove)
            interactionLayer.style.setProperty("z-index", "100")
            interactionLayer.style.setProperty("cursor", "crosshair")
            return () => {
                interactionLayer.style.removeProperty("z-index")
                interactionLayer.style.removeProperty("cursor")
                global.window.removeEventListener("touchmove", handleTouchMove)
                interactionLayer.removeEventListener("mousemove", handleMouseMove)
            }
        }
    }, [onChange, interactionLayer, dragging, absoluteX, absoluteY, roomRotation])

    return (
        <>
            <div className="line"/>
            <div className="rotator" ref={ref}/>
            <style jsx>{`
              .line {
                  position: absolute;
                  top: -70%;
                  left: calc(50% - 1px);
                  width: 2px;
                  height: 70%;
                  background-color: var(---primary);
              }
              .rotator {
                  position: absolute;
                  top: -100%;
                  left: 10%;
                  width: 80%;
                  height: 80%;
                  cursor: crosshair;
              }
              .rotator:after {
                  position: absolute;
                  content: '';
                  display: block;
                  top: 30%;
                  left: 30%;
                  width: 30%;
                  height: 30%;
                  border-width: 2px;
                  border-style: solid;
                  border-color: var(---primary);
                  background-color: white;
              }
      `}</style>
        </>
    )
}
export {Rotator}