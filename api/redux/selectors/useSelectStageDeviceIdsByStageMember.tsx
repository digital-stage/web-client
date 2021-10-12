import {
  selectShowOffline,
  useTrackedSelector
} from "@digitalstage/api-client-react";
import React from "react";
import {sortStageDevices} from "./utils";

const useSelectStageDeviceIdsByStageMember = (stageMemberId: string): string[] => {
  const state = useTrackedSelector()
  const showOffline = selectShowOffline(state)
  return React.useMemo(() => {
    if(state.stageDevices.byStageMember[stageMemberId]) {
      if (showOffline) {
        return state.stageDevices.byStageMember[stageMemberId]
            .filter(id => state.stageDevices.byId[id].active)
            .sort((a, b) => sortStageDevices(state.stageDevices.byId[a], state.stageDevices.byId[b]))
      } else {
        return [...state.stageDevices.byStageMember[stageMemberId]]
            .sort((a, b) => sortStageDevices(state.stageDevices.byId[a], state.stageDevices.byId[b]))
      }
    }
    return []
  }, [stageMemberId, state.stageDevices.byStageMember, state.stageDevices.byId, showOffline])
}

export {useSelectStageDeviceIdsByStageMember}