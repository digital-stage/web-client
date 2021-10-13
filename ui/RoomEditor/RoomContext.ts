import React from "react";

export const FACTOR = 100

export type RoomState = {
    room: HTMLDivElement | null,
    interactionLayer: HTMLDivElement | null,
    width: number,
    height: number,
    actualWidth: number,
    actualHeight: number,
    factor: number,
    rotation?: number
}

const RoomContext = React.createContext<RoomState | null>(null)

const useRoom = (): RoomState => {
    const context = React.useContext(RoomContext)
    if (context === null)
        throw new Error("Please wrap all room items inside an room")
    return context
}

export {RoomContext, useRoom}