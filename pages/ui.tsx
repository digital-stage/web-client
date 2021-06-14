import React, { useState } from 'react'

import Image from 'next/image'
import { FaTrash } from 'react-icons/fa'
import Background from '../ui/Background'
import Container from '../components/ui/Container'
import Panel from '../components/ui/Panel'
import Button, { TertiaryButton } from '../ui/Button'
import HeadlineLink, { PrimaryHeadlineLink, SecondaryHeadlineLink } from '../ui/HeadlineLink'
import Modal, { ModalButton, ModalFooter, ModalHeader } from '../components/ui/Modal'
import Input from '../ui/Input'
import Block from '../components/ui/Block'
import Collapse from '../components/ui/Collapse'
import Paragraph from '../components/ui/Paragraph'

const UI = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [longModalOpen, setLongModalOpen] = useState<boolean>(false)
    const [insideStage, setInsideStage] = useState<boolean>(false)

    return (
        <Background insideStage={insideStage}>
            <Container>
                <Button onClick={() => setModalOpen(true)}>Click me</Button>
                <Button kind="secondary" onClick={() => setModalOpen(true)}>
                    Click me
                </Button>
                <Button kind="tertiary" onClick={() => setModalOpen(true)}>
                    Click me
                </Button>
                <Button kind="warn" onClick={() => setModalOpen(true)}>
                    Click me
                </Button>
                <Button kind="danger" onClick={() => setLongModalOpen(true)}>
                    Click me
                </Button>
                <Button disabled>Click me</Button>
                <Button disabled>Don&apos;t Click me</Button>
                <Button kind="secondary" disabled>
                    Click me
                </Button>
                <Button kind="tertiary" disabled>
                    Click me
                </Button>
                <TertiaryButton disabled>Don&apos;t Click me</TertiaryButton>
                <Button kind="danger" disabled>
                    Click me
                </Button>
                <Button kind="warn" disabled>
                    Click me
                </Button>
            </Container>
            <Container>
                <Panel level="level1">
                    <Collapse
                        icon={<Image width="30" height="30" src="/static/stage.svg" />}
                        title={<h3>TITLE</h3>}
                        actions={
                            <Block>
                                <FaTrash size={24} color="red" />
                                <FaTrash size={24} color="red" />
                                <FaTrash size={24} color="red" />
                            </Block>
                        }
                    >
                        CONTENT
                    </Collapse>
                    <Collapse
                        icon={<Image width="30" height="30" src="/static/stage.svg" />}
                        title={<h3>TITLE</h3>}
                        actions={
                            <Block>
                                <FaTrash size={24} color="red" />
                                <FaTrash size={24} color="red" />
                                <FaTrash size={24} color="red" />
                            </Block>
                        }
                    >
                        CONTENT
                    </Collapse>
                    <Collapse
                        icon={<Image width="30" height="30" src="/static/stage.svg" />}
                        title={<h3>TITLE</h3>}
                        actions={
                            <Block>
                                <FaTrash size={24} color="red" />
                                <FaTrash size={24} color="red" />
                                <FaTrash size={24} color="red" />
                            </Block>
                        }
                    >
                        CONTENT
                    </Collapse>
                </Panel>

                <Panel level="level1">
                    <Block>
                        <Block width={[6, 0]} padding={3}>
                            HIDDEN ON DESKTOP
                        </Block>
                        <Block width={[0, 6]} padding={[2, 3]}>
                            HIDDEN ON MOBILE
                        </Block>
                        <Block width={6} paddingLeft={[2, 5]}>
                            VISIBLE EVERYWHERE
                        </Block>
                    </Block>
                    <Block>
                        <Block width={[12, 6]} align="stretch">
                            <PrimaryHeadlineLink href="/ui#1" title="Bla">
                                Hello Tab 1
                            </PrimaryHeadlineLink>
                        </Block>
                        <Block width={[12, 6]} align="stretch">
                            <SecondaryHeadlineLink href="/ui#2" title="Blubb">
                                Hello Tab 2
                            </SecondaryHeadlineLink>
                        </Block>
                        <Block width={[12, 6]} align="center">
                            <SecondaryHeadlineLink href="/ui#3" title="Blubb">
                                Hello Tab 3
                            </SecondaryHeadlineLink>
                        </Block>
                        <Block width={[12, 6]} align="end">
                            <SecondaryHeadlineLink href="/ui#4" title="Blubb">
                                Hello Tab 4
                            </SecondaryHeadlineLink>
                        </Block>
                    </Block>
                    <Block align="center">
                        <h1>Hello World</h1>
                    </Block>
                    <Block>
                        <p>
                            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                            eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                            voluptua. At vero eos et accusam et
                        </p>
                    </Block>
                    <Button onClick={() => setInsideStage((prev) => !prev)}>Click me</Button>
                </Panel>

                <Panel level="level2">
                    <div className="headline-link-row">
                        <HeadlineLink href="/login">
                            <h2>Login</h2>
                        </HeadlineLink>
                        <HeadlineLink href="/ui">
                            <h2>Sign up</h2>
                        </HeadlineLink>
                    </div>
                    <h1>Hello World</h1>
                    <Input label="Email Adresse" type="email" />
                    <Input label="Passwort" type="password" />
                    <Input label="Nummer" type="number" />
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </p>
                    <Button>Click me</Button>
                </Panel>

                <Panel level="level3">
                    <h1>Hello World</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </p>
                    <Button>Click me</Button>
                </Panel>

                <Panel level="level4">
                    <h1>Hello World</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </p>
                    <Button>Click me</Button>
                </Panel>

                <Panel level="level5">
                    <h1>Hello World</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </p>
                    <Button>Click me</Button>
                </Panel>

                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                    <ModalHeader>
                        <h1>Modal title</h1>
                    </ModalHeader>
                    <Paragraph kind="micro">
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </Paragraph>
                    <ModalFooter>
                        <ModalButton kind="tertiary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </ModalButton>
                        <ModalButton onClick={() => setModalOpen(false)}>Ok</ModalButton>
                    </ModalFooter>
                </Modal>

                <Modal open={longModalOpen} onClose={() => setLongModalOpen(false)}>
                    <h1>Very long modal title</h1>
                    <Paragraph>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </Paragraph>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
                        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
                        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                        amet.
                    </p>
                    <TertiaryButton onClick={() => setLongModalOpen(false)}>Cancel</TertiaryButton>
                    <Button onClick={() => setLongModalOpen(false)}>Ok</Button>
                </Modal>
            </Container>
        </Background>
    )
}
export default UI
