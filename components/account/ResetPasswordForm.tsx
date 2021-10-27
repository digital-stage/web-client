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
import {NotificationItem, KIND} from 'ui/NotificationItem'
import {TextInput} from 'ui/TextInput'
import {AuthError, resetPassword, useTrackedSelector} from '@digitalstage/api-client-react'
import {translateError} from './translateError'

interface Values {
  password?: string
  repeatPassword?: string
  response?: string
}

function ResetPasswordForm({resetToken, onReset}: {
  resetToken: string
  onReset: () => void
}): JSX.Element {
  const state = useTrackedSelector()
  const [msg, setMsg] = React.useState<| {
    kind: KIND[keyof KIND]
    label: string
  }
    | undefined>(undefined)

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

  const onSubmit = React.useCallback((values: Values, {resetForm}: FormikHelpers<Values>) => {
    if (!values.password) {
      throw new Error("Missing password")
    }
    if (!state.globals.authUrl)
      throw new Error("Not ready")
    return resetPassword(state.globals.authUrl, resetToken, values.password)
      .then(() => resetForm(undefined))
      .then(() => onReset())
      .catch((err: AuthError) =>
        setMsg({
          kind: 'error',
          label: translateError(err),
        })
      )
  }, [resetToken, onReset])

  return (
    <Formik
      initialValues={{
        password: '',
        repeatPassword: '',
      }}
      validationSchema={ResetPasswordSchema}
      onSubmit={onSubmit}
    >
      {({errors, touched, handleReset, handleSubmit, dirty}) => (
        <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="off">
          {msg ? <NotificationItem kind={msg.kind}>{msg.label}</NotificationItem> : null}
          <Field
            as={TextInput}
            id="password"
            label="Passwort"
            placeholder="Passwort"
            name="password"
            type="password"
            autoComplete="new-password"
            error={touched.password && errors.password}
          />
          <Field
            as={TextInput}
            id="repeatPassword"
            label="Passwort wiederholen"
            placeholder="Passwort wiederholen"
            type="password"
            name="repeatPassword"
            autoComplete="new-password"
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
