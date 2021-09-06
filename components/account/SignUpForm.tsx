import React, { useCallback, useState } from 'react'
import { Field, Form, Formik, FormikProps } from 'formik'
import { useRouter } from 'next/router'
import * as Yup from 'yup'
import { Notification } from 'ui/Notification'
import { TextInput } from 'ui/TextInput'
import {translateError} from './translateError'
import {
    AuthError,
    createUserWithEmailAndPassword,
    useNotification,
} from '@digitalstage/api-client-react'

const SignUpForm = () => {
    const [error, setError] = useState<string>()
    const { push } = useRouter()
    const notify = useNotification()

    const handleSubmit = useCallback(
        (values) => {
            createUserWithEmailAndPassword(values.email, values.password, values.name)
                .then(() =>
                    notify({
                        kind: 'info',
                        message:
                            'Bitte schaue in Deinen Mails nach - wir haben Dir einen Bestätigungscode geschickt',
                    })
                )
                .then(() => push('/account/activate'))
                .catch((err: AuthError) => setError(translateError(err)))
        },
        [push, notify]
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
                        as={TextInput}
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
                        as={TextInput}
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
                        as={TextInput}
                        id="passwordRepeat"
                        type="password"
                        name="passwordRepeat"
                        label="Passwort wiederholen"
                        placeholder="Passwort wiederholen"
                        autoComplete="password"
                        error={props.touched.passwordRepeat && props.errors.passwordRepeat}
                    />
                    <Field
                        as={TextInput}
                        id="name"
                        label="Name"
                        type="text"
                        name="name"
                        placeholder="Name"
                        error={props.touched.name && props.errors.name}
                        maxLength={30}
                    />
                    {error && <Notification kind="error">{error}</Notification>}
                    <div className="center">
                        <button
                            type="submit"
                            disabled={!props.dirty || Object.keys(props.errors).length > 0}
                        >
                            Registrieren
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}
export {SignUpForm}
