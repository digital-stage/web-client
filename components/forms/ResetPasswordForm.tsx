import * as React from 'react'
import { useRouter } from 'next/router'
import { Formik, Field, FormikHelpers, Form } from 'formik'
import * as Yup from 'yup'
import { AuthError, useAuth } from '@digitalstage/api-client-react'
import Block from '../ui/Block'
import Notification from '../ui/Notification'
import Button from '../ui/Button'
import Input from '../ui/Input'
import translateError from './translateError'

interface Values {
    password?: string
    repeatPassword?: string
    response?: string
}

interface Props {
    resetToken: string
}

function ResetPasswordForm({ resetToken }: Props): JSX.Element {
    const router = useRouter()
    const { resetPassword } = useAuth()

    const [msg, setMsg] = React.useState({
        state: false,
        type: null,
        kids: null,
    })

    const ResetPasswordSchema = Yup.object().shape({
        password: Yup.string()
            .min(8, 'Das Passwort muss eine Mindestlänge von 8 Zeichen haben')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
                'Das Passwort muss folgendes beinhalten: mindestens eine Zahl, ein kleiner und ein großer Buchstabe sowie insgesamt eine Länge von 8 Zeichen haben'
            )
            .required('Passwort wird benötigt'),
        repeatPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Die Passwörter müssen identisch sein')
            .required('Die Passwortwiederholung wird benötigt'),
    })

    return (
        <Formik
            initialValues={{
                password: '',
                repeatPassword: '',
            }}
            validationSchema={ResetPasswordSchema}
            onSubmit={(values: Values, { resetForm }: FormikHelpers<Values>) =>
                resetPassword(resetToken, values.password)
                    .then(() => resetForm(null))
                    .then(() => router.push('/account/login'))
                    .catch((err: AuthError) =>
                        setMsg({
                            state: true,
                            type: 'danger',
                            kids: translateError(err),
                        })
                    )
            }
        >
            {({ errors, touched, handleReset, handleSubmit, dirty }) => (
                <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="off">
                    {msg.state && (
                        <Block paddingBottom={4}>
                            <Notification type={msg.type}>{msg.kids}</Notification>
                        </Block>
                    )}

                    <Field
                        as={Input}
                        id="password"
                        label="Passwort"
                        placeholder="Passwort"
                        name="password"
                        type="password"
                        error={touched.password && errors.password}
                    />
                    <Field
                        as={Input}
                        id="repeatPassword"
                        label="Passwort wiederholen"
                        placeholder="Passwort wiederholen"
                        type="password"
                        name="repeatPassword"
                        error={touched.repeatPassword && errors.repeatPassword}
                    />
                    <Button type="submit" disabled={!dirty || Object.keys(errors).length > 0}>
                        Passwort setzen
                    </Button>
                </Form>
            )}
        </Formik>
    )
}

export default ResetPasswordForm
