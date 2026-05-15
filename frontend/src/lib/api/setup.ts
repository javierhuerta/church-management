import { OpenAPI } from '@/lib/api'

OpenAPI.BASE = ''
OpenAPI.TOKEN = () => localStorage.getItem('token') ?? undefined
