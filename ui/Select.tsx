import React from 'react'
import styles from './Select.module.css'

const Select = (
    props: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
    // eslint-disable-next-line react/jsx-props-no-spreading
) => <select className={styles.select} {...props} />

export default Select
