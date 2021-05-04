import {useEffect} from "react";
import {useRouter} from "next/router";
import {useAuth, useStageSelector} from "@digitalstage/api-client-react";

const FORWARD = false;

export default function Home() {
  const {loading, user} = useAuth();
  const {push} = useRouter();
  const ready = useStageSelector<boolean>(state => state.globals.ready);
  const stageId = useStageSelector<string>(state => state.globals.stageId);

  useEffect(() => {
    if (push && !loading) {
      if (!user) {
        push("/login")
      } else if (ready) {
        if (stageId) {
          push("/stage")
        } else {
          push("/stages")
        }
      }
    }
  }, [user, loading, push, ready, stageId])

  return (
    <div>
      Loading...
    </div>
  )
}
