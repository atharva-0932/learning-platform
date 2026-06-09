import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { loadEnvConfig } = require('@next/env')

// Repo root `.env` (shared) and `frontend/.env` (app-only).
loadEnvConfig(path.join(__dirname, '..'))
loadEnvConfig(__dirname)

/** Vapi Web SDK needs the key in the browser; accept `VAPI_API_KEY` / `VAPI_ASSISTANT_ID` as aliases. */
const vapiPublicKey =
  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_VAPI_API_KEY ||
  process.env.VAPI_API_KEY ||
  process.env.VAPI_PUBLIC_KEY ||
  ''

const vapiAssistantId =
  process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || process.env.VAPI_ASSISTANT_ID || ''

const frontendDir = __dirname
const frontendNodeModules = path.join(frontendDir, 'node_modules')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo: repo root has package.json; keep resolution inside frontend/
  turbopack: {
    root: frontendDir,
    resolveAlias: {
      tailwindcss: path.join(frontendNodeModules, 'tailwindcss'),
      '@tailwindcss/postcss': path.join(frontendNodeModules, '@tailwindcss/postcss'),
    },
  },
  webpack: (config) => {
    config.resolve.modules = [
      frontendNodeModules,
      ...(config.resolve.modules ?? ['node_modules']),
    ]
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(frontendNodeModules, 'tailwindcss'),
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_VAPI_PUBLIC_KEY: vapiPublicKey,
    NEXT_PUBLIC_VAPI_ASSISTANT_ID: vapiAssistantId,
  },
}

export default nextConfig
