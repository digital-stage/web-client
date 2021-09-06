const LoadingCube = () => (
    <>
        <div className="cssload-thecube">
            <div className="cssload-cube cssload-c1" />
            <div className="cssload-cube cssload-c2" />
            <div className="cssload-cube cssload-c4" />
            <div className="cssload-cube cssload-c3" />
        </div>
        <style jsx>{`
            .cssload-thecube {
                display: block;
                width: 73px;
                height: 73px;
                margin: 0 auto;
                margin-top: 49px;
                margin-bottom: 49px;
                position: relative;
                transform: rotateZ(45deg);
            }
            .cssload-thecube .cssload-cube {
                position: relative;
                transform: rotateZ(45deg);
            }
            .cssload-thecube .cssload-cube {
                float: left;
                width: 50%;
                height: 50%;
                position: relative;
                transform: scale(1.1);
            }
            .cssload-thecube .cssload-cube:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: var(---primary);
                animation: cssload-fold-thecube 2.76s infinite linear both;
                transform-origin: 100% 100%;
            }
            .cssload-thecube .cssload-c2 {
                transform: scale(1.1) rotateZ(90deg);
            }
            .cssload-thecube .cssload-c3 {
                transform: scale(1.1) rotateZ(180deg);
            }
            .cssload-thecube .cssload-c4 {
                transform: scale(1.1) rotateZ(270deg);
            }
            .cssload-thecube .cssload-c2:before {
                animation-delay: 0.35s;
            }
            .cssload-thecube .cssload-c3:before {
                animation-delay: 0.69s;
            }
            .cssload-thecube .cssload-c4:before {
                animation-delay: 1.04s;
            }

            @keyframes cssload-fold-thecube {
                0%,
                10% {
                    transform: perspective(136px) rotateX(-180deg);
                    opacity: 0;
                }
                25%,
                75% {
                    transform: perspective(136px) rotateX(0deg);
                    opacity: 1;
                }
                90%,
                100% {
                    transform: perspective(136px) rotateY(180deg);
                    opacity: 0;
                }
            }
        `}</style>
    </>
)
export { LoadingCube }
