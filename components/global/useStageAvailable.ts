import {useRouter} from "next/router";
import {useStageSelector} from "@digitalstage/api-client-react";
import {useEffect} from "react";

const useStageAvailable = (): boolean => {
    const {replace} = useRouter()
    const ready = useStageSelector((state) => state.globals.ready)
    const stageAvailable = useStageSelector((state) => !!state.globals.stageId)

    useEffect(() => {
        if (ready && !stageAvailable) {
            replace('/stages')
        }
    }, [replace, ready, stageAvailable])

    return stageAvailable
}
export {useStageAvailable}