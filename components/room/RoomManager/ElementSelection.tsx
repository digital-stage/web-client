interface ElementSelection {
    stageMemberId?: string
    stageDeviceId?: string
    audioTrackId?: string
    customStageMemberId?: string
    customStageDeviceId?: string
    customAudioTrackId?: string
    type: 'sm' | 'sd' | 'a' | 'csm' | 'csd' | 'ca'
}
export default ElementSelection
