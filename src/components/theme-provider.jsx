import { ThemeProvider as NextThemesProvider } from 'next-themes'

function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="tools-set-theme"
    >
      {children}
    </NextThemesProvider>
  )
}

export default ThemeProvider
