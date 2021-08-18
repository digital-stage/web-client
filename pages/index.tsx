import Head from 'next/head'
import Container, { SIZE } from '../ui/Container'

const Index = () => {
    return (
        <Container size={SIZE.small}>
            <Head>
                <title>Welcome to Digital Stage</title>
                <meta name="description" content="Digital Stage" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>
                <h1>HOMEPAGE</h1>
            </div>
        </Container>
    )
}
export default Index
