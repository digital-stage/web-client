import React, { useCallback, useEffect, useState } from 'react'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'
import { AuthError, useAuth } from '@digitalstage/api-client-react'
import Input from '../../ui/Input'
import Notification from '../ui/Notification'
import Button from '../../ui/Button'
import Block from '../ui/Block'
import translateError from './translateError'

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

    const handleActivation = useCallback(
        (code: string) => {
            setMessage(undefined)
            return activate(code)
                .then(() => {
                    setMessage({
                        type: 'success',
                        content: 'Account aktiviert!',
                    })
                    return setTimeout(() => {
                        push('/')
                    }, 1000)
                })
                .catch((error: AuthError) => {
                    setMessage({
                        type: 'danger',
                        content: translateError(error),
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
                    code: Yup.string()
                        .length(40)
                        .required('Ohne Code kannst Du Dein Konto nicht aktivieren.'),
                })}
                onSubmit={(values: Values, { resetForm }: FormikHelpers<Values>) => {
                    return handleActivation(values.code).then(() => resetForm(null))
                }}
            >
                {({ errors, touched, handleSubmit, handleReset, dirty }) => (
                    <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="off">
                        <Field
                            as={Input}
                            id="code"
                            label="Aktivierungscode"
                            placeholder="Aktivierungscode"
                            type="text"
                            name="code"
                            error={touched.code && errors.code}
                        />
                        <Block align="center">
                            <Button
                                type="submit"
                                disabled={!dirty || Object.keys(errors).length > 0}
                            >
                                Konto aktivieren
                            </Button>
                        </Block>
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
