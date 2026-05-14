import { OpenAPI } from '@/lib/api'

OpenAPI.BASE = ''

const stored = localStorage.getItem('token')
if (stored) {
  OpenAPI.TOKEN = stored
}
