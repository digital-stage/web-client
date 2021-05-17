import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LinkProps } from 'next/dist/client/link';
import styles from './HeadlineButton.module.css';

const PrimaryHeadlineLink = (
  props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> &
    LinkProps
): JSX.Element => {
  const { href, locale, as, replace, scroll, shallow, passHref, prefetch, className, ...other } =
    props;
  const { pathname } = useRouter();
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    if (pathname) {
      setActive(pathname.endsWith(href));
    }
  }, [href, pathname]);

  return (
    <Link
      href={href}
      locale={locale}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={passHref}
      prefetch={prefetch}
    >
      <a
        className={`${styles.button} ${styles.secondary} ${active && styles.active} ${className}`}
        {...other}
      />
    </Link>
  );
};

const SecondaryHeadlineLink = (
  props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> &
    LinkProps
): JSX.Element => {
  const { href, locale, as, replace, scroll, shallow, passHref, prefetch, className, ...other } =
    props;
  const { pathname } = useRouter();
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    if (pathname) {
      setActive(pathname.endsWith(href));
    }
  }, [href, pathname]);

  return (
    <Link
      href={href}
      locale={locale}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={passHref}
      prefetch={prefetch}
    >
      <a
        className={`${styles.button} ${styles.secondary} ${active && styles.active} ${className}`}
        {...other}
      />
    </Link>
  );
};

export { PrimaryHeadlineLink, SecondaryHeadlineLink };

export default PrimaryHeadlineLink;
