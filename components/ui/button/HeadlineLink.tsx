import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import {LinkProps} from "next/dist/client/link";

const HeadlineLink = (props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> &
  LinkProps): JSX.Element => {
  const {href, locale, as, replace, scroll, shallow, passHref, prefetch, className, ...other} = props;
  const {pathname} = useRouter();
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    if (pathname) {
      setActive(pathname.endsWith(href))
    }
  }, [href, pathname])

  return (
    <>
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
        <a className={(className || "") + (active ? " active" : "")} {...other}/>
      </Link>
      <style jsx>{`
        a {
          flex-grow: 1;
          text-align: center;
          display: inline-block;
          border-bottom-width: 2px;
          border-bottom-style: solid;
          border-bottom-color: transparent;
          transition-duration: 200ms;
          transition-property: border-color;
          transition-timing-function: cubic-bezier(0, 0, 1, 1);
        }
        a:hover {
          border-bottom-color: var(---tab-secondary-border, #F20544);
        }
        .active {
          border-bottom-color: var(---tab-secondary-border, #F20544);
        }
      `}</style>
    </>
  )
}
export default HeadlineLink
