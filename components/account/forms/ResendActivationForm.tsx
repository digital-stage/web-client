import React, { useEffect, useState } from 'react'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import Link from 'next/link'
import { useAuth } from '@digitalstage/api-client-react'
import translateError from '../utils/translateError'
import Input from '../../../ui/form/Input'
import TertiaryButton from '../../../ui/button/TertiaryButton'
import PrimaryButton from '../../../ui/button/PrimaryButton'
import styles from '../../../styles/Account.module.css'
import Notification from '../../../ui/surface/Notification'

export interface Values {
    email: string
}

const ResendActivationForm = (): JSX.Element => {
    const { push } = useRouter()
    const [message, setMessage] = useState<string>()
    const { loading, user, resendActivationLink } = useAuth()
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })

    const Schema = Yup.object().shape({
        email: Yup.string().email(f('enterValidEmail')).required(f('emailRequired')),
    })

    useEffect(() => {
        if (!loading && user) {
            push('/')
        }
    }, [loading, user, push])

    const notification = message ? <Notification>{message}</Notification> : null

    return (
        <div>
            <div className={styles.formHeader}>
                <h3>{f('sendActivationLink')}</h3>
                <p>{f('enterEmailToActivate')}</p>
            </div>
            <Formik
                initialValues={{
                    email: '',
                }}
                validationSchema={Schema}
                onSubmit={(values: Values, { resetForm }: FormikHelpers<Values>) => {
                    setMessage(undefined)
                    return resendActivationLink(values.email)
                        .then(() => resetForm(null))
                        .catch((err) => {
                            setMessage(translateError(err))
                        })
                }}
            >
                {({ errors, touched }) => (
                    <Form>
                        <Field
                            as={Input}
                            id="email"
                            label={f('emailAddress')}
                            type="text"
                            name="email"
                            autocomplete="email"
                            error={errors.email && touched.email}
                        />
                        {notification}
                        <Link href="/account/login">
                            <TertiaryButton>{f('cancel')}</TertiaryButton>
                        </Link>
                        <PrimaryButton type="submit">{f('send')}</PrimaryButton>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
export default ResendActivationForm
