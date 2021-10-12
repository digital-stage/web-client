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
import {Field, Form, Formik, FormikHelpers} from 'formik'
import * as Yup from 'yup'
import {NotificationItem} from 'ui/NotificationItem'
import {TextInput} from 'ui/TextInput'
import {AuthError, resendActivationLink} from '@digitalstage/api-client-react'
import {translateError} from './translateError'

export interface Values {
  email: string
}

const ResendActivationForm = (): JSX.Element => {
  const [message, setMessage] = React.useState<string>()

  const Schema = Yup.object().shape({
    email: Yup.string()
      .email('E-Mail Adresse ist nicht gültig')
      .required('E-Mail Adresse wird benötigt'),
  })

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      validationSchema={Schema}
      onSubmit={(values: Values, {resetForm}: FormikHelpers<Values>) => {
        setMessage(undefined)
        return resendActivationLink(values.email)
          .then(() => resetForm(undefined))
          .catch((err: AuthError) => setMessage(translateError(err)))
      }}
    >
      {({errors, touched, handleReset, handleSubmit, dirty}) => (
        <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="on">
          <Field
            as={TextInput}
            id="email"
            label="E-Mail Adresse"
            placeholder="E-Mail Adresse"
            name="email"
            type="email"
            autoComplete="email"
            error={touched.email && errors.email}
          />
          {message && <NotificationItem kind="error">{message}</NotificationItem>}
          <div className="center">
            <button type="submit" disabled={!dirty || Object.keys(errors).length > 0}>
              Erneut senden
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
export {ResendActivationForm}
