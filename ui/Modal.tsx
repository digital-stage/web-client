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

/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus,jsx-a11y/no-noninteractive-element-interactions */
import React, {ReactNode} from 'react'
import {Portal} from 'react-portal'
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock'
import {Backdrop} from './Backdrop'
import {useOpenState} from './useOpenState'
import {Panel} from './Panel'

interface SIZE {
  Default: 'default'
  Full: 'full'
  Small: 'small'
  Auto: 'auto'
}

const ModalHeader = ({children}: { children: React.ReactNode }) => {
  return <header>{children}</header>
}

const ModalButton = (
  {type, ...props}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) => {
  return (
    <div className="modal-button">
      <button type={type || "button"} {...props} />
    </div>
  )
}

const ModalFooter = ({children}: { children: React.ReactNode }) => {
  return <footer>{children}</footer>
}

const Modal = (
  {
    open,
    onClose,
    size,
    children,
    ...other
  }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    children: ReactNode
    size?: SIZE[keyof SIZE]
    open: boolean
    onClose: () => void
  }
): JSX.Element | null => {
  const backdropRef = React.useRef<HTMLDivElement>(null)
  const openState = useOpenState(open)
  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleTabKey = React.useCallback(e => {
    if (modalRef.current) {
      const focusableModalElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      if (focusableModalElements.length > 1) {
        const firstElement = focusableModalElements[0];
        const lastElement =
          focusableModalElements[focusableModalElements.length - 1];

        if (!e.shiftKey && document.activeElement !== firstElement) {
          firstElement.focus();
          return e.preventDefault();
        }

        if (e.shiftKey && document.activeElement !== lastElement) {
          lastElement.focus();
          e.preventDefault();
        }
      }
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      const keyListener = (e) => {
        switch (e.keyCode) {
          // Escape
          case 27: {
            return onClose()
          }
          // Tab
          case 9: {
            return handleTabKey(e)
          }
        }
      }
      const activeElement = document.activeElement
      document.addEventListener("keydown", keyListener);
      return () => {
        document.removeEventListener("keydown", keyListener)
        if (activeElement && activeElement instanceof HTMLElement) {
          activeElement.focus()
        }
      }
    }
  }, [open, onClose, handleTabKey]);

  React.useEffect(() => {
    if (backdropRef.current) {
      const target = backdropRef.current
      if (open) {
        disableBodyScroll(target)
        return () => {
          enableBodyScroll(target)
        }
      }
    }
    return undefined
  }, [backdropRef, open])

  if (openState !== 'closed') {
    return (
      <Portal>
        <Backdrop
          ref={backdropRef}
          onTouchStart={onClose}
          onMouseDown={onClose}
          open={openState}
          role="button"
        >
          <div
            className={`modal ${size} ${openState}`}
            ref={modalRef}
          >
            <div className="roomInner"
                 onTouchStart={(e) => {
                   e.stopPropagation()
                 }}
                 onMouseDown={(e) => {
                   e.stopPropagation()
                 }}
                 role="dialog">
              <Panel kind="white" {...other}>
                {children}
                <button className={`round close`} onClick={onClose}>
                  <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 1L5 5M1 9L5 5M5 5L1 1M5 5L9 9" strokeWidth="2"
                          strokeLinecap="round"/>
                  </svg>
                </button>
              </Panel>
            </div>
          </div>
        </Backdrop>
      </Portal>
    )
  }

  return null
}
Modal.defaultProps = {
  size: undefined,
}
export type {SIZE}
export {Modal, ModalHeader, ModalFooter, ModalButton}
