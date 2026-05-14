import { OpenAPIConfig } from './core/OpenAPI'

export const config: OpenAPIConfig = {
  BASE: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  VERSION: '1.0',
  WITH_CREDENTIALS: false,
  CREDENTIALS: 'include',
}

export function configureOpenAPI(token?: string) {
  const { OpenAPI } = require('./core/OpenAPI')
  OpenAPI.BASE = config.BASE
  OpenAPI.TOKEN = token
}