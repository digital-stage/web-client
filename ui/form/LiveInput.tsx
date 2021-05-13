import Input from "./Input";
import React, {useEffect, useState} from "react";

const LiveInput = (
  props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement> & {
    onChange: (value: string) => void
    value?: string
    label: string
    error?: string
  }) => {
  const {value, onChange, ...other} = props;
  const [changed, setChanged] = useState<boolean>(false);
  const [actualValue, setActualValue] = useState<string>(value);

  useEffect(() => {
    setActualValue(value)
  }, [value])

  return (
    <Input
      value={actualValue}
      onChange={(event) => {
        setActualValue(event.currentTarget.value)
        setChanged(true)
      }}
      onBlur={() => {
        if (changed) {
          onChange(actualValue)
          setChanged(false)
        }
      }}
      {...other}
    />
  )
}
export default LiveInput