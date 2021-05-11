import React, {useCallback, useEffect, useState} from "react";
import {useIntl} from "react-intl";
import {Field, Form, Formik, FormikProps} from 'formik';
import {useAuth} from "@digitalstage/api-client-react";
import {useRouter} from "next/router";
import * as Yup from "yup";
import Input from "../ui/form/Input";
import PrimaryButton from "../ui/button/PrimaryButton";
import Notification from "../ui/surface/Notification";

const SignUp = () => {
  const {createUserWithEmailAndPassword, loading, user} = useAuth();
  const [error, setError] = useState<string>();
  const {push, prefetch} = useRouter();
  const {formatMessage} = useIntl();
  const f = id => formatMessage({id});

  useEffect(() => {
    if (prefetch) {
      prefetch('/login');
    }
  }, [prefetch]);

  useEffect(() => {
    if (push && !loading && user) {
      push("/")
    }
  }, [user, loading, push])

  const handleSubmit = useCallback(
    (values, actions) => {
      if (createUserWithEmailAndPassword) {
        createUserWithEmailAndPassword(
          values.email,
          values.password,
          values.displayName
        )
          .then(() => push("/"))
          .catch((err) => setError(err.message));
      }
    },
    [createUserWithEmailAndPassword]
  );

  return (
    <div>
      <Formik
        initialValues={{email: '', password: '', displayName: ''}}
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email(f('enterValidEmail'))
            .required(f('emailRequired')),
          password: Yup.string()
            .min(8, f('passwordMinLength'))
            .required(f('passwordRequired')),
          displayName: Yup.string()
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
              valid={!!props.errors.password}
              error={props.touched.password && props.errors.password}
              maxLength={20}
            />
            <Field
              as={Input}
              label={f('displayName')}
              placeholder={f('displayName')}
              type="text"
              name="displayName"
              valid={!!props.errors.displayName}
              error={props.touched.displayName && props.errors.displayName}
              maxLength={30}
            />
            {error && (
              <Notification>
                {error}
              </Notification>
            )}
            <PrimaryButton type="submit">{f('doSignUp')}</PrimaryButton>
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
export default SignUp;