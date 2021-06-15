import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Group } from '@digitalstage/api-types'
import React, { useCallback, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import Modal, { ModalButton, ModalFooter, ModalHeader } from '../../ui/Modal'
import Input from '../../ui/Input'
import Notification from '../../ui/Notification'
import ColorPicker from '../../ui/ColorPicker'
import Block from '../ui/Block'

const GroupModal = ({
    open,
    onClose,
    stageId,
    groupId,
}: {
    open: boolean
    onClose: () => void
    stageId?: string
    groupId?: string
}) => {
    const [error, setError] = useState<string>()
    const connection = useConnection()
    const group = useStageSelector<Group | undefined>(
        (state) => groupId && state.groups.byId[groupId]
    )

    const save = useCallback(
        (values: Partial<Group>) => {
            if (connection) {
                return new Promise<void>((resolve, reject) => {
                    if (group) {
                        // Update stage
                        connection.emit(
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
                        connection.emit(
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
            return undefined
        },
        [connection, group, stageId]
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
                    save(values)
                        .then(() => onClose())
                        .catch((err) => setError(err))
                }}
            >
                {({ errors, values, touched, setFieldValue, handleReset, handleSubmit }) => (
                    <Form onReset={handleReset} onSubmit={handleSubmit}>
                        <Field
                            as={Input}
                            id="name"
                            label="Name"
                            placeholder="Gruppenname"
                            type="text"
                            name="name"
                            error={touched.name && errors.name}
                            light
                        />
                        <Field
                            as={Input}
                            id="description"
                            label="Beschreibung"
                            placeholder="Kurze Beschreibung"
                            type="text"
                            name="description"
                            error={touched.description && errors.description}
                            light
                        />
                        {values.color && (
                            <Block vertical>
                                <h5>Farbe</h5>
                                <ColorPicker
                                    color={values.color}
                                    onChange={(color) => setFieldValue('color', color)}
                                />
                            </Block>
                        )}
                        {error && <Notification type="error">{error}</Notification>}
                        <ModalFooter>
                            <ModalButton kind="tertiary" onClick={onClose}>
                                Abbrechen
                            </ModalButton>
                            <ModalButton kind="danger" type="submit">
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
export default GroupModal
