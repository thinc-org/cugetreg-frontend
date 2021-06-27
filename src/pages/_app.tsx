import { AppProps } from 'next/dist/next-server/lib/router/router'
import { ThemeProvider, CssBaseline, useMediaQuery, Button, Snackbar, Alert } from '@material-ui/core'
import Head from 'next/head'

import '@/styles/globals.css'
import '@/i18n'
import { darkTheme, lightTheme } from '@/configs/theme'
import { TopBar } from '@/components/TopBar'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/Container'
import { ShoppingCartModal } from '@/components/ShoppingCartModal'
import env from '@/utils/env/macro'

import { ApolloProvider } from '@apollo/client'
import { client } from '@/utils/network/apollo'
import { syncWithLocalStorage } from '@/utils/localstorage'
import useApp from '@/hooks/useApp'
import { useDisclosure } from '@/context/ShoppingCartModal/hooks'
import { mobxConfiguration } from '@/configs/mobx'

import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'

import { useEffect } from 'react'
import { loadGAPI, startGDriveSync } from '@/utils/network/gDriveSync'
import { reaction, runInAction } from 'mobx'
import { gDriveStore, GDriveSyncState } from '@/store/gDriveState'

import { ShoppingCartModalProvider } from '@/context/ShoppingCartModal'
import { SnackbarContextProvider } from '@/context/Snackbar'
import { useSnackBar } from '@/context/Snackbar/hooks'
import styled from '@emotion/styled'
import { authStore } from '@/store/meStore'
import { collectLogEvent } from '@/utils/network/logging'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { courseCartStore } from '@/store'

mobxConfiguration()

const ToastAlert = styled(Alert)`
  div:last-child {
    padding: ${({ theme }) => theme.spacing(0, 0, 0, 2)};
  }
`

function MyApp({ Component, pageProps, forceDark, router }: AppProps) {
  const prefersDarkMode =
    env.features.darkTheme &&
    // features.darkTheme is a constant
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMediaQuery('(prefers-color-scheme: dark)', {
      noSsr: true,
    })

  useApp()

  // Retoring AuthStore and Syncing coursecart
  useEffect(() => {
    if (typeof window === 'undefined') return //Don't sync on the server

    reaction(
      () => ({
        isLoggedIn: authStore.isLoggedIn,
        cart: [...courseCartStore.shopItems],
        cartInitLocal: courseCartStore.isInitializedLocal,
      }),
      (d) => {
        if (!d.isLoggedIn) {
          syncWithLocalStorage(d.cart, d.cartInitLocal)
        }
      },
      { fireImmediately: true, delay: 1000 }
    )

    collectLogEvent({
      kind: 'track',
      message: 'user visit site',
    })

    authStore.tryRestoreWithLocalStorage()
    loadGAPI()
      .then(startGDriveSync)
      .catch((e) => {
        console.error('[GDRIVE] Error while starting drive sync', e)
        runInAction(() => {
          gDriveStore.gDriveState = GDriveSyncState.FAIL
        })
      })
  }, [])

  useEffect(() => {
    collectLogEvent({
      kind: 'track',
      message: `user change path`,
      detail: `${location.origin}-${router.pathname}`,
    })
  }, [router.pathname])
  const { message, emitMessage, action: actionText, open, close, isWarning } = useSnackBar()
  const disclosureValue = useDisclosure()
  const handleClose = (_: unknown, reason: string) => {
    if (reason === 'clickaway') {
      return
    }
    close()
  }

  const value = { message, emitMessage, action: actionText }

  return (
    <>
      <Head>
        <title>CU Get Reg</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ApolloProvider client={client}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarContextProvider value={value}>
            <ShoppingCartModalProvider value={disclosureValue}>
              <ThemeProvider theme={prefersDarkMode || forceDark ? darkTheme : lightTheme}>
                <CssBaseline />
                <TopBar />
                <Container>
                  <ErrorBoundary>
                    <Component {...pageProps} />
                  </ErrorBoundary>
                </Container>
                <Footer />
                <Snackbar
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  onClose={handleClose}
                  autoHideDuration={6000}
                  open={open}
                >
                  <ToastAlert
                    severity={isWarning ? 'warning' : 'success'}
                    action={
                      actionText ? (
                        <Button size="small" color="inherit" onClick={disclosureValue.onOpen}>
                          {actionText}
                        </Button>
                      ) : null
                    }
                  >
                    {message}
                  </ToastAlert>
                </Snackbar>
                <ShoppingCartModal />
              </ThemeProvider>
            </ShoppingCartModalProvider>
          </SnackbarContextProvider>
        </LocalizationProvider>
      </ApolloProvider>
    </>
  )
}

export default MyApp
