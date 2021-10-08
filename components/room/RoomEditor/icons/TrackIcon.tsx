import React from "react";

const TrackIcon = (props: React.SVGProps<SVGSVGElement>): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 500 500" {...props}>
        <path d="M 258.236 49.386 L 137.868 169.754 L 17.499 169.754 L 17.499 330.245 L 137.868 330.245 L 258.236 450.613 L 258.236 49.386 Z M 322.009 161.774 L 306.052 177.732 L 378.319 249.999 L 306.052 322.266 L 322.009 338.222 L 394.277 265.956 L 466.544 338.222 L 482.5 322.266 L 410.234 249.999 L 482.5 177.732 L 466.544 161.774 L 394.277 234.042 L 322.009 161.774 Z"
              transform="matrix(0, -1, 1, 0, 0.000008, 499.998993)"/>
    </svg>
)
export {TrackIcon}