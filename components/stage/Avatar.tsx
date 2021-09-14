import React from 'react'

const Avatar = ({ name, color, active }: { name: string; color: string; active?: boolean }) => (
    <div
        className={`avatar ${active ? 'active' : ''}`}
        style={{
            backgroundColor: color,
        }}
        onClick={() => {
            throw new Error("TEST")
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
