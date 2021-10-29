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
import {activate, AuthError, useTrackedSelector} from '../../client'
import {TextInput} from 'ui/TextInput'
import {KIND, NotificationItem} from 'ui/NotificationItem'
import {translateError} from './translateError'

export interface Values {
  code: string
}

const ActivationForm = ({initialCode, onActivated}: { initialCode?: string, onActivated: () => void }): JSX.Element => {
  const state = useTrackedSelector()
  const [message, setMessage] = React.useState<{
    kind: KIND[keyof KIND]
    content: string
  }>()

  const handleActivation = React.useCallback(
    (code: string) => {
      if (state.globals.authUrl) {
        setMessage(undefined)
        return activate(state.globals.authUrl, code)
          .then(() => {
            setMessage({
              kind: 'success',
              content: 'Account aktiviert!',
            })
            return setTimeout(() => {
              onActivated()
            }, 1000)
          })
          .catch((error: AuthError) => {
            setMessage({
              kind: 'error',
              content: translateError(error),
            })
          })
      }
      throw new Error("Not ready")
    },
    [onActivated, state.globals.authUrl]
  )

  React.useEffect(() => {
    if (initialCode) {
      handleActivation(initialCode)
    }
  }, [initialCode, handleActivation])

  const onSubmit = React.useCallback((values: Values, {resetForm}: FormikHelpers<Values>) =>
    handleActivation(values.code).then(() => resetForm(undefined)), [handleActivation]
  )

  return (
    <>
      {message && <NotificationItem kind={message.kind}>{message.content}</NotificationItem>}
      <Formik
        initialValues={{
          code: initialCode || '',
        }}
        validationSchema={Yup.object().shape({
          code: Yup.string()
            .length(40, 'Ungültiger Code, hast Du ein Zeichen vergessen oder zuviel eingegeben?')
            .required('Ohne Code kannst Du Dein Konto nicht aktivieren.'),
        })}
        onSubmit={onSubmit}
      >
        {({errors, touched, handleSubmit, handleReset, dirty, values}) => (
          <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete="on">
            <Field
              as={TextInput}
              id="code"
              label="Aktivierungscode"
              placeholder="Aktivierungscode"
              type="text"
              name="code"
              value={values.code}
              error={touched.code && errors.code}
              autoComplete="one-time-code"
            />
            <div className="center">
              <button
                type="submit"
                disabled={!dirty || Object.keys(errors).length > 0}
              >
                Konto aktivieren
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  )
}
ActivationForm.defaultProps = {
  initialCode: undefined,
}
export {ActivationForm}
