import { createTheme, ThemeProvider } from '@mui/material'
import React from 'react'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'
import 'styles.css'
import 'styles.scss'

const theme = createTheme({
  typography: {
    subtitle1: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#FFB200',
    },
    h2: {
      fontSize: 48,
      fontFamily: 'Noto Sans Mende Kikakui',
      color: '#FFFFFF',
    },
    body1: {
      fontWeight: 'bold',
      fontSize: 14,
      color: '#FFFFFF',
    },
    button: {
      fontStyle: 'italic',
    },
  },
})

const MyApp = ({ Component, pageProps }: any) => {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Hydrate>
    </QueryClientProvider>
  )
}

export default MyApp
