import * as Yup from 'yup'
import { Field, Form, Formik, FormikProps } from 'formik'
import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { ClientDeviceEvents, Stage, useConnection } from '@digitalstage/api-client-react'
import Modal from '../../../ui/surface/Modal'
import Input from '../../../ui/form/Input'
import SecondaryButton from '../../../ui/button/SecondaryButton'
import PrimaryButton from '../../../ui/button/PrimaryButton'

const ModifyStageModal = (props: { open: boolean; onClose: () => void; stage?: Stage }) => {
    const { open, onClose, stage } = props
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })
    const connection = useConnection()
    const handleSubmit = useCallback(
        (values, actions) => {
            if (connection) {
                if (stage) {
                    const payload: Partial<Stage> = {
                        _id: stage._id,
                        name: values.name,
                        videoType: 'mediasoup',
                        audioType: values.audioType,
                        description: values.description,
                        password: values.password,
                        width: values.width,
                        length: values.length,
                        height: values.height,
                        absorption: values.absorption,
                        reflection: values.reflection,
                    }
                    connection.emit(ClientDeviceEvents.ChangeStage, payload)
                } else {
                    const payload: Omit<Stage, '_id'> = {
                        name: values.name,
                        videoType: 'mediasoup',
                        audioType: values.audioType,
                        description: values.description,
                        password: values.password,
                        width: values.width,
                        length: values.length,
                        height: values.height,
                        absorption: values.absorption,
                        reflection: values.reflection,
                    }
                    connection.emit(ClientDeviceEvents.CreateStage, payload)
                }
                onClose()
            }
        },
        [connection, stage, onClose]
    )
    return (
        <Modal onClose={onClose} open={open}>
            <Formik
                initialValues={{
                    name: (stage && stage.name) || '',
                    audioType: (stage && stage.audioType) || '',
                    description: (stage && stage.description) || '',
                    password: (stage && stage.password) || '',
                    width: (stage && stage.width) || 25,
                    height: (stage && stage.height) || 20,
                    length: (stage && stage.length) || 20,
                    absorption: (stage && stage.absorption) || 0.7,
                    reflection: (stage && stage.reflection) || 0.7,
                }}
                onSubmit={handleSubmit}
                validationSchema={Yup.object().shape({
                    name: Yup.string()
                        .min(4, f('nameTooShort'))
                        .max(255, f('nameTooLong'))
                        .required(f('nameRequired')),
                    audioType: Yup.string().required(f('audioTypeRequired')),
                    description: Yup.string(),
                    password: Yup.string().min(2, f('passwordTooShort')),
                    width: Yup.number().min(1),
                    height: Yup.number().min(1),
                    length: Yup.number().min(1),
                    absorption: Yup.number().min(0).max(1),
                    reflection: Yup.number().min(0).max(1),
                })}
            >
                {(props: FormikProps<any>) => (
                    <>
                        <h3>{stage ? f('modifyStage') : f('createStage')}</h3>
                        <div>
                            <p>
                                {stage ? f('modifyStageDescription') : f('createStageDescription')}
                            </p>
                            <Form className="form" autoComplete="on">
                                <Field
                                    as={Input}
                                    label={f('stageName')}
                                    placeholder={f('stageName')}
                                    type="name"
                                    name="name"
                                    valid={!!props.errors.name}
                                    notification={props.errors.name}
                                    autoComplete={false}
                                    error={props.touched.name && props.errors.name}
                                    maxLength={100}
                                />
                                <label>
                                    <Field type="radio" name="audioType" value="mediasoup" />
                                    {f('audioTypeMediasoup')}
                                </label>
                                <label>
                                    <Field type="radio" name="audioType" value="jammer" />
                                    {f('audioTypeJammer')}
                                </label>
                                <label>
                                    <Field type="radio" name="audioType" value="ov" />
                                    {f('audioTypeOv')}
                                </label>
                                {props.values.audioType && (
                                    <p>{f(`audioType${props.values.audioType}Description`)}</p>
                                )}
                                <Field
                                    as={Input}
                                    label={f('description')}
                                    placeholder={f('description')}
                                    type="description"
                                    name="description"
                                    valid={!!props.errors.description}
                                    error={props.touched.description && props.errors.description}
                                    autoComplete="off"
                                    notification={
                                        props.errors.description || f('descriptionCaption')
                                    }
                                    maxLength={100}
                                />
                                <Field
                                    as={Input}
                                    label={f('password')}
                                    placeholder={f('password')}
                                    type="password"
                                    name="password"
                                    valid={!!props.errors.password}
                                    autoComplete="new-password"
                                    notification={f('passwordCaption')}
                                    error={props.errors.password || f('passwordCaption')}
                                    maxLength={20}
                                />
                                <Field
                                    as={Input}
                                    label={f('width')}
                                    placeholder={f('width')}
                                    type="number"
                                    name="width"
                                    valid={!!props.errors.width}
                                    error={props.touched.width && props.errors.width}
                                    min={1}
                                />
                                <Field
                                    as={Input}
                                    label={f('length')}
                                    placeholder={f('length')}
                                    type="number"
                                    name="length"
                                    valid={!!props.errors.length}
                                    error={props.touched.length && props.errors.length}
                                    min={1}
                                />
                                <Field
                                    as={Input}
                                    label={f('height')}
                                    placeholder={f('height')}
                                    type="number"
                                    name="height"
                                    valid={!!props.errors.height}
                                    error={props.touched.height && props.errors.height}
                                    min={1}
                                />
                                <Field
                                    as={Input}
                                    label={f('absorption')}
                                    placeholder={f('absorption')}
                                    type="number"
                                    name="absorption"
                                    valid={!!props.errors.absorption}
                                    error={props.touched.absorption && props.errors.absorption}
                                    step={0.1}
                                    min={0}
                                    max={1}
                                />
                                <Field
                                    as={Input}
                                    label={f('reflection')}
                                    placeholder={f('reflection')}
                                    type="number"
                                    name="reflection"
                                    valid={!!props.errors.reflection}
                                    error={props.touched.reflection && props.errors.reflection}
                                    step={0.1}
                                    min={0}
                                    max={1}
                                />
                            </Form>
                        </div>
                        <div>
                            <SecondaryButton onClick={onClose}>{f('cancel')}</SecondaryButton>
                            <PrimaryButton
                                type="submit"
                                disabled={!props.isValid}
                                onClick={props.submitForm}
                            >
                                {stage ? f('update') : f('create')}
                            </PrimaryButton>
                        </div>
                    </>
                )}
            </Formik>
            <style jsx>{`
                .form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
            `}</style>
        </Modal>
    )
}
export default ModifyStageModal
