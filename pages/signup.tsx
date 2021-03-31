import {Input} from "baseui/input";
import React, {useCallback, useEffect, useState} from "react";
import {useIntl} from "react-intl";
import {Field, Form, Formik, FormikProps} from 'formik';
import {useAuth} from "@digitalStage/api-client-react";
import {useRouter} from "next/router";
import * as Yup from "yup";
import {styled} from "baseui";
import {Notification, KIND} from "baseui/notification";
import {Button} from "baseui/button";

const StyledForm = styled(Form, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

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
          <StyledForm autoComplete="on">
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
            <Field
              as={Input}
              label={f('displayName')}
              placeholder={f('displayName')}
              type="text"
              name="displayName"
              valid={!!props.errors.displayName}
              notification={props.errors.displayName}
              maxLength={30}
            />
            {error && (
              <Notification kind={KIND.negative}>
                {error}
              </Notification>
            )}
            <Button type="submit">{f('doSignUp')}</Button>
          </StyledForm>
        )}
      </Formik>
    </div>
  )
}
export default SignUp;