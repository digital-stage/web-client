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

import React, {useCallback} from 'react'
import {Field, Form, Formik, FormikProps} from 'formik'
import {
  getUserByToken,
  signInWithEmailAndPassword,
  InternalActionTypes,
  useTrackedSelector
} from '@digitalstage/api-client-react'
import * as Yup from 'yup'
import {TextInput} from 'ui/TextInput'
import {NotificationItem} from 'ui/NotificationItem'
import {batch, useDispatch} from 'react-redux'
import {translateError} from './translateError'
import {Switch} from "../../ui/Switch";

const LoginForm = (): JSX.Element => {
  const [error, setError] = React.useState<string>()
  const state = useTrackedSelector()
  const dispatch = useDispatch()

  const handleSubmit = useCallback(
    (values) => {
      if (state.globals.authUrl) {
        const authUrl = state.globals.authUrl
        return signInWithEmailAndPassword(authUrl, values.email, values.password)
          .then(async (token) => {
            const user = await getUserByToken(authUrl, token)
            batch(() => {
              dispatch({
                type: InternalActionTypes.SET_USER,
                payload: user,
              })
              dispatch({
                type: InternalActionTypes.SET_TOKEN,
                payload: {
                  token,
                  staySignedIn: values.staySignedIn,
                },
              })
            })
            setError(undefined)
          })
          .catch((err) => setError(translateError(err)))
      }
    },
    [dispatch]
  )

  return (
    <Formik
      initialValues={{email: '', password: ''}}
      onSubmit={handleSubmit}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('E-Mail Adresse ist nicht gültig')
          .required('E-Mail Adresse wird benötigt'),
        password: Yup.string().min(8, 'zu kurz').required('Ein Passwort wird benötigt'),
        staySignedIn: Yup.boolean(),
      })}
    >
      {(props: FormikProps<{ email: string, password: string }>) => (
        <Form
          onReset={props.handleReset}
          onSubmit={props.handleSubmit}
          autoComplete="on"
        >
          <Field
            id="email"
            as={TextInput}
            label="E-Mail Adresse"
            placeholder="E-Mail Adresse"
            type="email"
            name="email"
            autoComplete="email"
            notification={props.touched.email && props.errors.email}
            maxLength={100}
          />
          <Field
            id="password"
            as={TextInput}
            label="Passwort"
            placeholder="Passwort"
            type="password"
            name="password"
            autoComplete="current-password"
            notification={props.touched.password && props.errors.password}
            maxLength={20}
          />
          <label className="staySignedInLabel">
            <Field id="staySignedIn" name="staySignedIn" type="checkbox" as={Switch} size="small" round/>
            Angemeldet bleiben
          </label>
          {error && <NotificationItem kind="error">{error}</NotificationItem>}
          <div className="center">
            <button
              disabled={!props.dirty || Object.keys(props.errors).length > 0}
              type="submit"
            >
              Anmelden
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
export {LoginForm}
