import React, { useCallback, useEffect, useState } from 'react'
import { Field, Form, Formik, FormikProps } from 'formik'
import { AuthError, useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import * as Yup from 'yup'
import Notification from '../ui/Notification'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Block from '../ui/Block'
import translateError from './translateError'

const SignUpForm = () => {
    const { createUserWithEmailAndPassword, loading, user } = useAuth()
    const [error, setError] = useState<string>()
    const { push, prefetch } = useRouter()

    useEffect(() => {
        if (prefetch) {
            prefetch('/login')
        }
    }, [prefetch])

    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])

    const handleSubmit = useCallback(
        (values) => {
            if (createUserWithEmailAndPassword) {
                createUserWithEmailAndPassword(values.email, values.password, values.name)
                    .then(() => push('/'))
                    .catch((err: AuthError) => setError(translateError(err)))
            }
        },
        [createUserWithEmailAndPassword, push]
    )

    return (
        <Formik
            initialValues={{ email: '', password: '', passwordRepeat: '', name: '' }}
            onSubmit={handleSubmit}
            validationSchema={Yup.object().shape({
                email: Yup.string()
                    .email('E-Mail Adresse ist nicht gültig')
                    .required('E-Mail Adresse wird benötigt'),
                password: Yup.string()
                    .min(8, 'zu kurz')
                    .matches(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
                        'Das Passwort muss aus einer Kombination aus Groß- und Kleinbuchstaben sowie Zahlen und Sonderzeichen bestehen'
                    )
                    .required('Ein Passwort wird benötigt'),
                passwordRepeat: Yup.string()
                    .oneOf([Yup.ref('password'), null], 'Die Passwörter sind nicht gleich')
                    .required('Bitte gebe hier nochmals Dein Passwort ein'),
                name: Yup.string()
                    .min(2, 'zu kurz')
                    .max(70, 'zu lang')
                    .required('Ein Name wird benötigt'),
            })}
        >
            {(props: FormikProps<any>) => (
                <Form onReset={props.handleReset} onSubmit={props.handleSubmit} autoComplete="on">
                    <Field
                        as={Input}
                        id="email"
                        type="email"
                        name="email"
                        label="E-Mail Adresse"
                        placeholder="E-Mail Adresse"
                        autoComplete="email"
                        error={props.touched.email && props.errors.email}
                        maxLength={100}
                    />
                    <Field
                        as={Input}
                        id="password"
                        type="password"
                        name="password"
                        label="Passwort"
                        placeholder="Passwort"
                        autoComplete="password"
                        error={props.touched.password && props.errors.password}
                        maxLength={20}
                    />
                    <Field
                        as={Input}
                        id="passwordRepeat"
                        type="password"
                        name="passwordRepeat"
                        label="Passwort wiederholen"
                        placeholder="Passwort wiederholen"
                        autoComplete="password"
                        error={props.touched.passwordRepeat && props.errors.passwordRepeat}
                    />
                    <Field
                        as={Input}
                        id="name"
                        label="Name"
                        type="text"
                        name="name"
                        placeholder="Name"
                        error={props.touched.name && props.errors.name}
                        maxLength={30}
                    />
                    {error && (
                        <Block paddingBottom={4}>
                            <Notification type="error">{error}</Notification>
                        </Block>
                    )}
                    <Block width={12} align="center">
                        <Button
                            type="submit"
                            disabled={!props.dirty || Object.keys(props.errors).length > 0}
                        >
                            Registrieren
                        </Button>
                    </Block>
                </Form>
            )}
        </Formik>
    )
}
export default SignUpForm
