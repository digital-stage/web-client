import {connection} from "./connectionMiddleware";
import {Dispatch, Middleware} from "redux";
import {ServerDeviceEvents, ServerDevicePayloads, Stage} from "@digitalstage/api-types";
import debug from "debug";
import {RootState} from "./state";
import {BrowserDevice} from "@digitalstage/api-types/dist/model/browser";
import {Transport as MediasoupTransport} from 'mediasoup-client/lib/Transport'
import {Device as MediasoupDevice} from 'mediasoup-client/lib/Device'
import {ITeckosClient, TeckosClient} from "teckos-client";
import {createWebRTCTransport, getRTPCapabilities} from "../services/MediasoupService/util";
import {InternalActionTypes} from "@digitalstage/api-client-react";

const report = debug("mediasoupMiddleware")
const reportError = report.extend("error")

let routerConnection: ITeckosClient
let mediasoupDevice: MediasoupDevice
let sendTransport: MediasoupTransport
let receiveTransport: MediasoupTransport

const connect = (routerUrl: string): any => async (dispatch) => {
  const conn = new TeckosClient(routerUrl, {
    reconnection: true,
  })
  conn.on('disconnect', () => {
    disconnect()
  })
  conn.on('connect', async () => {
    report(`Connected to router ${routerUrl}`)
    try {
      mediasoupDevice = new MediasoupDevice()
      const rtpCapabilities = await getRTPCapabilities(conn)
      await mediasoupDevice.load({routerRtpCapabilities: rtpCapabilities})
      console.log('CONNECTING HERE')
      sendTransport = await createWebRTCTransport(conn, mediasoupDevice, 'send')
      receiveTransport = await createWebRTCTransport(conn, mediasoupDevice, 'receive')
      dispatch({type: InternalActionTypes.SET_MEDIASOUP_CONNECTED, payload: true})
    } catch (err) {
      reportError(err)
    }
  })
  conn.connect()
}
const disconnect = (): any => (dispatch) => {
  if (sendTransport)
    sendTransport.close()
  if (receiveTransport)
    receiveTransport.close()
  if (routerConnection)
    routerConnection.disconnect()
  sendTransport = undefined
  receiveTransport = undefined
  routerConnection = undefined
  dispatch({type: InternalActionTypes.SET_MEDIASOUP_CONNECTED, payload: false})
}

const handleDeviceUpdate = (prevDevice: BrowserDevice | undefined, update: Partial<BrowserDevice>, dispatch: Dispatch) => {
  // If P2P changed, init all
  if (update.useP2P !== undefined && !update.useP2P) {
    report("start all")
  } else if (update.useP2P === undefined) {
    report("check partial")
    if (!prevDevice || update.sendVideo && update.sendVideo !== prevDevice.sendVideo) {
      report("sendVideo", update.sendVideo)
    }
    if (!prevDevice || update.sendAudio && update.sendAudio !== prevDevice.sendAudio) {
      report("sendAudio", update.sendVideo)
    }
    if (!prevDevice || update.receiveVideo && update.receiveVideo !== prevDevice.receiveVideo) {
      report("receiveVideo", update.receiveVideo)
    }
    if (!prevDevice || update.receiveAudio && update.receiveAudio !== prevDevice.receiveAudio) {
      report("receiveAudio", update.receiveAudio)
    }
  } else {
    report("stop all")
  }

  if (update.useP2P !== undefined && !update.useP2P || update.useP2P === undefined && !prevDevice.useP2P) {


  } else {
    report("stop all")
  }
}

const handleStageChange = (stage?: Stage) => (dispatch) => {
  if (
    stage &&
    (stage?.videoType === 'mediasoup' || stage?.audioType === 'mediasoup') &&
    stage.mediasoup
  ) {
    dispatch(connect(`${stage.mediasoup.url}:${stage.mediasoup.port}`))
  } else {
    dispatch(disconnect())
  }
}

const mediasoupMiddleware: Middleware<{}, // Most middleware do not modify the dispatch return value
  RootState> = (storeApi) => (next) => (action) => {
  const prevState = storeApi.getState()
  const dispatch = storeApi.dispatch

  switch (action.type) {
    case ServerDeviceEvents.Ready: {
      handleStageChange(prevState.globals.stageId ? prevState.stages.byId[prevState.globals.stageId] : undefined)
      const localDeviceId = prevState.globals.localDeviceId
      handleDeviceUpdate(undefined, prevState.devices.byId[localDeviceId] as BrowserDevice, dispatch)
      break
    }
    case ServerDeviceEvents.StageJoined: {
      if (prevState.globals.ready) {
        const {stageId, stage: deliveredStage} = action.payload as ServerDevicePayloads.StageJoined
        handleStageChange(deliveredStage || prevState.stages.byId[stageId])
      }
      break
    }
    case ServerDeviceEvents.StageLeft: {
      handleStageChange(undefined)
      break
    }
    case ServerDeviceEvents.DeviceAdded:
    case ServerDeviceEvents.DeviceChanged: {
      if (prevState.globals.ready) {
        const localDeviceId = prevState.globals.localDeviceId
        const update = action.payload as Partial<BrowserDevice> & { _id: string }
        if (localDeviceId === update._id) {
          handleDeviceUpdate(prevState.devices.byId[localDeviceId] as BrowserDevice, update, dispatch)
        }
      }
      break
    }
  }

  return next(action)
}

export default mediasoupMiddleware