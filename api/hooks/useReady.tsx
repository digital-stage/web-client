import { useStageSelector } from "../redux/selectors/useStageSelector"

const useReady = () => useStageSelector(state => state.globals.ready)

export {useReady}