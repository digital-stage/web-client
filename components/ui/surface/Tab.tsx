import React from "react";

const Tab = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  title: string;
}): JSX.Element => {
  const {title, ...other} = props;

  return <div {...other}/>
}

export default Tab;
