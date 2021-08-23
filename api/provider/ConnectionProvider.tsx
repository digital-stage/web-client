import debug from 'debug'
import {ITeckosClient, TeckosClientWithJWT} from 'teckos-client'
import React, {createContext, useEffect, useState} from 'react'
import {useStageSelector} from '@digitalstage/api-client-react'
import {useDispatch} from 'react-redux'
import getInitialDevice from '../utils/getInitialDevice'
import registerSocketHandler from '../redux/registerSocketHandler'
import Cookie from "js-cookie"
import {SocketEvent} from "teckos-client/dist/types";

// FINAL DECISION: We need emit inside react - also with callbacks. So there is no possibility to use middleware API or redux in general for the state handling ...

const log = debug('ConnectionProvider')

export const EmitContext = createContext<(event: SocketEvent, ...args: any[]) => boolean>(undefined)
export const ConnectionContext = createContext<ITeckosClient>(undefined)

const ConnectionProvider = ({children}: { children: React.ReactNode }): JSX.Element => {
  const userId = useStageSelector<string | undefined>((state) => state.auth.user?._id)
  const token = useStageSelector<string | undefined>((state) => state.auth.token)
  const [connection, setConnection] = useState<ITeckosClient>()
  const dispatch = useDispatch()

  useEffect(() => {
    if (token && userId) {
      let isActive = true
      let conn: ITeckosClient

      const uuid = Cookie.get(userId)
      getInitialDevice(true, uuid)
        .then((initialDevice) => {
          if (isActive) {
            log('Creating new connection to API server')
            return new TeckosClientWithJWT(
              process.env.NEXT_PUBLIC_API_URL,
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
          return undefined
        })
        .then((conn) => {
          if (conn && isActive) {
            registerSocketHandler(dispatch, conn)
            return conn
          }
          return undefined
        })
        .then((conn) => {
          if (isActive) {
            setConnection(conn)
            conn.connect()
          }
        })
      return () => {
        isActive = false
        if (conn) {
          log('Closing connection to API server')
          conn.disconnect()
        }
        setConnection(undefined)
      }
    }
  }, [dispatch, token, userId])

  return (
    <ConnectionContext.Provider value={connection}>
      <EmitContext.Provider value={connection?.emit}>
        {children}
      </EmitContext.Provider>
    </ConnectionContext.Provider>
  )
}

export default ConnectionProvider
