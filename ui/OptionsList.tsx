import React from "react";

export interface KIND {
  default: undefined,
  sub: 'sub'
}

const OptionsListItem = ({as: is, children, kind, ...props}: { kind: KIND[keyof KIND], as?: React.DetailedReactHTMLElement<any, HTMLElement>, children: React.ReactNode } & any) => is ? React.cloneElement(is, {
  className: `${is.props?.className ||''} optionsListItem ${kind || ''}`,
  children: children,
  ...props
}) : <div className={`optionsListItem ${kind || ''}`} children={children} {...props}/>

const OptionsList = ({
                       className,
                       ...props
                     }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => <div
  className={`optionsList ${className || ''}`} {...props}/>

export {
  OptionsListItem
}
export default OptionsList