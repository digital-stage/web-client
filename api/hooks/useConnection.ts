import {useContext} from 'react'
import {ConnectionContext} from "../provider/ConnectionProvider";
import {ITeckosClient} from "teckos-client";

const useConnection = (): ITeckosClient => {
  return useContext(ConnectionContext)
}
export default useConnection
