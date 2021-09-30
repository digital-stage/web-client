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
  clientActions,
  ConnectionStateContext, selectMode,
  useCurrentStageAdminSelector, useFilteredStageMembers,
  useStageSelector
} from "@digitalstage/api-client-react";
import {ReactReduxContext, useDispatch} from "react-redux";
import React, {useCallback} from "react";
import {Layer as KonvaLayer, Stage as KonvaStage} from "react-konva/es/ReactKonvaCore";
import {ResetPanel} from "../RoomEditor/ResetPanel";
import {HiFilter, HiOutlineFilter} from "react-icons/hi";
import {TextSwitch} from "../../../ui/TextSwitch";
import { StageMemberElement } from "./StageMemberElement";
import { RoomSelection } from "./RoomSelection";
import { FACTOR } from "./RoomElement";

const RoomEditor = () => {
  const innerRef = React.useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()

  const height = useStageSelector<number>((state) => state.stages.byId[state.globals.stageId].height)
  const width = useStageSelector<number>((state) => state.stages.byId[state.globals.stageId].width)

  const [selection, setSelection] = React.useState<RoomSelection[]>([])
  const selectedDeviceId = useStageSelector((state) => state.globals.selectedDeviceId)
  const selectedMode = useStageSelector((state) => state.globals.selectedMode)
  const isStageAdmin = useCurrentStageAdminSelector()
  const onStageClicked = React.useCallback((e) => {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      setSelection([])
    }
  }, [])
  /** Scroll into center of stage **/
  React.useEffect(() => {
    if (innerRef.current && width && height) {
      innerRef.current.scrollLeft = (width * FACTOR) / 2 - window.innerWidth / 2
      innerRef.current.scrollTop = (height * FACTOR) / 2 - window.innerHeight / 2
    }
  }, [innerRef, width, height])
  const showOffline = useStageSelector(state => state.globals.showOffline)
  const onOfflineToggle = useCallback(() => {
    dispatch(clientActions.showOffline(!showOffline))
  }, [dispatch, showOffline])

  const stageMemberIds = useFilteredStageMembers()

  return (
    <div className="roomEditor">
      <div className="roomInner" ref={innerRef}>
        <ReactReduxContext.Consumer>
          {(store) => (
            <ConnectionStateContext.Consumer>
              {(connection) => (
                <KonvaStage
                  width={width * FACTOR}
                  height={height * FACTOR}
                  onClick={onStageClicked}
                  onTap={onStageClicked}
                >
                  <KonvaLayer>
                    <ReactReduxContext.Provider value={store}>
                      <ConnectionStateContext.Provider value={connection}>
                        {stageMemberIds.map((stageMemberId) => (
                          <StageMemberElement
                            key={stageMemberId}
                            stageMemberId={stageMemberId}
                            selection={selection}
                            onSelected={(selection) =>
                              setSelection((prev) => [
                                ...prev,
                                selection,
                              ])
                            }
                          />
                        ))}
                      </ConnectionStateContext.Provider>
                    </ReactReduxContext.Provider>
                  </KonvaLayer>
                </KonvaStage>
              )}
            </ConnectionStateContext.Consumer>
          )}
        </ReactReduxContext.Consumer>
      </div>

      {isStageAdmin || selectedMode === 'personal' ? (
        <ResetPanel
          deviceId={selectedMode === 'global' ? undefined : selectedDeviceId}
          selection={selection}
        />
      ) : null}

      <button className="round offlineToggle" onClick={onOfflineToggle}>
        {showOffline ? <HiOutlineFilter/> : <HiFilter/>}
      </button>

      {isStageAdmin ? (
        <TextSwitch
          className="roomModeSwitch"
          value={selectedMode}
          onSelect={(v) => {
            dispatch(selectMode(v === 'global' ? 'global' : 'personal'))
          }}
        >
          <span key="personal">Persönliche Einstellungen</span>
          <span key="global">Voreinstellungen</span>
        </TextSwitch>
      ) : null}
    </div>
  )
}
export {RoomEditor}