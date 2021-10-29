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

import React from 'react'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import {NotificationItem} from 'ui/NotificationItem'
import {LiveInput} from 'ui/LiveInput'
import {
  requestPasswordReset,
  selectAuthUser, selectLocalUser,
  useEmit,
  useTrackedSelector
} from '../../client'
import {Paragraph} from 'ui/Paragraph'
import {OptionsList, OptionsListItem} from 'ui/OptionsList'

const ProfileEditor = (): JSX.Element => {
  const emit = useEmit()
  const state = useTrackedSelector()
  const authUser = selectAuthUser(state)
  const localUser = selectLocalUser(state)
  const [message, setMessage] = React.useState<string>()
  const [error, setError] = React.useState<string>()

  const onNameChanged = React.useCallback((name: string) => {
    if (emit) {
      emit(ClientDeviceEvents.ChangeUser, {
        name,
      } as ClientDevicePayloads.ChangeUser)
    }
  }, [emit])

  return (
    <>
      <LiveInput
        label="Benutername"
        value={localUser?.name}
        onChange={onNameChanged}
      />
      <OptionsList>
        <OptionsListItem as={<Paragraph/>}>Email: {authUser?.email}</OptionsListItem>
        <OptionsListItem>
          <button
            onClick={() => {
              if (authUser && state.globals.authUrl)
                requestPasswordReset(state.globals.authUrl, authUser.email)
                  .then(() =>
                    setMessage(
                      'Wir haben Dir eine E-Mail mit einem Link zum Zurücksetzen Deines Passwortes geschickt!'
                    )
                  )
                  .catch((err) => setError(err))
            }}
          >
            Passwort ändern
          </button>
        </OptionsListItem>
        {message && <NotificationItem kind="success">{message}</NotificationItem>}
        {error && <NotificationItem kind="error">{error}</NotificationItem>}
      </OptionsList>
    </>
  )
}
export {ProfileEditor}
