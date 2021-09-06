import React from "react";

export interface KIND {
  default: undefined,
  sub: 'sub'
}

const OptionsListItem = ({as: is, kind, ...props}: { kind: KIND[keyof KIND], as?: React.DetailedReactHTMLElement<any, HTMLElement>, children: React.ReactNode } & any) => is ? React.cloneElement(is, {
  className: `${is.props?.className ||''} optionsListItem ${kind || ''}`,
  ...props
}) : <div className={`optionsListItem ${kind || ''}`} {...props}/>

const OptionsList = ({
                       className,
                       ...props
                     }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => <div
  className={`optionsList ${className || ''}`} {...props}/>

export {
  OptionsListItem
}
export default OptionsList