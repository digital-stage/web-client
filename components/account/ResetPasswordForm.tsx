import * as React from 'react'
import { useRouter } from 'next/router'
import { Formik, Field, FormikHelpers, Form } from 'formik'
import * as Yup from 'yup'
import { NotificationItem, KIND  } from 'ui/NotificationItem'
import { TextInput } from 'ui/TextInput'
import {translateError} from './translateError'
import { AuthError, resetPassword } from '@digitalstage/api-client-react'

interface Values {
    password?: string
    repeatPassword?: string
    response?: string
}

interface Props {
    resetToken?: string
}

function ResetPasswordForm({ resetToken }: Props): JSX.Element {
    const { push } = useRouter()

    const [msg, setMsg] = React.useState<
        | {
              kind: KIND[keyof KIND]
              label: string
          }
        | undefined
    >(undefined)

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
            onSubmit={(values: Values, { resetForm }: FormikHelpers<Values>) => {
                if (values.password && resetToken)
                    resetPassword(resetToken, values.password)
                        .then(() => resetForm(undefined))
                        .then(() => push('/account/login'))
                        .catch((err: AuthError) =>
                            setMsg({
                                kind: 'error',
                                label: translateError(err),
                            })
                        )
            }}
        >
            {({ errors, touched, handleReset, handleSubmit, dirty }) => (
                <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="off">
                    {msg ? <NotificationItem kind={msg.kind}>{msg.label}</NotificationItem> : null}
                    <Field
                        as={TextInput}
                        id="password"
                        label="Passwort"
                        placeholder="Passwort"
                        name="password"
                        type="password"
                        error={touched.password && errors.password}
                    />
                    <Field
                        as={TextInput}
                        id="repeatPassword"
                        label="Passwort wiederholen"
                        placeholder="Passwort wiederholen"
                        type="password"
                        name="repeatPassword"
                        error={touched.repeatPassword && errors.repeatPassword}
                    />
                    <div className="center">
                        <button type="submit" disabled={!dirty || Object.keys(errors).length > 0}>
                            Passwort setzen
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export {ResetPasswordForm}
