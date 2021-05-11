import React, { useCallback, useEffect, useState } from 'react'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import { useAuth } from '@digitalstage/api-client-react'
import PrimaryButton from '../../../ui/button/PrimaryButton'
import Input from '../../../ui/form/Input'
import Notification from '../../../ui/surface/Notification'
import styles from '../../../styles/Account.module.css'

export interface Values {
    code: string
}

const ActivationForm = (props: { initialCode?: string }): JSX.Element => {
    const { initialCode } = props
    const { push } = useRouter()
    const [message, setMessage] = useState<{
        type: 'danger' | 'warning' | 'info' | 'success'
        content: string
    }>()
    const { loading, user, activate } = useAuth()
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })

    const handleActivation = useCallback(
        (code: string) => {
            setMessage(undefined)
            return activate(code)
                .then(() => {
                    setMessage({
                        type: 'success',
                        content: f('accountActivated'),
                    })
                    setTimeout(() => {
                        push('/')
                    }, 1000)
                })
                .catch((error) => {
                    setMessage({
                        type: 'danger',
                        content: error,
                    })
                })
        },
        [activate, push]
    )

    useEffect(() => {
        if (initialCode) handleActivation(initialCode)
    }, [initialCode, handleActivation])

    useEffect(() => {
        if (!loading && user) {
            push('/')
        }
    }, [loading, user, push])

    const notification = message ? <Notification>{message.content}</Notification> : null

    return (
        <>
            {notification}
            <Formik
                initialValues={{
                    code: '',
                }}
                validationSchema={Yup.object().shape({
                    code: Yup.string().length(40).required(f('activationCodeRequired')),
                })}
                onSubmit={(values: Values, { resetForm }: FormikHelpers<Values>) => {
                    return handleActivation(values.code).then(() => resetForm(null))
                }}
            >
                {({ errors, touched }) => (
                    <Form className={styles.form} autoComplete="off">
                        <Field
                            as={Input}
                            id="code"
                            label={f('activationCode')}
                            type="text"
                            name="code"
                            error={errors.code && touched.code}
                        />
                        <PrimaryButton type="submit">{f('activateAccount')}</PrimaryButton>
                    </Form>
                )}
            </Formik>
        </>
    )
}
ActivationForm.defaultProps = {
    initialCode: undefined,
}
export default ActivationForm
