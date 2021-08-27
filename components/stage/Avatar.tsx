import styles from './StageView.module.scss'
import React from 'react'

const Avatar = ({ name, color }: { name: string; color: string }) => (
    <div
        className={styles.avatar}
        style={{
            backgroundColor: color,
        }}
    >
        {name
            .split(' ')
            .filter((word, index) => index < 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join('')}
    </div>
)
const MemoizedAvatar = React.memo(Avatar)
export { MemoizedAvatar as Avatar }
