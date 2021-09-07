const LoadingShaft = () => (
    <>
        <div className="shaft-load">
            <div className="shaft1" />
            <div className="shaft2" />
            <div className="shaft3" />
            <div className="shaft4" />
            <div className="shaft5" />
            <div className="shaft6" />
            <div className="shaft7" />
            <div className="shaft8" />
            <div className="shaft9" />
            <div className="shaft10" />
        </div>
        <style jsx>{`
            .shaft-load {
                margin: 50px auto;
                width: 60px;
                height: 30px;
            }
            .shaft-load > div {
                background-color: var(--primary);
                float: left;
                height: 100%;
                width: 5px;
                margin-right: 1px;
                display: inline-block;
                animation: loading 1.5s infinite ease-in-out;
                transform: scaleY(0.05) translateX(-5px);
            }

            .shaft-load .shaft1 {
                animation-delay: 0.05s;
            }
            .shaft-load .shaft2 {
                animation-delay: 0.1s;
            }
            .shaft-load .shaft3 {
                animation-delay: 0.15s;
            }
            .shaft-load .shaft4 {
                animation-delay: 0.2s;
            }
            .shaft-load .shaft5 {
                animation-delay: 0.25s;
            }
            .shaft-load .shaft6 {
                animation-delay: 0.3s;
            }
            .shaft-load .shaft7 {
                animation-delay: 0.35s;
            }
            .shaft-load .shaft8 {
                animation-delay: 0.4s;
            }
            .shaft-load .shaft9 {
                animation-delay: 0.45s;
            }
            .shaft-load .shaft10 {
                animation-delay: 0.5s;
            }
            @keyframes loading {
                10% {
                    background: var(--primary);
                }
                15% {
                    transform: scaleY(1.2) translateX(10px);
                    background: #95c5c9;
                }
                90%,
                100% {
                    transform: scaleY(0.05) translateX(-5px);
                }
            }
        `}</style>
    </>
)
export { LoadingShaft }
