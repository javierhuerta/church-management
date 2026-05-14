import { OpenAPI } from '@/lib/api'

OpenAPI.BASE = '/api'

const stored = localStorage.getItem('token')
if (stored) {
  OpenAPI.TOKEN = stored
}
