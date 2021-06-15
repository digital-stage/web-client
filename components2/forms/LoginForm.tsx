import React, { useCallback, useEffect, useState } from 'react'
import { Field, Form, Formik, FormikProps } from 'formik'
import { AuthError, useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import * as Yup from 'yup'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import Notification from '../../ui/Notification'
import Block from '../../components/ui/Block'
import translateError from './translateError'

const LoginForm = (): JSX.Element => {
    const { signInWithEmailAndPassword, loading, user } = useAuth()
    const [error, setError] = useState<string>()
    const { push, prefetch } = useRouter()

    useEffect(() => {
        if (prefetch) {
            prefetch('/account/signup')
        }
    }, [prefetch])

    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])

    const handleSubmit = useCallback(
        (values) => {
            if (signInWithEmailAndPassword) {
                console.log('hihi')
                signInWithEmailAndPassword(values.email, values.password)
                    .then(() => push('/'))
                    .catch((err: AuthError) => {
                        setError(translateError(err))
                    })
            }
        },
        [signInWithEmailAndPassword]
    )

    return (
        <>
            <Formik
                initialValues={{ email: '', password: '' }}
                onSubmit={handleSubmit}
                validationSchema={Yup.object().shape({
                    email: Yup.string()
                        .email('E-Mail Adresse ist nicht gültig')
                        .required('E-Mail Adresse wird benötigt'),
                    password: Yup.string().min(8, 'zu kurz').required('Ein Passwort wird benötigt'),
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
                            notification={props.touched.email && props.errors.email}
                            maxLength={100}
                        />
                        <Field
                            as={Input}
                            label="Passwort"
                            placeholder="Passwort"
                            type="password"
                            name="password"
                            autoComplete="password"
                            notification={props.touched.password && props.errors.password}
                            maxLength={20}
                        />
                        {error && (
                            <Block paddingBottom={4}>
                                <Notification type="error">{error}</Notification>
                            </Block>
                        )}
                        <Block width={12} align="center">
                            <Button
                                disabled={!props.dirty || Object.keys(props.errors).length > 0}
                                type="submit"
                            >
                                Anmelden
                            </Button>
                        </Block>
                    </Form>
                )}
            </Formik>
        </>
    )
}
export default LoginForm
