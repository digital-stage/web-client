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

import React  from 'react'
import { OverlayMenu } from 'ui/OverlayMenu'
import Link from 'next/link'
import {selectAuthUser, selectLocalUser, selectSignedIn, useTrackedSelector} from "@digitalstage/api-client-react";
import {Heading5} from "../../ui/Heading";

const ProfileMenu = () => {
    const [open, setOpen] = React.useState<boolean>(false)
    const state = useTrackedSelector()
    const signedIn = selectSignedIn(state)
    const authUser = selectAuthUser(state)
    const user = selectLocalUser(state)
    if (signedIn) {
        return (
            <OverlayMenu
                className="profileMenu"
                menu={
                    <>
                        {user ? <Heading5>{user.name}</Heading5> : null}
                        {authUser?.email}
                        <Link href="/account/logout" passHref>
                            <button
                              className="danger"
                              onClick={() => setOpen(false)}
                            >
                                Abmelden
                            </button>
                        </Link>
                    </>
                }
                open={open}
                onClose={() => setOpen(false)}
            >
                <button className="secondary round" onClick={() => setOpen((prev) => !prev)}>
                    <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M332.64 64.58C313.18 43.57 286 32 256 32c-30.16 0-57.43 11.5-76.8 32.38-19.58 21.11-29.12 49.8-26.88 80.78C156.76 206.28 203.27 256 256 256s99.16-49.71 103.67-110.82c2.27-30.7-7.33-59.33-27.03-80.6zM432 480H80a31 31 0 01-24.2-11.13c-6.5-7.77-9.12-18.38-7.18-29.11C57.06 392.94 83.4 353.61 124.8 326c36.78-24.51 83.37-38 131.2-38s94.42 13.5 131.2 38c41.4 27.6 67.74 66.93 76.18 113.75 1.94 10.73-.68 21.34-7.18 29.11A31 31 0 01432 480z" />
                    </svg>
                </button>
            </OverlayMenu>
        )
    }
    return null
}
export { ProfileMenu }
