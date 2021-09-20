import React from "react";
import {useStageSelector} from "@digitalstage/api-client-react";

export type LogServerReportFn = (event: string, payload: any) => void

const useLogServer = (): LogServerReportFn => {
    const userId = useStageSelector(state => state.globals.localUserId)
    const deviceId = useStageSelector(state => state.globals.localDeviceId)
    const email = useStageSelector(state => state.auth.user?.email)
    const stageId = useStageSelector(state => state.globals.stageId)

    return React.useCallback((event: string, payload: any) => {
        if (process.env.NEXT_PUBLIC_LOG_URL) {
            console.log("SENDING LOG")
            if (userId && deviceId && email && stageId) {
                fetch(process.env.NEXT_PUBLIC_LOG_URL + "/" + event,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            ...payload,
                            userId: userId,
                            deviceId: deviceId,
                            email: email,
                            stageId: stageId
                        })
                    }
                )
                    .catch(err => {
                        console.error("Could not report to central logging service:")
                        console.error(err)
                    })
            }
        } else {
            console.log("Missing log server")
        }
    }, [deviceId, email, stageId, userId])
}
export {useLogServer}