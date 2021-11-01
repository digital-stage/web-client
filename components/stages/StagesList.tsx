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
    selectAllStageIds, selectAudioTypeByStageId, selectGroupIdsByStageId,
    selectIsStageAdmin,
    selectStageById, selectVideoTypeByStageId,
    useTrackedSelector
} from '../../client'
import React from 'react'
import {List, ListItem} from 'ui/List'
import {Tag} from 'ui/Tag'
import {Paragraph} from 'ui/Paragraph'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {MdEdit, MdMoreHoriz} from 'react-icons/md'
import {useStageJoiner} from '../../client/hooks/useStageJoiner'
import {EnterInviteCodeModal} from './modals/EnterInviteCodeModal'
import {StageModal} from './modals/StageModal'

enum Type {
  mediasoup = 'Web',
  jammer = 'Jammer',
  ov = 'OV',
}

const StageItem = ({stageId}: { stageId: string }): JSX.Element => {
  const {push} = useRouter()
  const state = useTrackedSelector()
  const {name, password} = selectStageById(state, stageId)
  const videoType = selectVideoTypeByStageId(state, stageId)
  const audioType = selectAudioTypeByStageId(state, stageId)
  const hasGroups = selectGroupIdsByStageId(state, stageId).length > 0
  const isActive = state.globals.stageId && state.globals.stageId === stageId
  const isStageAdmin = selectIsStageAdmin(state, stageId)
  const {join, leave} = useStageJoiner()
  const onListClicked = React.useCallback(() => {
    if (hasGroups) {
      if (isActive) {
        return leave()
      }
      return join({stageId, password})

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
                            <MdEdit/>
                            <span className="stageItemHideOnMobile">&nbsp;Editieren</span>
                          </>
                        ) : (
                          <>
                            <MdMoreHoriz/>
                            <span className="stageItemHideOnMobile">&nbsp;Details</span>
                          </>
                        )}
                    </button>
                </Link>
            </span>
    </ListItem>
  )
}

const StagesList = (): JSX.Element => {
  const state = useTrackedSelector()
  const [enterCodeRequested, requestEnterCode] = React.useState<boolean>(false)
  const [createStageRequested, requestStageCreation] = React.useState<boolean>(false)
  const stageIds = selectAllStageIds(state)

  return (
    <List className="stagesList">
      {stageIds.map((stageId) => (
        <StageItem key={stageId} stageId={stageId}/>
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
      <StageModal open={createStageRequested} onClose={() => requestStageCreation(false)}/>
    </List>
  )
}
export {StagesList}
