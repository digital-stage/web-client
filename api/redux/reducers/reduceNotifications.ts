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

import { InternalActionTypes } from '../actions/InternalActionTypes'
import { Notifications } from '../state/Notifications'
import {
    AddNotificationPayload,
    ChangeNotificationPayload,
    RemoveNotificationPayload,
} from '../actions/clientActions'
import omit from 'lodash/omit'
import without from 'lodash/without'
import {ReducerAction} from "../actions/ReducerAction";

function reduceNotifications(
    state: Notifications = {
        byId: {},
        allIds: [],
    },
    action: ReducerAction
): Notifications {
    switch (action.type) {
        case InternalActionTypes.ADD_NOTIFICATION:
            const notification = action.payload as AddNotificationPayload
            return {
                byId: {
                    ...state.byId,
                    [notification.id]: notification,
                },
                allIds: [...state.allIds, notification.id],
            }
        case InternalActionTypes.CHANGE_NOTIFICATION: {
            const update = action.payload as ChangeNotificationPayload
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [update.id]: {
                        ...state.byId[update.id],
                        ...update,
                    },
                },
            }
        }
        case InternalActionTypes.REMOVE_NOTIFICATION: {
            const id = action.payload as RemoveNotificationPayload
            return {
                byId: omit(state.byId, id),
                allIds: without<string>(state.allIds, id),
            }
        }
        default:
            return state
    }
}

export { reduceNotifications }
