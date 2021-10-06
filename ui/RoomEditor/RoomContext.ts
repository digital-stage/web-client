import React from "react";

export const FACTOR: number = 100

export type RoomState = {
    interactionLayer: HTMLDivElement,
    width: number,
    height: number,
    factor: number,
    rotation: number
}

const RoomContext = React.createContext<RoomState>(null)

export {RoomContext}