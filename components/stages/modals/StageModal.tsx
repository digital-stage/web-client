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

/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Stage } from '@digitalstage/api-types'
import React from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Modal, ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import { NotificationItem } from 'ui/NotificationItem'
import { TextInput } from 'ui/TextInput'
import {Collapse} from 'ui/Collapse'
import { shallowEqual } from 'react-redux'
import { Switch } from 'ui/Switch'
import {Radio} from "../../../ui/Radio";
import {Heading3, Heading5} from 'ui/Heading'

const StageModal = ({
    open,
    onClose,
    stageId,
}: {
    open: boolean
    onClose: () => void
    stageId?: string
}) => {
    const [error, setError] = React.useState<string>()
    const emit = useEmit()
    const stage = useStageSelector<Stage | undefined>(
        (state) => (stageId ? state.stages.byId[stageId] : undefined),
        shallowEqual
    )

    const save = React.useCallback(
        ({ _id, ...values }: Partial<Stage>) => {
            if (emit) {
                return new Promise<void>((resolve, reject) => {
                    if (stage) {
                        // Update stage
                        emit(
                            ClientDeviceEvents.ChangeStage,
                            {
                                _id: stage._id,
                                ...values,
                            } as ClientDevicePayloads.ChangeStage,
                            (eventError: string | null) => {
                                if (eventError) reject(eventError)
                                resolve()
                            }
                        )
                    } else {
                        // Create stage
                        emit(
                            ClientDeviceEvents.CreateStage,
                            values as ClientDevicePayloads.CreateStage,
                            (eventError: string | null) => {
                                if (eventError) reject(eventError)
                                resolve()
                            }
                        )
                    }
                })
            }
            throw new Error('Nicht verbunden')
        },
        [emit, stage]
    )

    return (
        <Modal open={open} onClose={onClose} className="stageModal">
            <ModalHeader>
                <Heading3>{stage ? 'Bühne bearbeiten' : 'Neue Bühne erstellen'}</Heading3>
            </ModalHeader>
            <Formik
                initialValues={
                    {
                        name: (stage && stage.name) || '',
                        audioType: (stage && stage.audioType) || '',
                        render3DAudio: !!stage && stage.render3DAudio,
                        description: (stage && stage.description) || '',
                        password: (stage && stage.password) || undefined,
                        width: (stage && stage.width) || 25,
                        height: (stage && stage.height) || 20,
                        length: (stage && stage.length) || 20,
                        renderReverb: !!stage && stage.renderReverb,
                        absorption: (stage && stage.absorption) || 0.7,
                        reflection: (stage && stage.reflection) || 0.7,
                        videoType: 'mediasoup',
                    } as Partial<Stage>
                }
                validationSchema={Yup.object().shape({
                    name: Yup.string()
                        .min(3, 'zu kurz')
                        .max(100, 'zu lang')
                        .required('Eine Bühne braucht einen Namen'),
                    description: Yup.string().max(255, 'zu lang'),
                    password: Yup.string().min(2, 'zu kurz'),
                    audioType: Yup.string().required('Bitte wähle eine Übertragungsart aus'),
                    render3DAudio: Yup.boolean(),
                    width: Yup.number().min(1).max(100),
                    length: Yup.number().min(1).max(100),
                    height: Yup.number().min(1).max(100),
                    renderReverb: Yup.boolean(),
                    absorption: Yup.number().min(0).max(1),
                    reflection: Yup.number().min(0).max(1),
                })}
                onSubmit={(values) => {
                    save(values)
                        .then(() => onClose())
                        .catch((err) => setError(err))
                }}
            >
                {({ isSubmitting, errors, values, touched, handleReset, handleSubmit }) => (
                    <Form onReset={handleReset} onSubmit={handleSubmit}>
                        <Field
                            as={TextInput}
                            id="name"
                            label="Name der Bühne"
                            placeholder="Name der Bühne"
                            type="text"
                            name="name"
                            error={touched.name && errors.name}
                            light
                        />
                        <Heading5 className="muted">Audioübertragung</Heading5>
                        <div>
                            <label className="radioLabel">
                                <Field as={Radio} type="radio" name="audioType" value="mediasoup" /> Browser
                            </label>
                            <label className="radioLabel">
                                <Field as={Radio} type="radio" name="audioType" value="jammer" /> Jammer
                            </label>
                            <label className="radioLabel">
                                <Field as={Radio} type="radio" name="audioType" value="ov" /> OV
                            </label>
                        </div>
                        {errors.audioType && touched.audioType && (
                            <NotificationItem kind="error">{errors.audioType}</NotificationItem>
                        )}
                        {values.audioType && (
                            <div className="stageModalAudioTypeDescription">
                                <p>
                                    {values.audioType === 'mediasoup' && 'Web only'}
                                    {values.audioType === 'jammer' &&
                                        'Gut für Chöre, alle Betriebssysteme unterstützt'}
                                    {values.audioType === 'ov' &&
                                        'Gut für Musiker, läuft nur unter MacOS oder unter Verwendung der ovbox'}
                                </p>
                            </div>
                        )}
                        <Field
                            as={TextInput}
                            id="password"
                            label="Passwort"
                            placeholder="Kann auch leer bleiben"
                            type="text"
                            name="password"
                            error={touched.password && errors.password}
                            light
                        />
                        <Field
                            as={TextInput}
                            id="description"
                            label="Beschreibung"
                            placeholder="Kurze Beschreibung"
                            type="text"
                            name="description"
                            error={touched.description && errors.description}
                            light
                        />
                        <Collapse title="Erweiterte Einstellungen">
                            <Field
                                as={TextInput}
                                label="Breite"
                                type="number"
                                name="width"
                                error={touched.width && errors.width}
                                min={1}
                                max={100}
                                light
                            />
                            <Field
                                as={TextInput}
                                label="Länge"
                                type="number"
                                name="length"
                                error={touched.length && errors.length}
                                min={1}
                                max={100}
                                light
                            />
                            <Field
                                as={TextInput}
                                label="Höhe"
                                type="number"
                                name="height"
                                error={touched.height && errors.height}
                                min={1}
                                max={100}
                                light
                            />
                            <label className="stageModalCheckboxLabel">
                                Verwende 3D Audio
                                <Field
                                    as={Switch}
                                    id="render3DAudio"
                                    name="render3DAudio"
                                    type="checkbox"
                                    checked={values.render3DAudio}
                                    error={touched.render3DAudio && errors.render3DAudio}
                                    round
                                />
                            </label>
                            <label className="stageModalCheckboxLabel">
                                Emuliere Raum-Hall
                                <Field
                                    as={Switch}
                                    id="renderReverb"
                                    name="renderReverb"
                                    type="checkbox"
                                    checked={values.renderReverb}
                                    error={touched.renderReverb && errors.renderReverb}
                                    round
                                />
                            </label>
                            <Field
                                as={TextInput}
                                label="Absorptionsgrad der Wände"
                                type="number"
                                name="absorption"
                                error={touched.absorption && errors.absorption}
                                step={0.1}
                                min={0}
                                max={1}
                                light
                            />
                            <Field
                                as={TextInput}
                                label="Reflektionsgrad der Wände"
                                type="number"
                                name="reflection"
                                error={touched.reflection && errors.reflection}
                                step={0.1}
                                min={0}
                                max={1}
                                light
                            />
                        </Collapse>
                        {error && <NotificationItem kind="error">{error}</NotificationItem>}
                        <ModalFooter>
                            <ModalButton onClick={onClose}>Abbrechen</ModalButton>
                            <ModalButton
                                disabled={isSubmitting || !!error}
                                className="danger"
                                type="submit"
                                autoFocus={true}
                            >
                                {stage ? 'Speichern' : 'Neue Bühne erstellen'}
                            </ModalButton>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}
StageModal.defaultProps = {
    stageId: undefined,
}
export { StageModal }
