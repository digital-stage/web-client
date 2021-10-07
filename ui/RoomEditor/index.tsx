import React from "react";
import {DragBounceFunc, RoomItem} from "./RoomItem";
import {RoomPosition, RoomPositionWithAngle} from "./types";
import {FACTOR, RoomContext} from "./RoomContext";
import {logger} from "@digitalstage/api-client-react";
import {calculateActualSize, rotatePointAroundOrigin} from "./utils";
import {MdMyLocation} from "react-icons/md";

const {trace} = logger("RoomEditor")

const Room = ({children, onClick, width, height, center, rotation, factor = FACTOR}: {
    children: React.ReactNode,
    width: number,
    height: number,
    onClick?: (e: MouseEvent) => void,
    center?: RoomPosition,
    rotation?: number,
    factor?: number
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
        width,
        height
    })

    React.useEffect(() => {
        if (rotation) {
            setActualSize(calculateActualSize(width * factor, height * factor, rotation))
        }
    }, [factor, height, rotation, width])

    const scrollToCenter = React.useCallback(() => {
        if (ref.current && center) {
            let x = (-1) * center.x
            let y = (-1) * center.y
            if(rotation) {
                const normalizedCenter = rotatePointAroundOrigin(x, y, rotation)
                x = normalizedCenter.x
                y = normalizedCenter.y
            }
            const top = (actualSize.height / 2) + (y * factor) - (window.innerHeight / 2)
            const left = (actualSize.width / 2) + (x * factor) - (window.innerWidth / 2)

            trace("Scroll from " + ref.current.scrollTop + " to " + top)
            ref.current.scrollLeft = left
            ref.current.scrollTop = top
            ref.current.scrollTo({
                behavior: "smooth",
                top: top,
                left: left
            })
        }
    }, [center, rotation, actualSize.height, actualSize.width, factor])

    React.useEffect(() => {
        scrollToCenter()
    }, [scrollToCenter])

    return (
        <>
            <div className="roomEditor" ref={ref}>
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
                    transform: translate(-50%, -50%) ${rotation && `rotate(${rotation}deg)`};
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