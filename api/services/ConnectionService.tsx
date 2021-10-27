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

import {ITeckosClient, TeckosClientWithJWT} from 'teckos-client'
import React from 'react'
import {useDispatch} from 'react-redux'
import Cookie from 'js-cookie'
import {SocketEvent} from 'teckos-client/dist/types'
import {getInitialDevice} from '../utils/getInitialDevice'
import {registerSocketHandler} from '../redux/registerSocketHandler'
import {logger} from '../logger'
import {useNotification} from '../hooks/useNotification'
import {clientActions} from '../redux/actions'
import {useTrackedSelector} from '../redux/selectors/useTrackedSelector'
import {selectToken} from '../redux/selectors'

const {trace} = logger('ConnectionService')

type ConnectionState = ITeckosClient | undefined
type ConnectionDispatch = React.Dispatch<React.SetStateAction<ConnectionState>>

export type EmitFunction = (event: SocketEvent, ...args: any[]) => boolean

const ConnectionDispatchContext = React.createContext<ConnectionDispatch | null>(null)
const ConnectionStateContext = React.createContext<ConnectionState | null>(null)

const ConnectionProvider = ({children}: { children: React.ReactNode }): JSX.Element => {
  const [connection, setConnection] = React.useState<ConnectionState>()
  return (
    <ConnectionDispatchContext.Provider value={setConnection}>
      <ConnectionStateContext.Provider value={connection}>
        {children}
      </ConnectionStateContext.Provider>
    </ConnectionDispatchContext.Provider>
  )
}
const useConnection = (): ConnectionState => {
  const state = React.useContext(ConnectionStateContext)
  if (state === null)
    throw new Error('useConnection must be used within a ConnectionProvider')
  return state
}
const useEmit = (): EmitFunction | undefined => {
  const connection = useConnection()
  return connection?.emit
}

const ConnectionService = (): JSX.Element | null => {
  const state = useTrackedSelector()
  const userId = state.auth.user?._id
  const token = selectToken(state)
  const dispatch = useDispatch()
  const setConnection = React.useContext(ConnectionDispatchContext)
  const notify = useNotification()

  React.useEffect(() => {
    const apiUrl = state.globals.apiUrl
    if (apiUrl && setConnection && token && userId && notify) {
      let isActive = true
      let conn: ITeckosClient

      const uuid = Cookie.get(userId)
      getInitialDevice(true, uuid)
        .then((initialDevice) => {
          if (isActive) {
            trace('Creating new connection to API server')
            return new TeckosClientWithJWT(
              apiUrl,
              {
                reconnection: true,
                debug: true,
              },
              token,
              {
                device: initialDevice,
              }
            )
          }
          throw new Error("Aborted by user")
        })
        .then((conn) => {
          if (conn && isActive) {
            registerSocketHandler(dispatch, conn)
            return conn
          }
          throw new Error("Aborted by user")
        })
        .then((conn) => {
          if (isActive) {
            conn.on('reconnect', () => {
              trace('RECONNECT')
              // setConnection(conn)
            })
            conn.on('connect', () => {
              trace('CONNECTED?')
            })
            conn.on('disconnect', () => {
              // setConnection(undefined)
            })
            setConnection(conn)
            conn.connect()
          }
        })
        .catch((err) => {
          notify({
            kind: 'error',
            message: err,
          })
          console.error(err)
        })
      return () => {
        isActive = false
        if (conn) {
          trace('Closing connection to API server')
          conn.disconnect()
        }
        setConnection(undefined)
        dispatch(clientActions.reset())
      }
    }
  }, [dispatch, notify, setConnection, token, userId, state.globals.apiUrl])

  return null
}
export {ConnectionProvider, ConnectionService, useConnection, useEmit, ConnectionStateContext}
