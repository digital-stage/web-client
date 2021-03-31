import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/router";
import {
  useAuth,
  useConnection,
  ClientDeviceEvents,
  Stage,
  useStageSelector,
  User
} from "@digitalstage/api-client-react";
import {Button} from "baseui/button";
import CreateStageModal from "../components/modals/CreateStageModal";


const Stages = () => {
  // Forward to login if not authenticated
  const {push} = useRouter();
  const {loading, user: authUser} = useAuth();
  useEffect(() => {
    if (push && !loading) {
      if (!authUser) {
        push("/login")
      }
    }
  }, [authUser, loading, push])

  const user = useStageSelector<User>(state => state.globals.localUser);
  const stages = useStageSelector<Stage[]>(state => state.stages.allIds.map(stageId => state.stages.byId[stageId]));
  const connection = useConnection();
  const [createOpen, setCreatOpen] = useState<boolean>(false);

  const addStage = useCallback(() => {
    if (connection) {
      const payload: Omit<Stage, "_id"> = {
        name: "My stage",
        description: "",
      };
      connection.emit(ClientDeviceEvents.CreateStage, payload);
    }
  }, [connection]);

  return (
    <div>
      {user && user.canCreateStage && (
        <Button onClick={() => setCreatOpen(true)}>
          Add stage
        </Button>
      )}
      {stages.map(stage => (
        <div>
          {stage.name}
        </div>
      ))}
      <CreateStageModal open={createOpen} onClose={() => setCreatOpen(false)}/>
    </div>
  )
}
export default Stages;