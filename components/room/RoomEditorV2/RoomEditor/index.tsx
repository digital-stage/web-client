import React from "react";
import {useStageSelector} from "@digitalstage/api-client-react";
import {DragBounceFunc, RoomItem} from "./RoomItem";
import {RoomPosition, RoomPositionWithAngle} from "./types";
import {FACTOR, RoomContext} from "./RoomContext";

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
    const stageWidth = useStageSelector(state => state.stages.byId[state.globals.stageId].width)
    const stageHeight = useStageSelector(state => state.stages.byId[state.globals.stageId].height)

    React.useEffect(() => {
        if (ref.current && onClick) {
            const currentRef = ref.current
            currentRef.addEventListener("click", onClick)
            return () => {
                currentRef.removeEventListener("click", onClick)
            }
        }
    }, [onClick])

    React.useEffect(() => {
        if (center) {

        }
    }, [center])

    const interactionRef = React.useRef<HTMLDivElement>()

    return (
        <>
            <div className="outer">
                <div className="inner" ref={ref}>
                    <div ref={interactionRef} className="interaction"/>
                    <RoomContext.Provider value={{
                        interactionLayer: interactionRef.current,
                        width,
                        height,
                        factor
                    }}>
                        {children}
                    </RoomContext.Provider>
                </div>
            </div>
            <style jsx>{`
                .outer {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    flex-grow: 1;
                    overflow: scroll;
                }
                .inner {
                    position: absolute;
                    width: ${stageWidth * FACTOR}px;
                    height: ${stageHeight * FACTOR}px;
                    transition-property: transform;
                    transition-duration: 200ms;
                    transition-timing-function: cubic-bezier(0, 0, 1, 1);
                    transform: ${rotation ? `rotate(${rotation}deg)` : 'none'};
                    background-image: url('/room/background.svg');
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