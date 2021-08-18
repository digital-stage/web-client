import styles from './StageView.module.scss'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import Backdrop from '../../ui/Backdrop'
import React from 'react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import useOpenState from '../../ui/useOpenState'
import Panel from '../../ui/Panel'

const ConductorView = () => {
    const directors = useStageSelector((state) =>
        state.stageMembers.allIds.filter((id) => state.stageMembers.byId[id].isDirector)
    )
    const isAdmin = useStageSelector<boolean>((state) =>
        state.globals.stageId && state.globals.stageMemberId
            ? state.stages.byId[state.globals.stageId].admins.some(
                  (id) => id === state.globals.localStageDeviceId
              )
            : false
    )
    const { emit } = useConnection()
    const openState = useOpenState(directors.length > 0)

    return (
        <div className={styles.conductorView}>
            {openState !== 'closed' ? <Backdrop open={openState} /> : null}
            <Panel>
                CONDUCTOR
                {isAdmin ? (
                    <button
                        className="round small"
                        onClick={() =>
                            emit(ClientDeviceEvents.ChangeStageMember, {
                                _id: directors[0],
                                isDirector: false,
                            } as ClientDevicePayloads.ChangeStageMember)
                        }
                    >
                        PLUS
                    </button>
                ) : null}
            </Panel>
        </div>
    )
}
export default ConductorView
