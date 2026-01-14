import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '../components/Header'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
