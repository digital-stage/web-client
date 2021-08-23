import {Provider, useDispatch} from 'react-redux'
import store from './redux/store'
import * as React from 'react'
import DigitalStageServices from './services/DigitalStageServices'
import StageHandlingProvider from './provider/StageHandlingProvider'
import AudioContextProvider from './provider/AudioContextProvider'
import ReportingProvider from './provider/ReportingProvider'
import {useEffect} from "react";
import {init} from "./redux/actions";
import ConnectionProvider from './provider/ConnectionProvider'

const MemorizedDigitalStageServices = React.memo(DigitalStageServices)

//TODO: Replace StageHandlingProvider with redux only

const DigitalStageProviderWithStore = ({children}: { children: React.ReactNode }) => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(init())
  }, [dispatch])
  return (
    <ReportingProvider>
      <ConnectionProvider>
        <StageHandlingProvider>
          <AudioContextProvider>
            <MemorizedDigitalStageServices/>
            {children}
          </AudioContextProvider>
        </StageHandlingProvider>
      </ConnectionProvider>
    </ReportingProvider>
  )
}

const DigitalStageProvider = ({children}: { children: React.ReactNode }) => <Provider
  store={store}><DigitalStageProviderWithStore>{children}</DigitalStageProviderWithStore></Provider>
export default DigitalStageProvider
