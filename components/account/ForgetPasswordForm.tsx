import * as React from 'react'
import { Formik, Field, FormikHelpers, Form } from 'formik'
import * as Yup from 'yup'
import { AuthError, requestPasswordReset, useStageSelector } from '@digitalstage/api-client-react'
import { NotificationItem, KIND  } from 'ui/NotificationItem'
import { TextInput } from 'ui/TextInput'
import {translateError} from './translateError'

interface Values {
    email: string
    repeatEmail: string
}

const ForgetPasswordForm = (): JSX.Element => {
    const user = useStageSelector((state) => state.auth.user)

    const [msg, setMsg] = React.useState<
        | {
              kind: KIND[keyof KIND]
              label: string
          }
        | undefined
    >(undefined)

    const ForgetPasswordSchema = Yup.object().shape({
        email: Yup.string()
            .email('E-Mail Adresse ist nicht gültig')
            .required('E-Mail Adresse wird benötigt'),
        repeatEmail: Yup.string()
            .oneOf([Yup.ref('email'), null], 'Die E-Mail Adressen stimmen nicht überein')
            .required('Bitte gebe hier nochmals Deine E-Mail Adresse ein'),
    })

    return (
        <Formik
            initialValues={{ email: '', repeatEmail: '' }}
            validationSchema={ForgetPasswordSchema}
            // eslint-disable-next-line max-len
            onSubmit={async (values: Values, { resetForm }: FormikHelpers<Values>) =>
                requestPasswordReset(values.email)
                    .then(() =>
                        setMsg({
                            kind: 'success',
                            label: 'Wir haben Dir eine E-Mail mit einem Link zum Zurücksetzen Deines Passwortes geschickt!',
                        })
                    )
                    .then(() => resetForm())
                    .catch((err: AuthError) => {
                        setMsg({
                            kind: 'error',
                            label: translateError(err),
                        })
                    })
            }
        >
            {({ errors, touched, handleReset, handleSubmit, dirty }) => (
                <Form onReset={handleReset} onSubmit={handleSubmit}>
                    {msg ? <NotificationItem kind={msg.kind}>{msg.label}</NotificationItem> : null}
                    <Field
                        as={TextInput}
                        id="email"
                        label="E-Mail Adresse"
                        placeholder="E-Mail Adresse"
                        name="email"
                        type="text"
                        error={touched.email && errors.email}
                        value={user?.email}
                    />
                    <Field
                        as={TextInput}
                        id="repeatEmail"
                        label="E-Mail Adresse (wiederholen)"
                        placeholder="E-Mail Adresse (wiederholen)"
                        name="repeatEmail"
                        type="text"
                        error={touched.repeatEmail && errors.repeatEmail}
                        value={user?.email}
                    />
                    <div className="center">
                        <button type="submit" disabled={!dirty || Object.keys(errors).length > 0}>
                            Passwort zurücksetzen
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export {ForgetPasswordForm}
