import * as React from 'react';
import { useIntl } from 'react-intl';
import AuthNavigationComponent from "../../ui/new/auth/AuthNavigation"
import AuthNavigationItem from "../../ui/new/auth/AuthNavigation/AuthNavigationItem";

const AuthNavigation = (): JSX.Element => {
  const { formatMessage } = useIntl();
  const f = (id) => formatMessage({ id });

  return (
    <AuthNavigationComponent>
      <AuthNavigationItem href="/account/login">
        {f('login')}
      </AuthNavigationItem>
      <AuthNavigationItem href="/account/signup">
        {f('signUp')}
      </AuthNavigationItem>
    </AuthNavigationComponent>
  );
};

export default AuthNavigation;
