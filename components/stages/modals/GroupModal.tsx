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

import {selectGroupById, useEmit, useTrackedSelector} from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Group } from '@digitalstage/api-types'
import React, { useCallback } from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { TextInput } from 'ui/TextInput'
import { Modal, ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import {ColorPicker} from 'ui/ColorPicker'
import { NotificationItem } from 'ui/NotificationItem'
import {Heading2, Heading5} from "../../../ui/Heading";

const GroupModal = ({
    open,
    onClose,
    stageId,
    groupId,
}: {
    open: boolean
    onClose: () => void
    stageId: string
    groupId?: string | null
}): JSX.Element => {
    const [error, setError] = React.useState<string>()
    const emit = useEmit()
    const state = useTrackedSelector()
    const group = groupId ? selectGroupById(state, groupId) : undefined

    const save = useCallback(
        (values: Partial<Group>) => {
            if (emit) {
                return new Promise<void>((resolve, reject) => {
                    if (groupId) {
                        // Update stage
                        emit(
                            ClientDeviceEvents.ChangeGroup,
                            {
                                _id: groupId,
                                ...values,
                            } as ClientDevicePayloads.ChangeGroup,
                            (eventError: string | null) => {
                                if (eventError) reject(eventError)
                                resolve()
                            }
                        )
                    } else {
                        // Create stage
                        emit(
                            ClientDeviceEvents.CreateGroup,
                            {
                                stageId,
                                ...values,
                            } as ClientDevicePayloads.CreateGroup,
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
        [emit, groupId, stageId]
    )

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader>
                <Heading2>{group ? 'Gruppe bearbeiten' : 'Neue Gruppe erstellen'}</Heading2>
            </ModalHeader>
            <Formik
                initialValues={{
                    name: group?.name || '',
                    description: group?.description || '',
                    color: group?.color || undefined,
                }}
                validationSchema={Yup.object().shape({
                    name: Yup.string()
                        .min(3, 'zu kurz')
                        .max(50, 'zu lang')
                        .required('Eine Gruppe braucht einen Namen'),
                    description: Yup.string().min(3, 'zu kurz').max(255, 'zu lang'),
                })}
                onSubmit={(values) => {
                    if (save)
                        save(values)
                            .then(() => onClose())
                            .catch((err) => setError(err))
                }}
            >
                {({
                    isValid,
                    isSubmitting,
                    errors,
                    values,
                    touched,
                    setFieldValue,
                    handleReset,
                    handleSubmit,
                }) => (
                    <Form onReset={handleReset} onSubmit={handleSubmit}>
                        <Field
                            as={TextInput}
                            id="name"
                            label="Name"
                            placeholder="Gruppenname"
                            type="text"
                            name="name"
                            error={touched.name && errors.name}
                            light
                            autoFocus
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
                        {values.color && (
                            <div className="vertical">
                                <Heading5>Farbe</Heading5>
                                <ColorPicker
                                    color={values.color}
                                    onChange={(color) => setFieldValue('color', color)}
                                />
                            </div>
                        )}
                        {error && <NotificationItem kind="error">{error}</NotificationItem>}
                        <ModalFooter>
                            <ModalButton onClick={onClose}>Abbrechen</ModalButton>
                            <ModalButton
                              autoFocus
                                disabled={isSubmitting || !!error || !isValid}
                                className="danger"
                                type="submit"
                            >
                                {group ? 'Speichern' : 'Neue Gruppe erstellen'}
                            </ModalButton>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}
GroupModal.defaultProps = {
    stageId: undefined,
    groupId: undefined,
}
export { GroupModal }
