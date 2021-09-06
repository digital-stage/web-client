import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Group } from '@digitalstage/api-types'
import React, { useCallback, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { TextInput } from 'ui/TextInput'
import { Modal, ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import {ColorPicker} from 'ui/ColorPicker'
import { Notification } from 'ui/Notification'
import { shallowEqual } from 'react-redux'

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
}) => {
    const [error, setError] = useState<string>()
    const emit = useEmit()
    const group = useStageSelector<Group | undefined>(
        (state) => (groupId ? state.groups.byId[groupId] : undefined),
        shallowEqual
    )

    const save = useCallback(
        (values: Partial<Group>) => {
            if (emit) {
                return new Promise<void>((resolve, reject) => {
                    if (group) {
                        // Update stage
                        emit(
                            ClientDeviceEvents.ChangeGroup,
                            {
                                _id: group._id,
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
        [emit, group, stageId]
    )

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader>
                <h2>{group ? 'Gruppe bearbeiten' : 'Neue Gruppe erstellen'}</h2>
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
                                <h5>Farbe</h5>
                                <ColorPicker
                                    color={values.color}
                                    onChange={(color) => setFieldValue('color', color)}
                                />
                            </div>
                        )}
                        {error && <Notification kind="error">{error}</Notification>}
                        <ModalFooter>
                            <ModalButton onClick={onClose}>Abbrechen</ModalButton>
                            <ModalButton
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
