import React, { useState } from 'react'

import Background from '../components/ui/Background'
import Container from '../components/ui/Container'
import DangerButton from '../components/ui/DangerButton'
import Panel from '../components/ui/Panel'
import PrimaryButton from '../components/ui/PrimaryButton'
import SecondaryButton from '../components/ui/SecondaryButton'
import TertiaryButton from '../components/ui/TertiaryButton'
import HeadlineLink, {
    PrimaryHeadlineLink,
    SecondaryHeadlineLink,
} from '../components/ui/HeadlineLink'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Block from '../components/ui/Block'

const UI = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [longModalOpen, setLongModalOpen] = useState<boolean>(false)
    const [insideStage, setInsideStage] = useState<boolean>(false)

    return (
        <Background insideStage={insideStage}>
            <Container>
                <PrimaryButton onClick={() => setModalOpen(true)}>Click me</PrimaryButton>
                <SecondaryButton onClick={() => setModalOpen(true)}>Click me</SecondaryButton>
                <TertiaryButton onClick={() => setModalOpen(true)}>Click me</TertiaryButton>
                <DangerButton onClick={() => setLongModalOpen(true)}>Click me</DangerButton>
                <PrimaryButton disabled>Don&apos;t Click me</PrimaryButton>
                <SecondaryButton disabled>Don&apos;t Click me</SecondaryButton>
                <TertiaryButton disabled>Don&apos;t Click me</TertiaryButton>
                <DangerButton disabled>Click me</DangerButton>
            </Container>
            <Container>
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
                    <PrimaryButton onClick={() => setInsideStage((prev) => !prev)}>
                        Click me
                    </PrimaryButton>
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
                    <PrimaryButton>Click me</PrimaryButton>
                </Panel>

                <Panel level="level3">
                    <h1>Hello World</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </p>
                    <PrimaryButton>Click me</PrimaryButton>
                </Panel>

                <Panel level="level4">
                    <h1>Hello World</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </p>
                    <PrimaryButton>Click me</PrimaryButton>
                </Panel>

                <Panel level="level5">
                    <h1>Hello World</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </p>
                    <PrimaryButton>Click me</PrimaryButton>
                </Panel>

                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                    <h1>Modal title</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
                        voluptua. At vero eos et accusam et
                    </p>
                    <TertiaryButton onClick={() => setModalOpen(false)}>Cancel</TertiaryButton>
                    <PrimaryButton onClick={() => setModalOpen(false)}>Ok</PrimaryButton>
                </Modal>

                <Modal open={longModalOpen} onClose={() => setLongModalOpen(false)}>
                    <h1>Very long modal title</h1>
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
                    <PrimaryButton onClick={() => setLongModalOpen(false)}>Ok</PrimaryButton>
                </Modal>
            </Container>
        </Background>
    )
}
export default UI
