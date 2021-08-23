import React, {useContext} from 'react'
import {SocketEvent} from "teckos-client/dist/types";
import {EmitContext} from "../provider/ConnectionProvider";

const useEmit = (): (event: SocketEvent, ...args: any[]) => boolean => {
  return useContext(EmitContext)
}
export default useEmit
