import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Layer as KonvaLayer, Stage as KonvaStage } from 'react-konva/es/ReactKonvaCore'
import styles from './RoomEditor.module.scss'
import { selectMode, useStageSelector } from '@digitalstage/api-client-react'
import { Stage } from '@digitalstage/api-types'
import { ReactReduxContext, useDispatch } from 'react-redux'
import { FACTOR } from './RoomElement'
import RoomSelection from './RoomSelection'
import GroupItem from './GroupItem'
import TextSwitch from 'ui/TextSwitch'
import ResetPanel from './ResetPanel'
import { ConnectionContext } from 'api/provider/ConnectionProvider'

const RoomEditor = ({ stageId }: { stageId: string }) => {
    const innerRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()
    const stage = useStageSelector<Stage>((state) => state.stages.byId[stageId])
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[stageId] || [])
    const [selection, setSelection] = useState<RoomSelection[]>([])
    const selectedDeviceId = useStageSelector((state) => state.globals.selectedDeviceId)
    const selectedMode = useStageSelector((state) => state.globals.selectedMode)
    const localUserId = useStageSelector((state) => state.globals.localUserId)
    const isStageAdmin = useMemo<boolean>(
        () => (stage ? stage.admins.some((userId) => userId === localUserId) : false),
        [stage, localUserId]
    )
    const onStageClicked = useCallback((e) => {
        const clickedOnEmpty = e.target === e.target.getStage()
        if (clickedOnEmpty) {
            setSelection([])
        }
    }, [])
    /** Scroll into center of stage **/
    useEffect(() => {
        if (innerRef.current && stage?.width && stage.height) {
            innerRef.current.scrollLeft = (stage.width * FACTOR) / 2 - window.innerWidth / 2
            innerRef.current.scrollTop = (stage.height * FACTOR) / 2 - window.innerHeight / 2
        }
    }, [innerRef, stage?.width, stage?.height])

    if (stage) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.inner} ref={innerRef}>
                    <ReactReduxContext.Consumer>
                        {(store) => (
                            <ConnectionContext.Consumer>
                                {(connectionContext) => (
                                    <KonvaStage
                                        width={stage.width * FACTOR}
                                        height={stage.height * FACTOR}
                                        onClick={onStageClicked}
                                        onTap={onStageClicked}
                                    >
                                        <KonvaLayer>
                                            <ReactReduxContext.Provider value={store}>
                                                <ConnectionContext.Provider
                                                    value={connectionContext}
                                                >
                                                    {groupIds.map((groupId) => (
                                                        <GroupItem
                                                            key={groupId}
                                                            groupId={groupId}
                                                            deviceId={
                                                                selectedMode === 'global'
                                                                    ? undefined
                                                                    : selectedDeviceId
                                                            }
                                                            stageWidth={stage.width}
                                                            stageHeight={stage.height}
                                                            selection={selection}
                                                            onSelected={(selection) =>
                                                                setSelection((prev) => [
                                                                    ...prev,
                                                                    selection,
                                                                ])
                                                            }
                                                        />
                                                    ))}
                                                </ConnectionContext.Provider>
                                            </ReactReduxContext.Provider>
                                        </KonvaLayer>
                                    </KonvaStage>
                                )}
                            </ConnectionContext.Consumer>
                        )}
                    </ReactReduxContext.Consumer>
                </div>

                {isStageAdmin || selectedMode === 'personal' ? (
                    <ResetPanel
                        deviceId={selectedMode === 'global' ? undefined : selectedDeviceId}
                        selection={selection}
                    />
                ) : null}

                {isStageAdmin ? (
                    <TextSwitch
                        className={styles.switch}
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
    return null
}

export default RoomEditor
