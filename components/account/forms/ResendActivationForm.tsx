import React, { useEffect, useState } from 'react';
import { Field, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { useAuth } from '@digitalstage/api-client-react';
import translateError from '../utils/translateError';
import Input from '../../../ui/form/Input';
import PrimaryButton from '../../../ui/button/PrimaryButton';
import Notification from '../../../ui/surface/Notification';
import AuthForm from '../../../ui/new/auth/AuthForm';

export interface Values {
  email: string;
}

const ResendActivationForm = (): JSX.Element => {
  const { push } = useRouter();
  const [message, setMessage] = useState<string>();
  const { loading, user, resendActivationLink } = useAuth();
  const { formatMessage } = useIntl();
  const f = (id) => formatMessage({ id });

  const Schema = Yup.object().shape({
    email: Yup.string().email(f('enterValidEmail')).required(f('emailRequired')),
  });

  useEffect(() => {
    if (!loading && user) {
      push('/');
    }
  }, [loading, user, push]);

  const notification = message ? <Notification>{message}</Notification> : null;

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      validationSchema={Schema}
      onSubmit={(values: Values, { resetForm }: FormikHelpers<Values>) => {
        setMessage(undefined);
        return resendActivationLink(values.email)
          .then(() => resetForm(null))
          .catch((err) => {
            setMessage(translateError(err));
          });
      }}
    >
      {({ errors, touched, handleReset, handleSubmit }) => (
        <AuthForm onReset={handleReset} onSubmit={handleSubmit}>
          <Field
            as={Input}
            id="email"
            label={f('emailAddress')}
            type="text"
            name="email"
            autocomplete="email"
            error={errors.email && touched.email}
          />
          {notification}
          <PrimaryButton type="submit">{f('send')}</PrimaryButton>
        </AuthForm>
      )}
    </Formik>
  );
};
export default ResendActivationForm;
