import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = new Set([
    '/',
    '/registreren',
    '/inloggen',
    '/wachtwoord-vergeten',
])

function isPublicRoute(pathname: string): boolean {
    if (publicRoutes.has(pathname)) return true
    if (pathname.startsWith('/auth')) return true
    if (pathname.startsWith('/api/auth')) return true
    if (pathname.startsWith('/api/cron')) return true
    if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true
    return false
}

function redirectToInloggen(request: NextRequest) {
    const url = request.nextUrl.clone()
    url.pathname = '/inloggen'
    return NextResponse.redirect(url)
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error(
            'Supabase environment variables ontbreken. Stel NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in.'
        )

        if (isPublicRoute(pathname)) {
            return NextResponse.next({ request })
        }

        return redirectToInloggen(request)
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                )
                supabaseResponse = NextResponse.next({
                    request,
                })
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                )
            },
        },
    })

    let user = null

    try {
        const { data } = await supabase.auth.getUser()
        user = data.user
    } catch (error) {
        console.error('Supabase auth check mislukt in middleware:', error)

        if (isPublicRoute(pathname)) {
            return supabaseResponse
        }

        return redirectToInloggen(request)
    }

    if (user && pathname === '/inloggen') {
        const url = request.nextUrl.clone()
        url.pathname = '/vandaag'
        return NextResponse.redirect(url)
    }

    if (!user && !isPublicRoute(pathname)) {
        return redirectToInloggen(request)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
