import { useStageSelector } from './useStageSelector'

const useStageAdminSelector = (stageId: string) =>
    useStageSelector<boolean>((state) =>
        state.globals.localUserId
            ? state.stages.byId[stageId].admins.some((id) => id === state.globals.localUserId)
            : false
    )
export { useStageAdminSelector }
