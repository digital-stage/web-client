import * as React from 'react'
import { useRouter } from 'next/router'
import { Formik, Field, Form, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useAuth } from '@digitalstage/api-client-react'
import translateError from '../utils/translateError'
import Input from '../../../ui/form/Input'
import Notification from '../../../ui/surface/Notification'
import styles from '../../../styles/Account.module.css'
import PrimaryButton from '../../../ui/button/PrimaryButton'

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
                    .catch((err) =>
                        setMsg({
                            state: true,
                            type: 'danger',
                            kids: translateError(err),
                        })
                    )
            }
        >
            {({ errors, touched }) => (
                <Form>
                    <div className={styles.formHeader}>
                        <h3>Setze eine neues Passwort</h3>
                        <p>
                            Das Passwort muss folgendes beinhalten: mindestens eine Zahl, ein
                            kleiner und ein großer Buchstabe sowie insgesamt eine Länge von 8
                            Zeichen haben
                        </p>
                    </div>
                    {msg.state && <Notification>{msg.kids}</Notification>}

                    <Field
                        as={Input}
                        id="password"
                        label="Password"
                        name="password"
                        type="password"
                        error={errors.password && touched.password}
                    />
                    <Field
                        as={Input}
                        id="repeatPassword"
                        label="Repeat Password"
                        type="password"
                        name="repeatPassword"
                        error={errors.repeatPassword && touched.repeatPassword}
                    />
                    <PrimaryButton type="submit">Passwort setzen</PrimaryButton>
                </Form>
            )}
        </Formik>
    )
}

export default ResetPasswordForm
