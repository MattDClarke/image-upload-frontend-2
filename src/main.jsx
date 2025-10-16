import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://2ef5aec45f96232ca15997ab61944de1@o4506183415103488.ingest.us.sentry.io/4510199447158784",
  integrations: [Sentry.browserTracingIntegration()],
  // Capture 100% of spans. This is useful for development and debugging. Consider reducing in production or using traceSampler
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["http://localhost:3000", /^\/api\//],
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
