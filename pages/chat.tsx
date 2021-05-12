import { useAuth } from "@digitalstage/api-client-react";
import { useRouter } from "next/router";
import {useEffect} from "react";

const Chat = () => {
  const {push} = useRouter();
  const {loading, user} = useAuth()

  useEffect(() => {
    if( !loading && !user && push ) {
      push("/account/login")
    }
  }, [loading, user, push])

  return (
    <div>
      CHAT
    </div>
  )
}
export default Chat;