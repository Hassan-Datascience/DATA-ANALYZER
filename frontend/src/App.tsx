import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Nodes = lazy(() => import('./pages/Nodes'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Storage = lazy(() => import('./pages/Storage'))
const Vault = lazy(() => import('./pages/Vault'))
const Config = lazy(() => import('./pages/Config'))

const LoadingScreen = () => (
    <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-spring-green/20 border-t-spring-green rounded-full animate-spin shadow-[0_0_15px_rgba(0,255,102,0.2)]"></div>
        <span className="text-spring-green font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Establishing_Data_Link...</span>
    </div>
)

const App: React.FC = () => {
    return (
        <Router>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/nodes" element={<Nodes />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/storage" element={<Storage />} />
                    <Route path="/vault" element={<Vault />} />
                    <Route path="/config" element={<Config />} />

                    {/* Default redirect to Dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Suspense>
        </Router>
    )
}

export default App
