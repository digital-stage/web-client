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
import {useCustomStageMemberPosition, useStageMemberPosition} from "./utils";
import Image from "next/image";
import {RoomSelection} from "./RoomSelection";

const FACTOR = 100;

export type RoomPosition = {
    x: number,
    y: number,
    rZ: number
}

const RoomItem = ({caption, src, x, y, rZ, size, dragBounceFunc, selected, onClick}: {
    x: number,
    y: number,
    rZ: number,
    size: number,
    src: string,
    caption?: string,
    selected?: boolean,
    onClick?: (e: MouseEvent) => void
    dragBounceFunc?: (pos: { x: number, y: number }) => { x: number, y: number },
}) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = React.useState<boolean>(false)
    const [currentPosition, setCurrentPosition] = React.useState<RoomPosition>({
        x: x * FACTOR,
        y: y * FACTOR,
        rZ: rZ
    })

    React.useEffect(() => {
        setCurrentPosition({
            x: x * FACTOR,
            y: y * FACTOR,
            rZ: rZ
        })
    }, [x, y, rZ])

    React.useEffect(() => {
        if (ref.current) {
            const currentRef = ref.current
            const onDragStart = () => setDragging(true)
            const onDragEnd = () => setDragging(false)
            currentRef.addEventListener("mousedown", onDragStart)
            global.window.addEventListener("mouseup", onDragEnd)
            return () => {
                currentRef.removeEventListener("mousedown", onDragStart)
                global.window.removeEventListener("mouseup", onDragEnd)
            }
        }
    }, [])

    React.useEffect(() => {
        if (dragging) {
            const onMove = (e: MouseEvent) => {
                setCurrentPosition(prev => {
                    if (dragBounceFunc) {
                        const {x, y} = dragBounceFunc({
                            x: (prev.x + e.movementX) / FACTOR,
                            y: (prev.y + e.movementY) / FACTOR
                        })
                        return {
                            x: x * FACTOR,
                            y: y * FACTOR,
                            rZ: prev.rZ
                        }
                    }
                    return {
                        x: prev.x + e.movementX,
                        y: prev.y + e.movementY,
                        rZ: prev.rZ
                    }
                })
            }
            global.window.addEventListener("mousemove", onMove)
            return () => {
                global.window.removeEventListener("mousemove", onMove)
            }
        }
    }, [dragBounceFunc, dragging])

    React.useEffect(() => {
        if (ref.current && onClick) {
            const currentRef = ref.current
            currentRef.addEventListener("click", onClick)
            return () => {
                currentRef.removeEventListener("click", onClick)
            }
        }
    }, [onClick])

    return (
        <>
            <div ref={ref} className="item" style={{
                transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
                width: `${size}px`,
                height: `${size}px`,
            }}>
                <div className="cage" style={{
                    transform: `rotate(${currentPosition.rZ}deg`,
                    borderColor: selected ? `var(---primary)` : `transparent`,
                }}>
                    {selected && <div className="rotator"/>}
                    {selected ? "SELECT" : "NO"}
                    <Image width={size} height={size} draggable={false} alt={caption} src={src}/>
                </div>
                {caption && <span>{caption}</span>}
            </div>
            <style jsx>{`
                .item {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    cursor: pointer;
                    overflow: visible;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .item .cage {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-width: 2px;
                    border-style: solid;
                    border-color: transparent;
                }
                .item .cage .rotator {
                    position: absolute;
                    top: -100%;
                    left: calc(50% - 4px);
                    border-width: 2px;
                    border-style: solid;
                    border-color: var(---primary);
                    width: 8px;
                    height: 8px;
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

const StageMemberItem = ({stageMemberId, local, selected, onSelect, onDeselect}: {
    stageMemberId: string,
    local: boolean,
    selected?: boolean,
    onSelect?: (selection: RoomSelection) => void
    onDeselect?: (selection: RoomSelection) => void
}) => {
    const stageWidth = useStageSelector(state => state.stages.byId[state.globals.stageId].width)
    const stageHeight = useStageSelector(state => state.stages.byId[state.globals.stageId].height)
    const position = useStageMemberPosition(stageMemberId)
    const customPosition = useCustomStageMemberPosition(stageMemberId)
    const userName = useStageSelector<string>(
        state =>
            state.stageMembers.byId[stageMemberId].userId &&
            state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name
            || stageMemberId
    )
    const dragBounceFunc = React.useCallback(({x, y}: { x: number, y: number }) => ({
        x: Math.min((stageWidth / 2), Math.max(-(stageWidth / 2), x)),
        y: Math.min((stageHeight / 2), Math.max(-(stageHeight / 2), y)),
    }), [stageWidth, stageHeight])
    const onClick = React.useCallback((e: MouseEvent) => {
        e.stopPropagation()
        if(selected) {
            if (onDeselect) {
                onDeselect({
                    type: 'member',
                    id: stageMemberId,
                    customId: customPosition && customPosition._id
                })
            }
        } else {
            if (onSelect) {
                onSelect({
                    type: 'member',
                    id: stageMemberId,
                    customId: customPosition && customPosition._id
                })
            }
        }
    }, [customPosition, onDeselect, onSelect, selected, stageMemberId])
    return (
        <RoomItem
            caption={userName}
            x={customPosition?.x || position.x}
            y={customPosition?.y || position.y}
            rZ={customPosition?.rZ || position.rZ}
            dragBounceFunc={dragBounceFunc}
            size={32}
            src={local ? "/room/center.svg" : "/room/member.svg"}
            selected={selected}
            onClick={onClick}
        />
    )
}

const Stage = ({children, onClick}: { children: React.ReactNode, onClick?: (e: MouseEvent) => void }) => {
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

    return (
        <>
            <div className="outer">
                <div className="inner" ref={ref}>
                    {children}
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
            `}</style>
        </>
    )
}

const RoomEditor = () => {
    const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
    const stageMemberIds = useStageSelector(state => state.stageMembers.byStage[state.globals.stageId])
    const [selection, setSelection] = React.useState<RoomSelection[]>([])
    const onStageClicked = React.useCallback(() => {
        setSelection([])
    }, [])
    const onSelect = React.useCallback((selection: RoomSelection) => {
        setSelection((prev) => [
            ...prev,
            selection,
        ])
    }, [])
    const onDeselect = React.useCallback((selection: RoomSelection) => {
        setSelection((prev) => prev.filter(sel => sel.id !== selection.id))
    }, [])

    return (
        <>
            <Stage onClick={onStageClicked}>
                {stageMemberIds.map(stageMemberId =>
                    <StageMemberItem
                        key={stageMemberId}
                        stageMemberId={stageMemberId}
                        local={stageMemberId === localStageMemberId}
                        selected={selection.some(select => select.id === stageMemberId)}
                        onSelect={onSelect}
                        onDeselect={onDeselect}
                    />
                )}
            </Stage>
            <div className="outer">
                <div className="inner">
                </div>
            </div>
        </>
    )
}
export {RoomEditor}