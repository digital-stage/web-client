import * as React from 'react'
import {Formik, Field, Form, FormikHelpers} from 'formik'
import * as Yup from 'yup'
import Link from 'next/link'
import {useIntl} from 'react-intl'
import {useAuth} from '@digitalstage/api-client-react'
import translateError from '../utils/translateError'
import Input from '../../../ui/form/Input'
import Notification from '../../../ui/surface/Notification'
import TertiaryButton from '../../../ui/button/TertiaryButton'
import PrimaryButton from '../../../ui/button/PrimaryButton'
import styles from "../../../styles/Account.module.css";

interface Values {
  email: string
  repeatEmail: string
}

const ForgetPasswordForm = (): JSX.Element => {
  const {requestPasswordReset, user} = useAuth()
  const {formatMessage} = useIntl()
  const f = (id) => formatMessage({id})

  const [msg, setMsg] = React.useState({
    state: false,
    type: null,
    kids: null,
  })

  const ForgetPasswordSchema = Yup.object().shape({
    email: Yup.string().email(f('enterValidEmail')).required(f('emailRequired')),
    repeatEmail: Yup.string()
      .oneOf([Yup.ref('email'), null], f('passwordMismatch'))
      .required(f('passwordConfirmRequired')),
  })

  return (
    <Formik
      initialValues={{email: '', repeatEmail: ''}}
      validationSchema={ForgetPasswordSchema}
      // eslint-disable-next-line max-len
      onSubmit={async (values: Values, {resetForm}: FormikHelpers<Values>) =>
        requestPasswordReset(values.email)
          .then(() => {
            setMsg({
              state: true,
              type: 'success',
              kids: f('resetLinkSent'),
            })
          })
          .catch((err) => {
            setMsg({
              state: true,
              type: 'danger',
              kids: translateError(err),
            })
          })
      }
    >
      {({errors, touched}) => (
        <Form className={styles.form} >
          {msg.state && <Notification>{msg.kids}</Notification>}

          <Field
            as={Input}
            id="email"
            label={f('emailAddress')}
            name="email"
            type="text"
            error={errors.email && touched.email}
            value={user && user.email}
          />
          <Field
            as={Input}
            id="repeatEmail"
            label={f('emailConfirmation')}
            name="repeatEmail"
            type="text"
            error={errors.repeatEmail && touched.repeatEmail}
            value={user && user.email}
          />
          <PrimaryButton type="submit">{f('send')}</PrimaryButton>
        </Form>
      )}
    </Formik>
  )
}

export default ForgetPasswordForm
