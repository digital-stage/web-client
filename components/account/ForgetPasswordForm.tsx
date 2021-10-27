/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as React from 'react'
import {Formik, Field, FormikHelpers, Form} from 'formik'
import * as Yup from 'yup'
import {
  AuthError,
  requestPasswordReset,
  selectAuthUser,
  useTrackedSelector
} from '@digitalstage/api-client-react'
import {NotificationItem, KIND} from 'ui/NotificationItem'
import {TextInput} from 'ui/TextInput'
import {translateError} from './translateError'

interface Values {
  email: string
  repeatEmail: string
}

const ForgetPasswordForm = (): JSX.Element => {
  const state = useTrackedSelector()
  const user = selectAuthUser(state)
  const [msg, setMsg] = React.useState<| {
    kind: KIND[keyof KIND]
    label: string
  }
    | undefined>(undefined)

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
      initialValues={{email: '', repeatEmail: ''}}
      validationSchema={ForgetPasswordSchema}
      // eslint-disable-next-line max-len
      onSubmit={async (values: Values, {resetForm}: FormikHelpers<Values>) => {
        if (state.globals.authUrl)
          return requestPasswordReset(state.globals.authUrl, values.email)
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
      }
    >
      {({errors, touched, handleReset, handleSubmit, dirty}) => (
        <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="on">
          {msg ? <NotificationItem kind={msg.kind}>{msg.label}</NotificationItem> : null}
          <Field
            as={TextInput}
            id="email"
            label="E-Mail Adresse"
            placeholder="E-Mail Adresse"
            name="email"
            type="email"
            error={touched.email && errors.email}
            value={user?.email}
            autoComplete="email"
          />
          <Field
            as={TextInput}
            id="repeatEmail"
            label="E-Mail Adresse (wiederholen)"
            placeholder="E-Mail Adresse (wiederholen)"
            name="repeatEmail"
            type="email"
            error={touched.repeatEmail && errors.repeatEmail}
            value={user?.email}
            autoComplete="email"
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
