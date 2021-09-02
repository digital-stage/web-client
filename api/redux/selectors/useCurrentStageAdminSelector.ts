import { useStageSelector } from './useStageSelector'

const useCurrentStageAdminSelector = (): boolean =>
    useStageSelector<boolean>((state) =>
        state.globals.stageId && state.globals.localUserId
            ? state.stages.byId[state.globals.stageId].admins.some(
                  (id) => id === state.globals.localUserId
              )
            : false
    )
export { useCurrentStageAdminSelector }
