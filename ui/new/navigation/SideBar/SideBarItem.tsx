import {UrlObject} from "url";
import * as React from "react";
import {useRouter} from "next/router";
import Link from "next/link";

const SideBarItem = (props: {
  href: string | UrlObject;
  target?: string;
  children: React.ReactNode
}): JSX.Element => {
  const {target, href, children} = props;
  const {pathname} = useRouter();
  return (
    <>
      <Link href={href} passHref>
        <a target={target}>
          {children}
        </a>
      </Link>
      <style jsx>{`
      a {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 8px;
        padding-bottom: 8px;
        outline: none;
        cursor: pointer;
        transition-property: text-shadow, background;
        transition-duration: 200ms;
        transition-timing-function: cubic-bezier(0.2, 0.8, 0.4, 1);
        width: 100%;  
        text-align: center;
      }
      a:hover {
          text-shadow: 0 0 10px #fff;
      }
    `}</style>
      <style jsx>{`
      a {
        background-color: ${!target && href === pathname ? 'transparent' : 'var(---level-1, #121212)'};
      }
      `}
      </style>
    </>
  )
}
export default SideBarItem;
