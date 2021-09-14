import React, { useCallback } from 'react'
import { Field, Form, Formik, FormikProps } from 'formik'
import { getUserByToken, signInWithEmailAndPassword } from '@digitalstage/api-client-react'
import * as Yup from 'yup'
import { TextInput } from 'ui/TextInput'
import { NotificationItem } from 'ui/NotificationItem'
import { batch, useDispatch } from 'react-redux'
import { InternalActionTypes } from '@digitalstage/api-client-react'
import {translateError} from './translateError'

const LoginForm = (): JSX.Element => {
    const [error, setError] = React.useState<string>()
    const dispatch = useDispatch()

    const handleSubmit = useCallback(
        (values) =>
            signInWithEmailAndPassword(values.email, values.password)
                .then(async (token) => {
                    const user = await getUserByToken(token)
                    batch(() => {
                        dispatch({
                            type: InternalActionTypes.SET_USER,
                            payload: user,
                        })
                        dispatch({
                            type: InternalActionTypes.SET_TOKEN,
                            payload: {
                                token: token,
                                staySignedIn: values.staySignedIn,
                            },
                        })
                    })
                    setError(undefined)
                })
                .catch((err) => setError(translateError(err))),
        [dispatch]
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
                    staySignedIn: Yup.boolean(),
                })}
            >
                {(props: FormikProps<any>) => (
                    <Form
                        onReset={props.handleReset}
                        onSubmit={props.handleSubmit}
                        autoComplete="on"
                    >
                        <Field
                            as={TextInput}
                            label="E-Mail Adresse"
                            placeholder="E-Mail Adresse"
                            type="email"
                            name="email"
                            autoComplete="email"
                            notification={props.touched.email && props.errors.email}
                            maxLength={100}
                        />
                        <Field
                            as={TextInput}
                            label="Passwort"
                            placeholder="Passwort"
                            type="password"
                            name="password"
                            autoComplete="password"
                            notification={props.touched.password && props.errors.password}
                            maxLength={20}
                        />
                        <label>
                            <Field type="checkbox" name="staySignedIn" />
                            Angemeldet bleiben
                        </label>
                        {error && <NotificationItem kind="error">{error}</NotificationItem>}
                        <div className="center">
                            <button
                                disabled={!props.dirty || Object.keys(props.errors).length > 0}
                                type="submit"
                            >
                                Anmelden
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}
export {LoginForm}
