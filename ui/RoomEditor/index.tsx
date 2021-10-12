import React from "react";
import {MdMyLocation} from "react-icons/md";
import {DragBounceFunc, RoomItem} from "./RoomItem";
import {RoomPosition, RoomPositionWithAngle} from "./types";
import {FACTOR, RoomContext} from "./RoomContext";
import {calculateActualSize, rotatePointAroundOrigin} from "./utils";

const Room = ({children, onClick, width, height, center, rotation, className, factor = FACTOR}: {
    children: React.ReactNode,
    width: number,
    height: number,
    onClick?: (e: MouseEvent) => void,
    center?: RoomPosition,
    rotation?: number,
    factor?: number,
    className?: string
}) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const interactionRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (ref.current && onClick) {
            const currentRef = ref.current
            currentRef.addEventListener("click", onClick)
            return () => {
                currentRef.removeEventListener("click", onClick)
            }
        }
    }, [onClick])

    const [actualSize, setActualSize] = React.useState<{ width: number, height: number }>({
        width: width * factor,
        height: height * factor
    })

    React.useEffect(() => {
        if (rotation) {
            setActualSize(calculateActualSize(width * factor, height * factor, rotation))
        }
    }, [factor, height, rotation, width])

    const scrollToCenter = React.useCallback(() => {
        console.log("scrollToCenter")
        if (ref.current && center) {
            let {x} = center
            let {y} = center
            if(rotation) {
                const normalizedCenter = rotatePointAroundOrigin(x, y, 180 - rotation)
                x = normalizedCenter.x
                y = normalizedCenter.y
            }
            const top = (actualSize.height / 2) + (y * factor) - (window.innerHeight / 2)
            const left = (actualSize.width / 2) + (-1 * x * factor) - (window.innerWidth / 2)

            ref.current.scrollLeft = left
            ref.current.scrollTop = top
            ref.current.scrollTo({
                behavior: "smooth",
                top,
                left
            })
        }
    }, [center, rotation, actualSize.height, actualSize.width, factor])

    React.useEffect(() => {
        console.log("CENTER CHANGED")
    }, [center])

    React.useEffect(() => {
        console.log("scrollToCenter changed")
        scrollToCenter()
    }, [scrollToCenter])

    return (
        <>
            <div className={`roomEditor ${className || ''}`} ref={ref}>
                <div className="inner">
                    <div className="room">
                        <div ref={interactionRef} className="interaction"/>
                        <RoomContext.Provider value={{
                            room: ref.current,
                            interactionLayer: interactionRef.current,
                            width,
                            height,
                            actualWidth: actualSize.width,
                            actualHeight: actualSize.height,
                            factor,
                            rotation
                        }}>
                            {children}
                        </RoomContext.Provider>
                    </div>
                </div>
                <button className="round centerRoom" onClick={scrollToCenter}><MdMyLocation/></button>
            </div>
            <style jsx>{`
                .roomEditor {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: scroll;
                    scroll-behavior: smooth;
                }
                .inner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    width: ${actualSize.width}px;
                    height: ${actualSize.height}px;
                }
                .room {
                    position: absolute;
                    overflow: visible;
                    display: inline-flex;
                    top: 50%;
                    left: 50%;
                    width: ${width * FACTOR}px;
                    height: ${height * FACTOR}px;
                    transition-property: transform;
                    transition-duration: 200ms;
                    transition-timing-function: cubic-bezier(0, 0, 1, 1);
                    background-image: url('/room/background.svg');
                    transform: translate(-50%, -50%) ${rotation ? `rotate(${rotation}deg)` : ''};
                }
                .interaction {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                }
                .centerRoom {
                    position: fixed;
                    bottom: 16px;
                    right: 16px;
                }
            `}</style>
        </>
    )
}
export type {RoomPosition, RoomPositionWithAngle, DragBounceFunc}
export {Room, RoomItem}