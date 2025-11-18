import type { Metadata } from 'next'
import './globals.css'
import { SymbolProvider } from '@/components/SymbolContext'

export const metadata: Metadata = {
  title: 'Trader View',
  description: 'Fast, professional stock terminal UI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SymbolProvider>{children}</SymbolProvider>
      </body>
    </html>
  )
}
