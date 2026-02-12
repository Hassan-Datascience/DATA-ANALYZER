import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { DataProvider } from './context/DataContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

/**
 * FIXED MAIN.TSX
 * Ensuring correct QueryClient initialization and root mounting with DataProvider and ErrorBoundary.
 */

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

const rootElement = document.getElementById('root')

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <DataProvider>
                        <App />
                    </DataProvider>
                </QueryClientProvider>
            </ErrorBoundary>
        </React.StrictMode>
    )
}
