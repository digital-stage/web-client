/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
                        console.warn("Could not report to central logging service:")
                        console.warn(err)
                    })
            }
        }
    }, [deviceId, email, stageId, userId])
}
export {useLogServer}