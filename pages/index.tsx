import {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import {useAuth, useStageSelector} from '@digitalstage/api-client-react'
import LoadingOverlay from "../components/LoadingOverlay";

export default function Home() {
  const {loading, user} = useAuth()
  const {push} = useRouter()
  const ready = useStageSelector<boolean>((state) => state.globals.ready)
  const stageId = useStageSelector<string>((state) => state.globals.stageId)
  const [state, setState] = useState<string>("Anmeldeinfos");

  useEffect(() => {
    if (push && !loading) {
      if (!user) {
        setState("Anmeldeformular")
        push('/account/login')
      } else if (ready) {
        setState("Bühneninfos")
        if (stageId) {
          push('/stage')
        } else {
          push('/stages')
        }
      } else {
        setState("Nutzerinfos")
      }
    }
  }, [user, loading, push, ready, stageId])

  return (<LoadingOverlay>
    <h1>Lade {state}...</h1>
  </LoadingOverlay>)
}
