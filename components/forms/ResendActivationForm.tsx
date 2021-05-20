import React, { useEffect, useState } from 'react'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'
import { useAuth } from '@digitalstage/api-client-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Block from '../ui/Block'
import Notification from '../ui/Notification'

export interface Values {
    email: string
}

const ResendActivationForm = (): JSX.Element => {
    const { push } = useRouter()
    const [message, setMessage] = useState<string>()
    const { loading, user, resendActivationLink } = useAuth()

    const Schema = Yup.object().shape({
        email: Yup.string()
            .email('E-Mail Adresse ist nicht gültig')
            .required('E-Mail Adresse wird benötigt'),
    })

    useEffect(() => {
        if (!loading && user) {
            push('/')
        }
    }, [loading, user, push])

    return (
        <Formik
            initialValues={{
                email: '',
            }}
            validationSchema={Schema}
            onSubmit={(values: Values, { resetForm }: FormikHelpers<Values>) => {
                setMessage(undefined)
                return resendActivationLink(values.email)
                    .then(() => resetForm(null))
                    .catch((err) => {
                        setMessage(err)
                    })
            }}
        >
            {({ errors, touched, handleReset, handleSubmit }) => (
                <Form onReset={handleReset} onSubmit={handleSubmit}>
                    <Field
                        as={Input}
                        id="email"
                        label="E-Mail Adresse"
                        placeholder="E-Mail Adresse"
                        type="text"
                        name="email"
                        autocomplete="email"
                        error={errors.email && touched.email}
                    />
                    {message && (
                        <Block paddingBottom={4}>
                            <Notification type="error">{message}</Notification>
                        </Block>
                    )}
                    <Block align="center">
                        <Button type="submit">Erneut senden</Button>
                    </Block>
                </Form>
            )}
        </Formik>
    )
}
export default ResendActivationForm
