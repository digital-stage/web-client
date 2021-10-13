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

import {
  selectReady,
  useEmit,
  useNotification,
  useStageJoiner,
  useTrackedSelector,
} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import React from 'react'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import {Loading} from "../../components/global/Loading";

const JoinPage = () => {
  const {isReady, query} = useRouter()
  const {join} = useStageJoiner()
  const notify = useNotification()
  const emit = useEmit()
  const state = useTrackedSelector()
  const ready = selectReady(state)

  React.useEffect(() => {
    if (emit && isReady && ready && notify) {
      const code = Array.isArray(query.code) ? query.code[0] : query.code
      emit(
        ClientDeviceEvents.DecodeInviteCode,
        code as ClientDevicePayloads.DecodeInviteCode,
        (
          error: string | null,
          result?: { stageId: string; groupId: string; code: string }
        ) => {
          if (error) {
            return notify({kind: 'error', message: error})
          }
          if (result) {
            const {stageId, groupId} = result
            return join({
              stageId,
              groupId,
              password: undefined
            })
          }
          return notify({kind: 'error', message: 'Ungültige Antwort vom Server'})
        }
      )
    }
  }, [emit, isReady, query, ready, notify, join])

  return <Loading message="Trete bei ..."/>
}
export default JoinPage
