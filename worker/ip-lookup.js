const MAX_PROVIDER_RESPONSE_BYTES = 32 * 1024
const PROVIDER_TIMEOUT_MS = 5_000

const PRIVATE_OR_RESERVED_IPV4_RANGES = [
  [[0, 0, 0, 0], 8],
  [[10, 0, 0, 0], 8],
  [[100, 64, 0, 0], 10],
  [[127, 0, 0, 0], 8],
  [[169, 254, 0, 0], 16],
  [[172, 16, 0, 0], 12],
  [[192, 0, 0, 0], 24],
  [[192, 0, 2, 0], 24],
  [[192, 168, 0, 0], 16],
  [[198, 18, 0, 0], 15],
  [[198, 51, 100, 0], 24],
  [[203, 0, 113, 0], 24],
  [[224, 0, 0, 0], 4],
]

const stringValue = (value) => (
  typeof value === 'string' && value.trim() ? value.trim() : ''
)

const ipv4ToNumber = (octets) => (
  octets.reduce((result, octet) => ((result << 8) | octet) >>> 0, 0)
)

const isInCidr = (octets, networkOctets, prefixLength) => {
  const address = ipv4ToNumber(octets)
  const network = ipv4ToNumber(networkOctets)
  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0
  return (address & mask) === (network & mask)
}

const parseIPv4 = (value) => {
  const parts = value.split('.')
  if (parts.length !== 4) return null

  const octets = parts.map((part) => {
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return Number.NaN
    return Number(part)
  })

  if (octets.some((octet) => !Number.isInteger(octet) || octet > 255)) {
    return null
  }

  return octets
}

const isIPv6 = (value) => {
  if (!value.includes(':') || value.includes('%')) return false
  if ((value.match(/::/g) || []).length > 1) return false

  const [left = '', right = ''] = value.split('::')
  const parseGroups = (section) => {
    if (!section) return []
    const groups = section.split(':')
    if (groups.some((group) => !/^[\da-f]{1,4}$/i.test(group))) return null
    return groups
  }

  const leftGroups = parseGroups(left)
  const rightGroups = parseGroups(right)
  if (!leftGroups || !rightGroups) return false

  const groupCount = leftGroups.length + rightGroups.length
  return value.includes('::') ? groupCount < 8 : groupCount === 8
}

export const normalizeIpAddress = (value) => {
  const candidate = stringValue(value)
  const ipv4 = parseIPv4(candidate)

  if (ipv4) {
    const isReserved = PRIVATE_OR_RESERVED_IPV4_RANGES.some(
      ([network, prefixLength]) => isInCidr(ipv4, network, prefixLength),
    )

    return {
      address: ipv4.join('.'),
      version: 4,
      isPublic: !isReserved,
    }
  }

  if (isIPv6(candidate)) {
    const normalized = candidate.toLowerCase()
    const isPublic = normalized !== '::' &&
      normalized !== '::1' &&
      !normalized.startsWith('fc') &&
      !normalized.startsWith('fd') &&
      !normalized.startsWith('fe8') &&
      !normalized.startsWith('fe9') &&
      !normalized.startsWith('fea') &&
      !normalized.startsWith('feb')

    return {
      address: normalized,
      version: 6,
      isPublic,
    }
  }

  return null
}

const readJsonResponse = async (response) => {
  if (!response.body) {
    throw new Error('服务商返回了空响应')
  }

  const reader = response.body.getReader()
  const chunks = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    totalBytes += value.byteLength
    if (totalBytes > MAX_PROVIDER_RESPONSE_BYTES) {
      await reader.cancel()
      throw new Error('服务商响应超过大小限制')
    }
    chunks.push(value)
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return JSON.parse(new TextDecoder().decode(body))
  } catch {
    throw new Error('服务商返回了无效 JSON')
  }
}

const fetchProviderJson = async (url, providerName) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'tools-set-ip-lookup/1.0',
    },
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`${providerName} 请求失败 (${response.status})`)
  }

  return readJsonResponse(response)
}

export const normalizeAmapLocation = (data) => {
  if (
    data?.status !== '1' ||
    data?.infocode !== '10000' ||
    !stringValue(data.province)
  ) {
    return null
  }

  const region = stringValue(data.province)
  const city = stringValue(data.city)
  if (region === '局域网') return null

  return {
    country_name: '中国',
    country_code: 'CN',
    region,
    city,
    adcode: stringValue(data.adcode),
    rectangle: stringValue(data.rectangle),
    timezone: 'Asia/Shanghai',
    country_calling_code: '+86',
    currency: 'CNY',
    currency_name: '人民币',
    country_tld: '.cn',
    languages: 'zh-CN',
  }
}

const normalizeIpApiResult = (data) => {
  if (data?.error) {
    throw new Error(stringValue(data.reason) || 'ipapi.co 查询失败')
  }

  return {
    ip: stringValue(data?.ip),
    country_name: stringValue(data?.country_name),
    country_code: stringValue(data?.country_code),
    region: stringValue(data?.region),
    city: stringValue(data?.city),
    postal: stringValue(data?.postal),
    latitude: data?.latitude ?? null,
    longitude: data?.longitude ?? null,
    timezone: stringValue(data?.timezone),
    org: stringValue(data?.org),
    asn: stringValue(data?.asn),
    network: stringValue(data?.network),
    version: stringValue(data?.version),
    country_capital: stringValue(data?.country_capital),
    currency_name: stringValue(data?.currency_name),
    currency: stringValue(data?.currency),
    country_calling_code: stringValue(data?.country_calling_code),
    languages: stringValue(data?.languages),
    country_tld: stringValue(data?.country_tld),
  }
}

export const mergeLookupResults = ({ ip, ipVersion, amap, ipApi }) => {
  const networkInfo = ipApi ? normalizeIpApiResult(ipApi) : {}

  if (amap) {
    return {
      ...networkInfo,
      ...amap,
      ip,
      version: networkInfo.version || `IPv${ipVersion}`,
      location_source: '高德地图',
      network_source: ipApi ? 'ipapi.co' : '',
    }
  }

  if (ipApi) {
    return {
      ...networkInfo,
      ip,
      version: networkInfo.version || `IPv${ipVersion}`,
      location_source: 'ipapi.co',
      network_source: 'ipapi.co',
      location_warning: ipVersion === 4
        ? '高德未返回有效位置，当前显示备用数据库结果。'
        : '高德 IP 定位仅支持国内 IPv4，当前显示备用数据库结果。',
    }
  }

  return null
}

const lookupAmap = async (ip, key) => {
  if (!key) {
    throw new Error('未配置高德 Web 服务 Key')
  }

  const url = new URL('https://restapi.amap.com/v3/ip')
  url.searchParams.set('ip', ip)
  url.searchParams.set('output', 'json')
  url.searchParams.set('key', key)

  const data = await fetchProviderJson(url, '高德地图')
  if (data?.status !== '1') {
    throw new Error(`高德地图查询失败 (${stringValue(data?.info) || '未知错误'})`)
  }
  return normalizeAmapLocation(data)
}

const lookupIpApi = async (ip) => {
  const url = new URL(`https://ipapi.co/${encodeURIComponent(ip)}/json/`)
  const data = await fetchProviderJson(url, 'ipapi.co')
  normalizeIpApiResult(data)
  return data
}

const settledValue = (outcome) => (
  outcome.status === 'fulfilled' ? outcome.value : null
)

const errorMessage = (outcome) => (
  outcome.status === 'rejected'
    ? outcome.reason instanceof Error
      ? outcome.reason.message
      : String(outcome.reason)
    : ''
)

export const lookupIp = async ({ ip, version, amapKey, requestId }) => {
  const lookups = version === 4
    ? [lookupAmap(ip, amapKey), lookupIpApi(ip)]
    : [Promise.resolve(null), lookupIpApi(ip)]

  const [amapOutcome, ipApiOutcome] = await Promise.allSettled(lookups)
  const amap = settledValue(amapOutcome)
  const ipApi = settledValue(ipApiOutcome)

  if (amapOutcome.status === 'rejected') {
    console.error(JSON.stringify({
      level: 'error',
      event: 'amap_lookup_failed',
      requestId,
      error: errorMessage(amapOutcome),
    }))
  }

  if (ipApiOutcome.status === 'rejected') {
    console.error(JSON.stringify({
      level: 'error',
      event: 'ipapi_lookup_failed',
      requestId,
      error: errorMessage(ipApiOutcome),
    }))
  }

  const result = mergeLookupResults({
    ip,
    ipVersion: version,
    amap,
    ipApi,
  })

  if (!result) {
    throw new Error('所有 IP 查询服务暂时不可用')
  }

  return result
}
