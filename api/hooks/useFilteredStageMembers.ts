import {StageMember} from "@digitalstage/api-types";
import {useStageSelector} from "@digitalstage/api-client-react";

const sortStageMembers = (a: StageMember, b: StageMember): number => {
    if (a.active === b.active) {
        if (a._id <= b._id) {
            return -1;
        }
        return 1;
    } else if (a.active) {
        return -1
    } else {
        return 1
    }
}

const useFilteredStageMembers = () => useStageSelector(state => {
    if (state.globals.stageId) {
        if (state.globals.showOffline) {
            return [...state.stageMembers.byStage[state.globals.stageId]].sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
        }
        return state.stageMembers.byStage[state.globals.stageId].filter(id => state.stageMembers.byId[id].active).sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
    }
    return []
})

export {useFilteredStageMembers, sortStageMembers}
