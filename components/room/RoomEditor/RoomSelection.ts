interface RoomSelection {
    type: 'group' | 'member' | 'device' | 'track'
    id: string
    customId?: string
}
export default RoomSelection
