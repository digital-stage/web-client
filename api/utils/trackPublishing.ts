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

import {SocketEvent} from "teckos-client/dist/types";
import {
  AudioTrack,
  ClientDeviceEvents,
  ClientDevicePayloads,
  VideoTrack
} from "@digitalstage/api-types";

const publishTrack = (
  emit: (event: SocketEvent, ...args: unknown[]) => boolean,
  stageId: string,
  kind: 'video' | 'audio',
  additionalPayload?: Partial<Omit<VideoTrack, "_id" | "userId" | "deviceId" | "stageMemberId" | "stageDeviceId">>
) =>
  new Promise<VideoTrack | AudioTrack>((resolve, reject) => {
    let payload: ClientDevicePayloads.CreateVideoTrack & ClientDevicePayloads.CreateAudioTrack =
      {
        type: 'mediasoup',
        stageId
      }
    if (kind === 'audio') {
      payload = {
        ...payload,
        y: -1,
        rZ: 0,
      }
    }
    payload = {
      ...payload,
      ...additionalPayload
    }
    emit(
      kind === 'video'
        ? ClientDeviceEvents.CreateVideoTrack
        : ClientDeviceEvents.CreateAudioTrack,
      payload,
      (error: string | null, track?: VideoTrack | AudioTrack) => {
        if (error) {
          return reject(error)
        }
        if (!track) {
          return reject(new Error('No video track provided by server'))
        }
        if (kind === 'audio') {
          return resolve(track as AudioTrack)
        }
        return resolve(track as VideoTrack)
      }
    )
  })

const unpublishTrack = (
  emit: (event: SocketEvent, ...args: unknown[]) => boolean,
  publishedId: string,
  kind: 'video' | 'audio'
) =>
  new Promise<void>((resolve, reject) => {
    if (kind === 'video') {
      emit(ClientDeviceEvents.RemoveVideoTrack, publishedId, (error: string | null) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      })
    } else {
      emit(ClientDeviceEvents.RemoveAudioTrack, publishedId, (error: string | null) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      })
    }
  })

export {publishTrack, unpublishTrack}