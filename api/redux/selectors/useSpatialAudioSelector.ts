import { useStageSelector } from './useStageSelector'

const useSpatialAudioSelector = (): boolean =>
    useStageSelector<boolean>((state) =>
        state.globals.stageId ? state.stages.byId[state.globals.stageId].render3DAudio : false
    )
export { useSpatialAudioSelector }
