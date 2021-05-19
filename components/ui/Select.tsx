import React from "react";

const Select = (props: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>) =>
  <select {...props}/>;

export default Select;