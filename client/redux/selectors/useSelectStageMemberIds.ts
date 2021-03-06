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
  selectShowOffline,
  useTrackedSelector
} from "../..";
import React from "react";
import {sortStageMembers} from "./utils";

const useSelectStageMemberIds = (): string[] => {
  const state = useTrackedSelector()
  return state.stageMembers.allIds
}

const useSelectStageMemberIdsByGroup = (groupId: string): string[] => {
  const state = useTrackedSelector()
  const showOffline = selectShowOffline(state)
  return React.useMemo(() => {
    if (state.stageMembers.byGroup[groupId]) {
      if (showOffline) {
        return [...state.stageMembers.byGroup[groupId]]
          .sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
      }
      return state.stageMembers.byGroup[groupId]
        .filter(id => state.stageMembers.byId[id].active)
        .sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
    }
    return []
  }, [groupId, state.stageMembers.byGroup, state.stageMembers.byId, showOffline])
}

export {useSelectStageMemberIds, useSelectStageMemberIdsByGroup}
