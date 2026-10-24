// Server-only: never import from a 'use client' file (keeps ~50KB of page text out of the bundle).
import details from './details.json'
import type { Detail } from './services'

export const getDetail = (id: number): Detail | undefined => (details as Record<string, Detail>)[id]
