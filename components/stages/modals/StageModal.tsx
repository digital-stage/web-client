/* eslint-disable jsx-a11y/label-has-associated-control */
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Stage } from '@digitalstage/api-types'
import React, { useCallback, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import Modal, { ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import Notification from '../../../ui/Notification'
import TextInput from '../../../ui/TextInput'
import Collapse from 'ui/Collapse'
import styles from './StageModal.module.scss'

const StageModal = ({
    open,
    onClose,
    stageId,
}: {
    open: boolean
    onClose: () => void
    stageId?: string
}) => {
    const [error, setError] = useState<string>()
    const { emit } = useConnection()
    const stage = useStageSelector<Stage | undefined>((state) =>
        stageId ? state.stages.byId[stageId] : undefined
    )

    const save = useCallback(
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
        <Modal open={open} onClose={onClose}>
            <ModalHeader>
                <h3>{stage ? 'Bühne bearbeiten' : 'Neue Bühne erstellen'}</h3>
            </ModalHeader>
            <Formik
                initialValues={
                    {
                        name: (stage && stage.name) || '',
                        audioType: (stage && stage.audioType) || '',
                        description: (stage && stage.description) || '',
                        password: (stage && stage.password) || undefined,
                        width: (stage && stage.width) || 25,
                        height: (stage && stage.height) || 20,
                        length: (stage && stage.length) || 20,
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
                    width: Yup.number().min(1).max(100),
                    length: Yup.number().min(1).max(100),
                    height: Yup.number().min(1).max(100),
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
                        <h5 className="muted">Audioübertragung</h5>
                        <div>
                            <label>
                                <Field type="radio" name="audioType" value="mediasoup" /> Browser
                            </label>
                            <label>
                                <Field type="radio" name="audioType" value="jammer" /> Jammer
                            </label>
                            <label>
                                <Field type="radio" name="audioType" value="ov" /> OV
                            </label>
                        </div>
                        {errors.audioType && touched.audioType && (
                            <Notification kind="error">{errors.audioType}</Notification>
                        )}
                        {values.audioType && (
                            <div className={styles.audioTypeDescription}>
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
                        {error && <Notification kind="error">{error}</Notification>}
                        <ModalFooter>
                            <ModalButton onClick={onClose}>Abbrechen</ModalButton>
                            <ModalButton
                                disabled={isSubmitting || !!error}
                                className="danger"
                                type="submit"
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
export default StageModal
