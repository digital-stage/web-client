import {selectAndFilterStageDeviceIdsByStageMember, useStageSelector} from "@digitalstage/api-client-react";
import {StageDevice} from "@digitalstage/api-types";

const useSelectStageDeviceIdsByStageMember = (stageMemberId: string) => useStageSelector(state => selectAndFilterStageDeviceIdsByStageMember(state, stageMemberId))

export {useSelectStageDeviceIdsByStageMember}