/* eslint-disable jsx-a11y/label-has-associated-control */
import { Stage, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import React, { useCallback, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import Image from 'next/image'
import Modal, { ModalButton, ModalFooter, ModalHeader } from '../ui/Modal'
import Input from '../ui/Input'
import Notification from '../ui/Notification'
import Block from '../ui/Block'
import Paragraph from '../ui/Paragraph'
import Collapse from '../ui/Collapse'
import Radio, { RadioPanel } from '../ui/Radio'

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
    const connection = useConnection()
    const stage = useStageSelector<Stage | undefined>(
        (state) => stageId && state.stages.byId[stageId]
    )

    const save = useCallback(
        ({ _id, ...values }: Partial<Stage>) => {
            if (connection) {
                return new Promise<void>((resolve, reject) => {
                    if (stage) {
                        console.log('Updating stage')
                        // Update stage
                        connection.emit(
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
                        console.log('Creating stage')
                        // Create stage
                        connection.emit(
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
            return undefined
        },
        [connection, stage]
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
                    console.log('TRIGGER')
                    save(values)
                        .then(() => onClose())
                        .catch((err) => setError(err))
                }}
            >
                {({ errors, values, touched, handleReset, handleSubmit }) => (
                    <Form onReset={handleReset} onSubmit={handleSubmit}>
                        <Field
                            as={Input}
                            id="name"
                            label="Name der Bühne"
                            placeholder="Name der Bühne"
                            type="text"
                            name="name"
                            error={touched.name && errors.name}
                        />
                        <Block vertical>
                            <h5 className="muted">Audioübertragung</h5>
                        </Block>
                        <Block vertical align="center">
                            <Block padding={4}>
                                <RadioPanel>
                                    <Field
                                        as={Radio}
                                        type="radio"
                                        name="audioType"
                                        value="mediasoup"
                                        label={
                                            <>
                                                <Image
                                                    width={48}
                                                    height={48}
                                                    src="/static/mediasoup.png"
                                                />
                                                <Paragraph kind="micro">Mediasoup</Paragraph>
                                                <h6 style={{ textAlign: 'center' }}>BROWSER</h6>
                                            </>
                                        }
                                    />
                                    <Field
                                        as={Radio}
                                        type="radio"
                                        name="audioType"
                                        value="jammer"
                                        label={
                                            <>
                                                <Paragraph kind="micro">Jammernetz</Paragraph>
                                                <h6 style={{ textAlign: 'center' }}>
                                                    Windows, macOS &amp; Linux
                                                </h6>
                                            </>
                                        }
                                    />
                                    <Field
                                        as={Radio}
                                        type="radio"
                                        name="audioType"
                                        value="ov"
                                        label={
                                            <>
                                                <Image
                                                    width={48}
                                                    height={48}
                                                    src="/static/ov.png"
                                                />
                                                <Paragraph kind="micro">Orlandoviols</Paragraph>
                                                <h5 style={{ textAlign: 'center' }}>
                                                    macOS, Linux &amp; BOX
                                                </h5>
                                            </>
                                        }
                                    />
                                </RadioPanel>
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
                            error={touched.password && errors.password}
                        />
                        <Field
                            as={Input}
                            id="description"
                            label="Beschreibung"
                            placeholder="Kurze Beschreibung"
                            type="text"
                            name="description"
                            error={touched.description && errors.description}
                        />
                        <Collapse title="Erweiterte Einstellungen">
                            <Field
                                as={Input}
                                label="Breite"
                                type="number"
                                name="width"
                                error={touched.width && errors.width}
                                min={1}
                                max={100}
                            />
                            <Field
                                as={Input}
                                label="Länge"
                                type="number"
                                name="length"
                                error={touched.length && errors.length}
                                min={1}
                                max={100}
                            />
                            <Field
                                as={Input}
                                label="Höhe"
                                type="number"
                                name="height"
                                error={touched.height && errors.height}
                                min={1}
                                max={100}
                            />
                            <Field
                                as={Input}
                                label="Absorptionsgrad der Wände"
                                type="number"
                                name="absorption"
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
                                error={touched.reflection && errors.reflection}
                                step={0.1}
                                min={0}
                                max={1}
                            />
                        </Collapse>
                        {error && <Notification type="error">{error}</Notification>}
                        <ModalFooter>
                            <ModalButton kind="tertiary" onClick={onClose}>
                                Abbrechen
                            </ModalButton>
                            <ModalButton kind="danger" type="submit">
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
