import { lookupIp, normalizeIpAddress } from './ip-lookup.js'

const CACHE_TTL_SECONDS = 24 * 60 * 60

const jsonResponse = (data, init = {}) => {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'no-referrer')

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  })
}

const errorResponse = (message, status, requestId) => (
  jsonResponse(
    {
      error: true,
      message,
      request_id: requestId,
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
)

const getRequestedIp = (request, url) => (
  url.searchParams.get('ip') || request.headers.get('CF-Connecting-IP') || ''
)

const createCacheKey = (request, ip) => {
  const url = new URL('/api/ip-lookup', request.url)
  url.searchParams.set('ip', ip)
  return new Request(url, { method: 'GET' })
}

const handleIpLookup = async (request, env, ctx) => {
  const requestId = crypto.randomUUID()
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    return errorResponse('仅支持 GET 请求', 405, requestId)
  }

  const parsedIp = normalizeIpAddress(getRequestedIp(request, url))
  if (!parsedIp) {
    return errorResponse('请输入有效的 IPv4 或 IPv6 地址', 400, requestId)
  }
  if (!parsedIp.isPublic) {
    return errorResponse('不支持查询私有或保留 IP 地址', 400, requestId)
  }

  const cache = caches.default
  const cacheKey = createCacheKey(request, parsedIp.address)
  const cachedResponse = await cache.match(cacheKey)
  if (cachedResponse) {
    console.debug(JSON.stringify({
      level: 'debug',
      event: 'ip_lookup_cache_hit',
      requestId,
      ipVersion: parsedIp.version,
    }))
    return cachedResponse
  }

  try {
    const result = await lookupIp({
      ip: parsedIp.address,
      version: parsedIp.version,
      amapKey: env.AMAP_WEB_SERVICE_KEY,
      requestId,
    })

    const response = jsonResponse(result, {
      headers: {
        'Cache-Control': `public, max-age=300, s-maxage=${CACHE_TTL_SECONDS}`,
      },
    })
    ctx.waitUntil(cache.put(cacheKey, response.clone()))

    console.debug(JSON.stringify({
      level: 'debug',
      event: 'ip_lookup_completed',
      requestId,
      ipVersion: parsedIp.version,
      locationSource: result.location_source,
      networkSource: result.network_source,
    }))

    return response
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      event: 'ip_lookup_failed',
      requestId,
      ipVersion: parsedIp.version,
      error: error instanceof Error ? error.message : String(error),
    }))
    return errorResponse('IP 查询服务暂时不可用，请稍后重试', 502, requestId)
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname === '/api/ip-lookup') {
      return handleIpLookup(request, env, ctx)
    }
    if (url.pathname.startsWith('/api/')) {
      return errorResponse('接口不存在', 404, crypto.randomUUID())
    }
    return env.ASSETS.fetch(request)
  },
}
