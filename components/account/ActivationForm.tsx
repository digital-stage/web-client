import React, { useCallback} from 'react'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'
import { activate, AuthError } from '@digitalstage/api-client-react'
import {translateError} from './translateError'
import { TextInput } from 'ui/TextInput'
import { NotificationItem } from 'ui/NotificationItem'

export interface Values {
    code: string
}

const ActivationForm = (props: { initialCode?: string }): JSX.Element => {
    const { initialCode } = props
    const { push } = useRouter()
    const [message, setMessage] = React.useState<{
        type: 'danger' | 'warning' | 'info' | 'success'
        content: string
    }>()

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
                        push('/account/login')
                    }, 1000)
                })
                .catch((error: AuthError) => {
                    setMessage({
                        type: 'danger',
                        content: translateError(error),
                    })
                })
        },
        [push]
    )

   React.useEffect(() => {
        if (initialCode) handleActivation(initialCode)
    }, [initialCode, handleActivation])

    const notification = message ? <NotificationItem>{message.content}</NotificationItem> : null

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
                    return handleActivation(values.code).then(() => resetForm(undefined))
                }}
            >
                {({ errors, touched, handleSubmit, handleReset, dirty }) => (
                    <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="off">
                        <Field
                            as={TextInput}
                            id="code"
                            label="Aktivierungscode"
                            placeholder="Aktivierungscode"
                            type="text"
                            name="code"
                            error={touched.code && errors.code}
                        />
                        <div className="center">
                            <button
                                type="submit"
                                disabled={!dirty || Object.keys(errors).length > 0}
                            >
                                Konto aktivieren
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}
ActivationForm.defaultProps = {
    initialCode: undefined,
}
export {ActivationForm}
