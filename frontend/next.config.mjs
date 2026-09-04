import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { loadEnvConfig } = require('@next/env')

// Repo root `.env` (shared) and `frontend/.env` (app-only).
loadEnvConfig(path.join(__dirname, '..'))
loadEnvConfig(__dirname)

/** ElevenLabs Agents — public agent id for the browser WebRTC client. */
const elevenLabsAgentId =
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || process.env.ELEVENLABS_AGENT_ID || ''

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
    NEXT_PUBLIC_ELEVENLABS_AGENT_ID: elevenLabsAgentId,
  },
}

export default nextConfig
