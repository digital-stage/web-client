import React, { DetailedHTMLProps, InputHTMLAttributes } from 'react'

const Radio = (props: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
    return (
        <input type="radio" {...props} />
    )
}
export default Radio
