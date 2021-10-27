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

import {NotificationItem} from 'ui/NotificationItem'
import {changeNotification, RootState, useTrackedSelector} from '@digitalstage/api-client-react'
import {useDispatch} from 'react-redux'

const selectFeaturedNotifications = (state: RootState) => state.notifications.allIds
  .map((id) => state.notifications.byId[id])
  .filter((notification) => notification.featured || notification.permanent)

const NotificationBar = (): JSX.Element => {
  const dispatch = useDispatch()
  const state = useTrackedSelector()
  const featuredNotifications = selectFeaturedNotifications(state)
  return (
    <>
      {featuredNotifications.map((notification) => (
        <NotificationItem
          closeable={!notification.permanent}
          onClose={() =>
            dispatch(
              changeNotification({
                id: notification.id,
                featured: false,
              })
            )
          }
          key={notification.id}
          kind={notification.kind}
        >
          {notification.message}
        </NotificationItem>
      ))}
    </>
  )
}
export {NotificationBar}
