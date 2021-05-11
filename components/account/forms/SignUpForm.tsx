import React, { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Field, Form, Formik, FormikProps } from 'formik'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import * as Yup from 'yup'
import Input from '../../../ui/form/Input'
import PrimaryButton from '../../../ui/button/PrimaryButton'
import Notification from '../../../ui/surface/Notification'
import styles from '../../../styles/Account.module.css'

const SignUpForm = () => {
    const { createUserWithEmailAndPassword, loading, user } = useAuth()
    const [error, setError] = useState<string>()
    const { push, prefetch } = useRouter()
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })

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
                    email: Yup.string().email(f('enterValidEmail')).required(f('emailRequired')),
                    name: Yup.string()
                        .min(2, f('nameTooShort'))
                        .max(70, f('nameTooLong'))
                        .required(f('nameRequired')),
                    password: Yup.string()
                        .min(8, f('passwordMinLength'))
                        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/, f('passwordFormat'))
                        .required(f('passwordRequired')),
                    passwordRepeat: Yup.string()
                        .oneOf([Yup.ref('password'), null], f('passwordMismatch'))
                        .required(f('passwordConfirmRequired')),
                })}
            >
                {(props: FormikProps<any>) => (
                    <Form className={styles.form} autoComplete="on">
                        <Field
                            as={Input}
                            label={f('emailAddress')}
                            placeholder={f('emailAddress')}
                            type="email"
                            name="email"
                            autoComplete="email"
                            error={props.touched.email && props.errors.email}
                            maxLength={100}
                        />
                        <Field
                            as={Input}
                            label={f('password')}
                            placeholder={f('password')}
                            type="password"
                            name="password"
                            autoComplete="password"
                            error={props.touched.password && props.errors.password}
                            maxLength={20}
                        />
                        <Field
                            as={Input}
                            label={f('repeatPassword')}
                            placeholder={f('repeatPassword')}
                            type="password"
                            name="passwordRepeat"
                            autoComplete="password"
                            error={props.errors.passwordRepeat && props.touched.passwordRepeat}
                        />
                        <Field
                            as={Input}
                            label={f('name')}
                            placeholder={f('name')}
                            type="text"
                            name="displayName"
                            error={props.touched.displayName && props.errors.displayName}
                            maxLength={30}
                        />
                        {error && <Notification>{error}</Notification>}
                        <PrimaryButton type="submit">{f('doSignUp')}</PrimaryButton>
                    </Form>
                )}
            </Formik>
        </>
    )
}
export default SignUpForm
