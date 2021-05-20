import React, { useCallback, useEffect, useState } from 'react'
import { Field, Form, Formik, FormikProps } from 'formik'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import * as Yup from 'yup'
import Notification from '../ui/Notification'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Block from '../ui/Block'

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
                createUserWithEmailAndPassword(values.email, values.password, values.displayName)
                    .then(() => push('/'))
                    .catch((err) => setError(err.message))
            }
        },
        [createUserWithEmailAndPassword]
    )

    return (
        <>
            <Formik
                initialValues={{ email: '', password: '', passwordRepeat: '', displayName: '' }}
                onSubmit={handleSubmit}
                validationSchema={Yup.object().shape({
                    email: Yup.string()
                        .email('E-Mail Adresse ist nicht gültig')
                        .required('E-Mail Adresse wird benötigt'),
                    name: Yup.string()
                        .min(2, 'zu kurz')
                        .max(70, 'zu lang')
                        .required('Ein Name wird benötigt'),
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
                })}
            >
                {(props: FormikProps<any>) => (
                    <Form
                        onReset={props.handleReset}
                        onSubmit={props.handleSubmit}
                        autoComplete="on"
                    >
                        <Field
                            as={Input}
                            label="E-Mail Adresse"
                            placeholder="E-Mail Adresse"
                            type="email"
                            name="email"
                            autoComplete="email"
                            error={props.touched.email && props.errors.email}
                            maxLength={100}
                        />
                        <Field
                            as={Input}
                            label="Passwort"
                            placeholder="Passwort"
                            type="password"
                            name="password"
                            autoComplete="password"
                            error={props.touched.password && props.errors.password}
                            maxLength={20}
                        />
                        <Field
                            as={Input}
                            label="Passwort wiederholen"
                            placeholder="Passwort wiederholen"
                            type="password"
                            name="passwordRepeat"
                            autoComplete="password"
                            error={props.errors.passwordRepeat && props.touched.passwordRepeat}
                        />
                        <Field
                            as={Input}
                            label="Name"
                            placeholder="Name"
                            type="text"
                            name="displayName"
                            error={props.touched.displayName && props.errors.displayName}
                            maxLength={30}
                        />
                        {error && (
                            <Block paddingBottom={4}>
                                <Notification type="error">{error}</Notification>
                            </Block>
                        )}
                        <Block width={12} align="center">
                            <Button type="submit">Registrieren</Button>
                        </Block>
                    </Form>
                )}
            </Formik>
        </>
    )
}
export default SignUpForm
