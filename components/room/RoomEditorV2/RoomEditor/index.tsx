import React from "react";
import {DragBounceFunc, RoomItem} from "./RoomItem";
import {RoomPosition, RoomPositionWithAngle} from "./types";
import {FACTOR, RoomContext} from "./RoomContext";
import {logger} from "@digitalstage/api-client-react";
import { calculateActualSize } from "./utils";

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

    React.useEffect(() => {
        if (ref.current && onClick) {
            const currentRef = ref.current
            currentRef.addEventListener("click", onClick)
            return () => {
                currentRef.removeEventListener("click", onClick)
            }
        }
    }, [onClick])


    const interactionRef = React.useRef<HTMLDivElement>()


    const [actualSize, setActualSize] = React.useState<{ width: number, height: number }>({
        width,
        height
    })

   React.useEffect(() => {
        if (ref.current && rotation) {
            const size = calculateActualSize(width * factor, height * factor, rotation)
            setActualSize(size)
        }
    }, [factor, height, rotation, width])

    const scrollToCenter = React.useCallback(() => {
        if (ref.current && center) {
            const left = ((center.x + width / 2) * factor) - window.innerWidth / 2
            const top = ((center.y + height / 2) * factor) - window.innerHeight / 2
            trace("Scroll to ", left, top)
            ref.current.scrollLeft = left
            ref.current.scrollTop = top
        }
    }, [center, factor, height, width])


    React.useEffect(() => {
        scrollToCenter()
    }, [scrollToCenter])


    return (
        <>
            <div className="outer">
                <div className="inner" ref={ref}>
                    <div className="room">
                        <div ref={interactionRef} className="interaction"/>
                        <RoomContext.Provider value={{
                            interactionLayer: interactionRef.current,
                            width,
                            height,
                            factor,
                            rotation
                        }}>
                            {children}
                        </RoomContext.Provider>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .outer {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: scroll;
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
            `}</style>
        </>
    )
}
export type {RoomPosition, RoomPositionWithAngle, DragBounceFunc}
export {Room, RoomItem}