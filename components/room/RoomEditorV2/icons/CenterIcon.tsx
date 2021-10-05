import React from "react";

const CenterIcon = (props: React.SVGProps<SVGSVGElement>): JSX.Element => (
    <svg viewBox="0 0 160 169" xmlns="http://www.w3.org/2000/svg" {...props}>
        <text fontWeight="600" fontFamily="Poppins-SemiBold, Poppins" fontSize="18" fill="#f4f4f4"
              id="x">
            <tspan id="svg_1" y="110" x="0">x</tspan>
        </text>
        <rect x="76.72602" y="9" fill="#41bd64" height="160" width="5" id="Rechteck_2145"/>
        <rect transform="rotate(90 160 87)" x="160" y="87" fill="#f0c11b" height="160" width="5" id="Rechteck_2162"/>
        <circle fill="#fff" r="20" cy="89.00003" cx="79.99999" id="Ellipse_680"/>
        <rect x="43" y="81.00003" fill="#fff" rx="10" height="20" width="72" id="Rechteck_2144"/>
        <ellipse fill="#fff" ry="6" rx="5.5" cy="71.00003" cx="80.5" id="Ellipse_681"/>
        <text x="87" y="0" fontWeight="600" fontFamily="Poppins-SemiBold, Poppins" fontSize="18" fill="#f4f4f4"
              id="y">
            <tspan id="svg_2" y="20" x="86">y</tspan>
        </text>
    </svg>
)
export {CenterIcon}