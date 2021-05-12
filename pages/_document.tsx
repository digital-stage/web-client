import Document, {Html, Head, Main, NextScript} from 'next/document'

class DigitalStageDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return {...initialProps}
  }

  render() {
    return (
      <Html>
        <Head>
          <title>Digital Stage</title>
          <link href="/static/fonts/fonts.css" rel="stylesheet"/>
          <meta name="viewport" content="initial-scale=1.0, width=device-width, shrink-to-fit=no"/>
        </Head>
        <body>
        <Main/>
        <NextScript/>
        </body>
      </Html>
    )
  }
}

export default DigitalStageDocument