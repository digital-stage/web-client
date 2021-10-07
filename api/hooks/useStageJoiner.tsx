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

import {useDispatch} from 'react-redux'
import {ClientDeviceEvents} from '@digitalstage/api-types'
import {useEmit} from 'api/services/ConnectionService'
import {requestJoin} from 'api/redux/actions/clientActions'
import React from "react";

const useStageJoiner = (): {
  join: (payload: { stageId: string; groupId?: string; password?: string | null }) => void
  leave: () => void
  resetJoin: () => void
} => {
  const emit = useEmit()
  const dispatch = useDispatch()

  const join = React.useCallback(
    (payload: { stageId: string; groupId?: string; password?: string | null }) => {
      dispatch(requestJoin(payload))
    },
    [dispatch]
  )

  const leave = React.useCallback(() => {
    if (emit)
      emit(ClientDeviceEvents.LeaveStage)
  }, [emit])

  const resetJoin = React.useCallback(() => {
    dispatch(requestJoin())
  }, [dispatch])

  return {
    join,
    leave,
    resetJoin,
  }
}
export {useStageJoiner}
