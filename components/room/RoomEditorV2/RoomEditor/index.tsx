import React from "react";
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
    if (ref.current && center) {
      const left = ((center.x + width / 2) * factor) - window.innerWidth / 2
      const top = ((center.y + height / 2) * factor) - window.innerHeight / 2
      console.log("Scroll to ", left, top)
      ref.current.scrollLeft = left
      ref.current.scrollTop = top
    }
  }, [center, factor, width, height])

  const interactionRef = React.useRef<HTMLDivElement>()

  return (
    <>
      <div className="outer">
        <div className="inner">
            <div className="room" ref={ref}>
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
                    display: table;
                }
                .inner {
                    display: block;
                    width: ${width * FACTOR}px;
                    height: ${height * FACTOR}px;
                }
                .room {
                    position: relative;
                    overflow: visible;
                    display: block;
                    width: ${width * FACTOR}px;
                    height: ${height * FACTOR}px;
                    transition-property: transform;
                    transition-duration: 200ms;
                    transition-timing-function: cubic-bezier(0, 0, 1, 1);
                    background-image: url('/room/background.svg');
                    transform: ${rotation && `rotate(${rotation}deg)`};
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