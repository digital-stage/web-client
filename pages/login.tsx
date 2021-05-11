import React, {useCallback, useEffect, useState} from "react";
import {useIntl} from "react-intl";
import {Field, Form, Formik, FormikProps} from 'formik';
import {useAuth} from "@digitalstage/api-client-react";
import {useRouter} from "next/router";
import * as Yup from "yup";
import Input from "../ui/form/Input";
import Notification from "../ui/surface/Notification";
import PrimaryButton from "../ui/button/PrimaryButton";


const Login = () => {
  const {signInWithEmailAndPassword, loading, user} = useAuth();
  const [error, setError] = useState<string>();
  const {push, prefetch} = useRouter();
  const {formatMessage} = useIntl();
  const f = id => formatMessage({id});

  useEffect(() => {
    if (prefetch) {
      prefetch('/signup');
    }
  }, [prefetch]);

  useEffect(() => {
    if (push && !loading && user) {
      push("/")
    }
  }, [user, loading, push])

  const handleSubmit = useCallback(
    (values, actions) => {
      if (signInWithEmailAndPassword) {
        signInWithEmailAndPassword(
          values.email,
          values.password
        )
          .then(() => push("/"))
          .catch((loginError) => setError(loginError.message));
      }
    },
    [signInWithEmailAndPassword]
  );

  return (
    <div>
      <Formik
        initialValues={{email: '', password: ''}}
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email(f('enterValidEmail'))
            .required(f('emailRequired')),
          password: Yup.string()
            .min(8, f('passwordMinLength'))
            .required(f('passwordRequired')),
        })}
      >
        {(props: FormikProps<any>) => (
          <Form className="form" autoComplete="on">
            <Field
              as={Input}
              label={f('emailAddress')}
              placeholder={f('emailAddress')}
              type="email"
              name="email"
              autoComplete="email"
              valid={!!props.errors.email}
              notification={props.errors.email}
              maxLength={100}
            />
            <Field
              as={Input}
              label={f('password')}
              placeholder={f('password')}
              type="password"
              name="password"
              autoComplete="password"
              valid={!!props.errors.password}
              notification={props.errors.password}
              maxLength={20}
            />
            {error && (
              <Notification>
                {error}
              </Notification>
            )}
            <PrimaryButton type="submit">{f('doLogin')}</PrimaryButton>
          </Form>
        )}
      </Formik>
      <style jsx>{
        `.form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }`}</style>
    </div>
  )
}
export default Login;