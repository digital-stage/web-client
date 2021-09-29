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

import { useCallback } from 'react'
import { KIND } from '../redux/state/Notifications'
import { useDispatch } from 'react-redux'
import { addNotification } from '../redux/actions/clientActions'
import { v4 as uuidv4 } from 'uuid'

type NotificationContextT = (report: {
    kind?: KIND[keyof KIND]
    message: any
    link?: string
    permanent?: boolean
}) => void

const useNotification = (): NotificationContextT => {
    const dispatch = useDispatch()

    return useCallback(
        ({
            kind = 'info',
            message,
            link,
            permanent,
        }: {
            kind?: KIND[keyof KIND]
            message: any
            link?: string
            permanent?: boolean
        }) => {
            if (typeof message === 'string') {
                dispatch(
                    addNotification({
                        id: uuidv4(),
                        date: new Date().getTime(),
                        kind: kind,
                        link: link,
                        message: message,
                        permanent: permanent,
                        featured: true,
                    })
                )
            } else if ((message as unknown).toString) {
                dispatch(
                    addNotification({
                        id: uuidv4(),
                        date: new Date().getTime(),
                        kind: kind,
                        link: link,
                        message: message.toString(),
                        permanent: permanent,
                        featured: true,
                    })
                )
            }
        },
        [dispatch]
    )
}
export { useNotification }
