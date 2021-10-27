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

import React from 'react'
import {Field, Form, Formik, FormikProps} from 'formik'
import * as Yup from 'yup'
import {NotificationItem} from 'ui/NotificationItem'
import {TextInput} from 'ui/TextInput'
import {
  AuthError,
  createUserWithEmailAndPassword,
  useNotification, useTrackedSelector,
} from '@digitalstage/api-client-react'
import {translateError} from './translateError'

const SignUpForm = ({onSignedUp}: { onSignedUp: () => void }): JSX.Element => {
  const state = useTrackedSelector()
  const [error, setError] = React.useState<string>()
  const notify = useNotification()

  const handleSubmit = React.useCallback(
    (values) => {
      if (state.globals.authUrl)
        return createUserWithEmailAndPassword(state.globals.authUrl, values.email, values.password, values.name)
          .then(() =>
            notify({
              kind: 'info',
              message:
                'Bitte schaue in Deinen Mails nach - wir haben Dir einen Bestätigungscode geschickt',
            })
          )
          .then(() => onSignedUp())
          .catch((err: AuthError) => setError(translateError(err)))
    },
    [onSignedUp, notify, state.globals.authUrl]
  )

  return (
    <Formik
      initialValues={{email: '', password: '', passwordRepeat: '', name: ''}}
      onSubmit={handleSubmit}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('E-Mail Adresse ist nicht gültig')
          .required('E-Mail Adresse wird benötigt'),
        password: Yup.string()
          .min(8, 'zu kurz')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
            'Das Passwort muss aus einer Kombination aus Groß- und Kleinbuchstaben sowie Zahlen und Sonderzeichen bestehen'
          )
          .required('Ein Passwort wird benötigt'),
        passwordRepeat: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Die Passwörter sind nicht gleich')
          .required('Bitte gebe hier nochmals Dein Passwort ein'),
        name: Yup.string()
          .min(2, 'zu kurz')
          .max(70, 'zu lang')
          .required('Ein Name wird benötigt'),
      })}
    >
      {(props: FormikProps<{ email: string, password: string, passwordRepeat: string, name: string }>) => (
        <Form onReset={props.handleReset} onSubmit={props.handleSubmit} autoComplete="on">
          <Field
            as={TextInput}
            id="email"
            type="email"
            name="email"
            label="E-Mail Adresse"
            placeholder="E-Mail Adresse"
            autoComplete="email"
            error={props.touched.email && props.errors.email}
            maxLength={100}
          />
          <Field
            as={TextInput}
            id="password"
            type="password"
            name="password"
            label="Passwort"
            placeholder="Passwort"
            autoComplete="password"
            error={props.touched.password && props.errors.password}
            maxLength={20}
          />
          <Field
            as={TextInput}
            id="passwordRepeat"
            type="password"
            name="passwordRepeat"
            label="Passwort wiederholen"
            placeholder="Passwort wiederholen"
            autoComplete="password"
            error={props.touched.passwordRepeat && props.errors.passwordRepeat}
          />
          <Field
            as={TextInput}
            id="name"
            label="Name"
            type="text"
            name="name"
            placeholder="Name"
            autoComplete="name"
            error={props.touched.name && props.errors.name}
            maxLength={30}
          />
          {error && <NotificationItem kind="error">{error}</NotificationItem>}
          <div className="center">
            <button
              type="submit"
              disabled={!props.dirty || Object.keys(props.errors).length > 0}
            >
              Registrieren
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
export {SignUpForm}
