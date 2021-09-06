import React, { useState } from 'react'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { Notification } from 'ui/Notification'
import { TextInput } from 'ui/TextInput'
import {translateError} from './translateError'
import { AuthError, resendActivationLink } from '@digitalstage/api-client-react'

export interface Values {
    email: string
}

const ResendActivationForm = (): JSX.Element => {
    const [message, setMessage] = useState<string>()

    const Schema = Yup.object().shape({
        email: Yup.string()
            .email('E-Mail Adresse ist nicht gültig')
            .required('E-Mail Adresse wird benötigt'),
    })

    return (
        <Formik
            initialValues={{
                email: '',
            }}
            validationSchema={Schema}
            onSubmit={(values: Values, { resetForm }: FormikHelpers<Values>) => {
                setMessage(undefined)
                return resendActivationLink(values.email)
                    .then(() => resetForm(undefined))
                    .catch((err: AuthError) => setMessage(translateError(err)))
            }}
        >
            {({ errors, touched, handleReset, handleSubmit, dirty }) => (
                <Form onReset={handleReset} onSubmit={handleSubmit}>
                    <Field
                        as={TextInput}
                        id="email"
                        label="E-Mail Adresse"
                        placeholder="E-Mail Adresse"
                        type="text"
                        name="email"
                        autoComplete="email"
                        error={touched.email && errors.email}
                    />
                    {message && <Notification kind="error">{message}</Notification>}
                    <div className="center">
                        <button type="submit" disabled={!dirty || Object.keys(errors).length > 0}>
                            Erneut senden
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}
export {ResendActivationForm}
