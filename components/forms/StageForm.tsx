/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Stage, useConnection } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import Input from '../ui/Input'
import Block from '../ui/Block'
import Notification from '../ui/Notification'
import Paragraph from '../ui/Paragraph'
import Collapse from '../ui/Collapse'
import { ModalButton, ModalFooter } from '../ui/Modal'

type Values = Omit<Stage, '_id' | 'admins' | 'soundEditors' | 'videoRouter' | 'audioRouter'>

const StageForm = ({
    stage,
    onSave,
    onAbort,
}: {
    stage?: Stage
    onSave: () => void
    onAbort: () => void
}): JSX.Element => {
    const [error, setError] = useState<string>()
    const connection = useConnection()
    const handleSave = useCallback(
        (values: Values) => {
            if (connection) {
                return new Promise<void>((resolve, reject) => {
                    if (stage) {
                        // Update stage
                        connection.emit(
                            ClientDeviceEvents.ChangeStage,
                            {
                                _id: stage._id,
                            } as ClientDevicePayloads.ChangeStage,
                            (eventError: string | null) => {
                                if (eventError) reject(eventError)
                                resolve()
                            }
                        )
                    } else {
                        // Create stage
                        connection.emit(
                            ClientDeviceEvents.CreateStage,
                            {
                                name: values.name,
                            } as ClientDevicePayloads.CreateStage,
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
        [connection, stage]
    )
    return (
        <>
            <Formik
                initialValues={
                    {
                        name: (stage && stage.name) || '',
                        audioType: (stage && stage.audioType) || '',
                        description: (stage && stage.description) || '',
                        password: (stage && stage.password) || '',
                        width: (stage && stage.width) || 25,
                        height: (stage && stage.height) || 20,
                        length: (stage && stage.length) || 20,
                        absorption: (stage && stage.absorption) || 0.7,
                        reflection: (stage && stage.reflection) || 0.7,
                        videoType: 'mediasoup',
                        preferredPosition: {
                            lat: 50.110924,
                            lng: 8.682127,
                        },
                    } as Values
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
                    // eslint-disable-next-line react/forbid-prop-types
                    preferredPosition: Yup.object({
                        lat: Yup.number().min(-90).max(90),
                        lng: Yup.number().min(-180).max(-180),
                    }),
                })}
                onSubmit={(values: Values) =>
                    handleSave(values)
                        .then(() => onSave())
                        .catch((err) => setError(err))
                }
            >
                {({ errors, values, touched, handleSubmit, handleReset }) => (
                    <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="off">
                        <Field
                            as={Input}
                            id="name"
                            label="Name der Bühne"
                            placeholder="Name der Bühne"
                            type="text"
                            name="name"
                            error={errors.name && touched.name}
                        />
                        <Block vertical align="center">
                            <Block padding={4}>
                                <label>
                                    <Field type="radio" name="audioType" value="mediasoup" />
                                    Mediasoup
                                </label>
                                <label>
                                    <Field type="radio" name="audioType" value="jammer" />
                                    Jammer
                                </label>
                                <label>
                                    <Field type="radio" name="audioType" value="ov" />
                                    OV
                                </label>
                            </Block>
                            {errors.audioType && touched.audioType && (
                                <Notification type="error">{errors.audioType}</Notification>
                            )}
                            {values.audioType && (
                                <Block paddingBottom={4}>
                                    <Paragraph>
                                        {values.audioType === 'mediasoup' && 'Web only'}
                                        {values.audioType === 'jammer' &&
                                            'Gut für Chöre, alle Betriebssysteme unterstützt'}
                                        {values.audioType === 'ov' &&
                                            'Gut für Musiker, läuft nur unter MacOS oder unter Verwendung der ovbox'}
                                    </Paragraph>
                                </Block>
                            )}
                        </Block>
                        <Field
                            as={Input}
                            id="password"
                            label="Passwort"
                            placeholder="Kann auch leer bleiben"
                            type="text"
                            name="password"
                            error={errors.password && touched.password}
                        />
                        <Field
                            as={Input}
                            id="description"
                            label="Beschreibung"
                            placeholder="Kurze Beschreibung"
                            type="text"
                            name="description"
                            error={errors.description && touched.description}
                        />
                        <Collapse title="Erweiterte Einstellungen">
                            <Field
                                as={Input}
                                label="Breite"
                                type="number"
                                name="width"
                                valid={!!errors.width}
                                error={touched.width && errors.width}
                                min={1}
                                max={100}
                            />
                            <Field
                                as={Input}
                                label="Länge"
                                type="number"
                                name="length"
                                valid={!!errors.length}
                                error={touched.length && errors.length}
                                min={1}
                                max={100}
                            />
                            <Field
                                as={Input}
                                label="Höhe"
                                type="number"
                                name="height"
                                valid={!!errors.height}
                                error={touched.height && errors.height}
                                min={1}
                                max={100}
                            />
                            <Field
                                as={Input}
                                label="Absorptionsgrad der Wände"
                                type="number"
                                name="absorption"
                                valid={!!errors.absorption}
                                error={touched.absorption && errors.absorption}
                                step={0.1}
                                min={0}
                                max={1}
                            />
                            <Field
                                as={Input}
                                label="Reflektionsgrad der Wände"
                                type="number"
                                name="reflection"
                                valid={!!errors.reflection}
                                error={touched.reflection && errors.reflection}
                                step={0.1}
                                min={0}
                                max={1}
                            />
                        </Collapse>
                        {error && <Notification type="error">{error}</Notification>}
                        <ModalFooter>
                            <ModalButton kind="tertiary" onClick={onAbort}>
                                Abbrechen
                            </ModalButton>
                            <ModalButton kind="danger" type="submit">
                                {stage ? 'Speichern' : 'Bühne erstellen'}
                            </ModalButton>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </>
    )
}
StageForm.defaultProps = {
    stage: undefined,
}
export default StageForm
