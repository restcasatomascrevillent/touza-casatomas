import { createRoot } from 'react-dom/client'
import ErrorBoundary from './components/ui/error-boundary.tsx'
import App from './App.tsx'
import './index.css'

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

if ("serviceWorker" in navigator) {
    registerSW({ immediate: true });
}

createRoot(document.getElementById("root")!).render(
    <div className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </div>
);
