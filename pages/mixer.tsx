import {useAuth} from "@digitalstage/api-client-react";
import {useRouter} from "next/router";
import {useEffect} from "react";
import MixingPanel from "../components/mixer/MixingPanel";

const Mixer = () => {
  const {push} = useRouter();
  const {loading, user} = useAuth()

  useEffect(() => {
    if (!loading && !user && push) {
      push("/account/login")
    }
  }, [loading, user, push])

  return <MixingPanel/>
}
export default Mixer;
