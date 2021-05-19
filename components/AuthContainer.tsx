import Image from 'next/image'
import Container from './ui/Container'
import Panel from './ui/Panel'
import Block from './ui/Block'

const AuthContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <Container width="narrow">
            <Block width={12} align="center" padding={4}>
                <Image src="/static/logo-full.svg" width={180} height={93} />
            </Block>
            <Panel>{children}</Panel>
        </Container>
    )
}
export default AuthContainer
