import * as React from 'react'
import { Formik, Field, FormikHelpers, Form } from 'formik'
import * as Yup from 'yup'
import { AuthError, useAuth } from '@digitalstage/api-client-react'
import Notification from '../ui/Notification'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Block from '../ui/Block'
import translateError from './translateError'

interface Values {
    email: string
    repeatEmail: string
}

const ForgetPasswordForm = (): JSX.Element => {
    const { requestPasswordReset, user } = useAuth()

    const [msg, setMsg] = React.useState({
        state: false,
        type: null,
        kids: null,
    })

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
                    .then(() => {
                        setMsg({
                            state: true,
                            type: 'success',
                            kids: 'Wir haben Dir eine E-Mail mit einem Link zum Zurücksetzen Deines Passwortes geschickt!',
                        })
                    })
                    .then(() => resetForm())
                    .catch((err: AuthError) => {
                        setMsg({
                            state: true,
                            type: 'danger',
                            kids: translateError(err.code),
                        })
                    })
            }
        >
            {({ errors, touched, handleReset, handleSubmit }) => (
                <Form onReset={handleReset} onSubmit={handleSubmit}>
                    {msg.state && (
                        <Block paddingBottom={4}>
                            <Notification type={msg.type}>{msg.kids}</Notification>
                        </Block>
                    )}
                    <Field
                        as={Input}
                        id="email"
                        label="E-Mail Adresse"
                        placeholder="E-Mail Adresse"
                        name="email"
                        type="text"
                        error={touched.email && errors.email}
                        value={user && user.email}
                    />
                    <Field
                        as={Input}
                        id="repeatEmail"
                        label="E-Mail Adresse (wiederholen)"
                        placeholder="E-Mail Adresse (wiederholen)"
                        name="repeatEmail"
                        type="text"
                        error={touched.repeatEmail && errors.repeatEmail}
                        value={user && user.email}
                    />
                    <Block align="center">
                        <Button type="submit">Passwort zurücksetzen</Button>
                    </Block>
                </Form>
            )}
        </Formik>
    )
}

export default ForgetPasswordForm
