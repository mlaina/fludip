import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const publicRoutes = [
  '/', '/legal', '/s/', '/api/webhook', '/api/lisa',
  '/image', '/validation', '/auth/callback', '/auth/confirm',
  '/preview/*', '/my-story/*'
]


export async function middleware(req) {
  let res = NextResponse.next()
  const { pathname, searchParams } = req.nextUrl

  // 1️⃣ 👉 **Salir lo antes posible si la ruta es pública**
  const isPublicRoute = publicRoutes.some(route =>
      route.endsWith('/*')
          ? pathname.startsWith(route.slice(0, -2))
          : route === pathname
  )
  if (isPublicRoute) return res

  // 2️⃣ Servir imágenes directamente
  if (pathname.startsWith('/images')) return res

  // 3️⃣ Ignorar peticiones de Cloudflare Challenge
  if (searchParams.has('_cf_chl_tk')) {
    res = NextResponse.redirect(new URL('/', req.url), { status: 303 })
    res.headers.delete('x-middleware-set-cookie')
    return res
  }

  // 4️⃣ Permitir el callback de auth sin interrupciones
  if (pathname.startsWith('/auth/callback')) return res

  // 5️⃣ ⚙️ Inicializar Supabase e inspeccionar sesión
  const supabase = createMiddlewareClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()

  // 6️⃣ Redirigir a Home si no hay sesión (excepto Home mismo)
  if (!user && pathname !== '/') {
    res = NextResponse.redirect(new URL('/', req.url), { status: 303 })
    res.headers.delete('x-middleware-set-cookie')
    return res
  }

  // 7️⃣ Permitir /success y /api/* para usuarios logueados
  if (user && (pathname === '/success' || pathname.startsWith('/api/'))) {
    return res
  }

  // 8️⃣ [Opcional] lógica extra para `waitingAllowedRoutes`
  // ...

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|videos/).*)']
}
