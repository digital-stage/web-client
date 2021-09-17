import React, {useCallback} from 'react'
import { Layer as KonvaLayer, Stage as KonvaStage } from 'react-konva/es/ReactKonvaCore'
import {
    selectMode,
    useStageSelector,
    ConnectionStateContext,
    useCurrentStageAdminSelector,
    clientActions,
} from '@digitalstage/api-client-react'
import { ReactReduxContext, useDispatch } from 'react-redux'
import { FACTOR } from './RoomElement'
import {RoomSelection} from './RoomSelection'
import {GroupItem} from './GroupItem'
import {TextSwitch} from 'ui/TextSwitch'
import {ResetPanel} from './ResetPanel'
import {HiFilter, HiOutlineFilter} from "react-icons/hi";

const RoomEditor = ({ stageId }: { stageId: string }) => {
    const innerRef = React.useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()

    const height = useStageSelector<number>((state) => state.stages.byId[stageId].height)
    const width = useStageSelector<number>((state) => state.stages.byId[stageId].width)

    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[stageId] || [])
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
                                                {groupIds.map((groupId) => (
                                                    <GroupItem
                                                        key={groupId}
                                                        groupId={groupId}
                                                        deviceId={
                                                            selectedMode === 'global'
                                                                ? undefined
                                                                : selectedDeviceId
                                                        }
                                                        stageWidth={width}
                                                        stageHeight={height}
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

export { RoomEditor }
