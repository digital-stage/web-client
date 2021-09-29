/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
