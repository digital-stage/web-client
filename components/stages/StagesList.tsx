import { useStageAdminSelector, useStageSelector } from '@digitalstage/api-client-react'
import React, { useState } from 'react'
import { List, ListItem  } from 'ui/List'
import {StageModal} from './modals/StageModal'
import { Tag } from 'ui/Tag'
import { Paragraph } from 'ui/Paragraph'
import {EnterInviteCodeModal} from './modals/EnterInviteCodeModal'
import { useStageJoiner } from '../../api/hooks/useStageJoiner'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MdEdit, MdMoreHoriz } from 'react-icons/md'

const Type = {
    mediasoup: 'Web',
    jammer: 'Jammer',
    ov: 'OV',
}

const StageItem = ({ stageId }: { stageId: string }) => {
    const { push } = useRouter()
    const name = useStageSelector((state) => state.stages.byId[stageId].name)
    const password = useStageSelector((state) => state.stages.byId[stageId].password)
    const videoType = useStageSelector((state) => state.stages.byId[stageId].videoType)
    const audioType = useStageSelector((state) => state.stages.byId[stageId].audioType)
    const hasGroups = useStageSelector((state) => state.groups.byStage[stageId]?.length > 0)
    const isActive = useStageSelector(
        (state) => state.globals.stageId && state.globals.stageId === stageId
    )
    const isStageAdmin = useStageAdminSelector(stageId)
    const { join, leave } = useStageJoiner()
    const onListClicked = React.useCallback(() => {
        if (hasGroups) {
            if (isActive) {
                return leave()
            } else {
                return join({ stageId, password: password })
            }
        }
        push(`/stages/${stageId}`)
    }, [hasGroups, isActive, join, leave, password, push, stageId])
    return (
        <ListItem className={isActive ? 'stageItemActive' : ''} onSelect={onListClicked}>
            <a className="stageItemName">
                {name}
                <Tag kind="success">{Type[videoType]}</Tag>
                <Tag kind="warn">{Type[audioType]}</Tag>
            </a>
            <span onClick={(e) => e.stopPropagation()}>
                <Link href={`/stages/${stageId}`} passHref>
                    <button className="small">
                        {isStageAdmin ? (
                            <>
                                <MdEdit />
                                <span className="stageItemHideOnMobile">&nbsp;Editieren</span>
                            </>
                        ) : (
                            <>
                                <MdMoreHoriz />
                                <span className="stageItemHideOnMobile">&nbsp;Details</span>
                            </>
                        )}
                    </button>
                </Link>
            </span>
        </ListItem>
    )
}

const StagesList = () => {
    const [enterCodeRequested, requestEnterCode] = React.useState<boolean>(false)
    const [createStageRequested, requestStageCreation] = React.useState<boolean>(false)
    const stageIds = useStageSelector((state) => state.stages.allIds)

    return (
        <List className="stagesList">
            {stageIds.map((stageId) => (
                <StageItem key={stageId} stageId={stageId} />
            ))}
            <Paragraph kind="micro" className="stagesListLabel">
                Legende:
                <Tag kind="success">Videoübertragung</Tag>
                <Tag kind="warn">Audioübertragung</Tag>
            </Paragraph>
            <div className="stagesListActions">
                <button className="tertiary" onClick={() => requestStageCreation(true)}>
                    Neue Bühne erstellen
                </button>
                <button className="tertiary" onClick={() => requestEnterCode(true)}>
                    Einladungscode eingeben
                </button>
            </div>
            <EnterInviteCodeModal
                open={enterCodeRequested}
                onClose={() => requestEnterCode(false)}
            />
            <StageModal open={createStageRequested} onClose={() => requestStageCreation(false)} />
        </List>
    )
}
export { StagesList }
