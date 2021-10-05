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

import React from "react";
import {useStageSelector} from "@digitalstage/api-client-react";
import {FACTOR, RoomPosition} from "./utils";
import Image from "next/image";

const InteractionLayerContext = React.createContext<HTMLDivElement>(null)

const Rotator = ({
                   x,
                   y,
                   stageWidth,
                   stageHeight,
                   onChange
                 }: { x: number, y: number, stageWidth: number, stageHeight: number, onChange: (rZ: number) => void }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState<boolean>(false)

  const interactiveRef = React.useContext(InteractionLayerContext)

  React.useEffect(() => {
    if (ref.current) {
      const currentRef = ref.current
      const onDragEnd = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        global.window.removeEventListener("touchcancel", onDragEnd)
        global.window.removeEventListener("touchend", onDragEnd)
        global.window.removeEventListener("mouseup", onDragEnd)
        setDragging(false)
      }
      const onDragStart = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragging(true)
        global.window.addEventListener("touchcancel", onDragEnd)
        global.window.addEventListener("touchend", onDragEnd)
        global.window.addEventListener("mouseup", onDragEnd)
      }
      const handleClicked = (e: MouseEvent) => {
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
  }, [])

  const absoluteX = React.useMemo<number>(() => ((stageWidth / 2) + x) * FACTOR, [stageWidth, x])
  const absoluteY = React.useMemo<number>(() => ((stageHeight / 2) + y) * FACTOR, [stageHeight, y])

  React.useEffect(() => {
    if (interactiveRef && dragging) {
      const handleMove = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const angle = Math.atan2(e.offsetX - absoluteX, -(e.offsetY - absoluteY)) * (180 / Math.PI)
        onChange(angle)
      }
      interactiveRef.addEventListener("touchmove", handleMove)
      interactiveRef.addEventListener("mousemove", handleMove)
      interactiveRef.style.setProperty("z-index", "100")
      interactiveRef.style.setProperty("cursor", "crosshair")
      return () => {
        interactiveRef.style.removeProperty("z-index" )
        interactiveRef.style.removeProperty("cursor")
        interactiveRef.removeEventListener("touchmove", handleMove)
        interactiveRef.removeEventListener("mousemove", handleMove)
      }
    }
  }, [onChange, interactiveRef, dragging, absoluteX, absoluteY])

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
                  left: 35%;
                  border-width: 2px;
                  border-style: solid;
                  border-color: var(---primary);
                  width: 30%;
                  height: 30%;
                  cursor: crosshair;
              }
      `}</style>
    </>
  )
}

const RoomItem = ({
                    caption,
                    src,
                    x,
                    y,
                    rZ,
                    stageWidth,
                    stageHeight,
                    size,
                    dragBounceFunc,
                    selected,
                    onClicked,
                    onChange,
                    onFinalChange
                  }: {
  x: number,
  y: number,
  rZ: number,
  size: number,
  stageWidth: number,
  stageHeight: number,
  src: string,
  caption?: string,
  selected?: boolean,
  onClicked?: (e: MouseEvent) => void
  onChange?: (position: RoomPosition) => void
  onFinalChange?: (position: RoomPosition) => void
  dragBounceFunc?: (pos: { x: number, y: number }) => { x: number, y: number },
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState<boolean>(false)
  const dragged = React.useRef<boolean>(false)
  const [currentPosition, setCurrentPosition] = React.useState<RoomPosition>({
    x: x,
    y: y,
    rZ: rZ
  })

  React.useEffect(() => {
    setCurrentPosition({
      x: x,
      y: y,
      rZ: rZ
    })
  }, [x, y, rZ])

  React.useEffect(() => {
    if (ref.current) {
      const currentRef = ref.current
      const onDragEnd = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        global.window.removeEventListener("touchcancel", onDragEnd)
        global.window.removeEventListener("touchend", onDragEnd)
        global.window.removeEventListener("mouseup", onDragEnd)
        setDragging(false)
        if (dragged.current) {
          if (onFinalChange) {
            setCurrentPosition(prev => {
              onFinalChange(prev)
              return prev
            })
          }
        } else if (onClicked) {
          onClicked(e)
        }
      }
      const onDragStart = (e: MouseEvent) => {
        e.preventDefault()
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

  React.useEffect(() => {
    if (dragging) {
      const onMove = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragged.current = true
        const movementX = e.movementX / FACTOR
        const movementY = e.movementY / FACTOR
        setCurrentPosition(prev => {
          const position = {
            ...(dragBounceFunc
              ? dragBounceFunc({x: prev.x + movementX, y: prev.y + movementY})
              : {x: prev.x + movementX, y: prev.y + movementY}),
            rZ: prev.rZ
          }
          if (onChange)
            onChange(position)
          return position
        })
      }
      global.window.addEventListener("touchmove", onMove)
      global.window.addEventListener("mousemove", onMove)
      return () => {
        global.window.removeEventListener("touchmove", onMove)
        global.window.removeEventListener("mousemove", onMove)
      }
    }
  }, [dragBounceFunc, dragging, onChange])

  return (
    <>
      <div ref={ref} className="item" style={{
        transform: `translate(${(currentPosition.x * FACTOR) - (size / 2)}px, ${(currentPosition.y * FACTOR) - (size / 2)}px)`,
        width: `${size}px`,
        height: `${size}px`,
      }}>
        <div className="cage" style={{
          transform: `rotate(${currentPosition.rZ}deg`,
          borderColor: selected ? `var(---primary)` : `transparent`,
        }}>
          <Image width={size} height={size} draggable={false} alt={caption} src={src}/>
          {selected && <Rotator
              x={x}
              y={y}
              stageWidth={stageWidth}
              stageHeight={stageHeight}
              onChange={(rZ) => {
                setCurrentPosition(prev => ({
                  ...prev,
                  rZ: rZ
                }))
              }}/>
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

const Room = ({children, onClick}: { children: React.ReactNode, onClick?: (e: MouseEvent) => void }) => {
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

  const interactionRef = React.useRef<HTMLDivElement>()

  return (
    <>
      <div className="outer">
        <div className="inner" ref={ref}>
          <div ref={interactionRef} className="interaction"/>
          <InteractionLayerContext.Provider value={interactionRef.current}>
            {children}
          </InteractionLayerContext.Provider>
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

export {Room, RoomItem}