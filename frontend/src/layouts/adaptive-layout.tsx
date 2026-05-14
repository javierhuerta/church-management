import { AppLayout } from './app-layout'
import { PublicLayout } from './public-layout'

export function AdaptiveLayout() {
  const isLoggedIn = !!localStorage.getItem('token')
  return isLoggedIn ? <AppLayout /> : <PublicLayout />
}
