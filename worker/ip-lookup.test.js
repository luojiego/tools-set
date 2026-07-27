import assert from 'node:assert/strict'
import test from 'node:test'
import {
  lookupIp,
  mergeLookupResults,
  normalizeAmapLocation,
  normalizeCloudflareLocation,
  normalizeIpAddress,
} from './ip-lookup.js'

test('normalizes public IPv4 addresses', () => {
  assert.deepEqual(normalizeIpAddress(' 106.36.192.6 '), {
    address: '106.36.192.6',
    version: 4,
    isPublic: true,
  })
})

test('rejects malformed and identifies private IPv4 addresses', () => {
  assert.equal(normalizeIpAddress('106.36.192.999'), null)
  assert.deepEqual(normalizeIpAddress('192.168.1.1'), {
    address: '192.168.1.1',
    version: 4,
    isPublic: false,
  })
})

test('normalizes valid IPv6 addresses', () => {
  assert.deepEqual(normalizeIpAddress('240E::1'), {
    address: '240e::1',
    version: 6,
    isPublic: true,
  })
  assert.equal(normalizeIpAddress('240e:::1'), null)
})

test('normalizes a successful Amap response', () => {
  assert.deepEqual(
    normalizeAmapLocation({
      status: '1',
      infocode: '10000',
      province: '陕西省',
      city: '西安市',
      adcode: '610100',
      rectangle: '108.7,33.7;109.8,34.8',
    }),
    {
      country_name: '中国',
      country_code: 'CN',
      region: '陕西省',
      city: '西安市',
      adcode: '610100',
      rectangle: '108.7,33.7;109.8,34.8',
      timezone: 'Asia/Shanghai',
      country_calling_code: '+86',
      currency: 'CNY',
      currency_name: '人民币',
      country_tld: '.cn',
      languages: 'zh-CN',
    },
  )
})

test('keeps Amap location when provider results disagree', () => {
  const result = mergeLookupResults({
    ip: '106.36.192.6',
    ipVersion: 4,
    amap: {
      country_name: '中国',
      country_code: 'CN',
      region: '陕西省',
      city: '西安市',
    },
    ipApi: {
      ip: '106.36.192.6',
      country_name: 'China',
      country_code: 'CN',
      region: 'Hunan',
      city: 'Changsha',
      org: 'CHINANET-HN',
      version: 'IPv4',
    },
  })

  assert.equal(result.region, '陕西省')
  assert.equal(result.city, '西安市')
  assert.equal(result.org, 'CHINANET-HN')
  assert.equal(result.location_source, '高德地图')
  assert.equal(result.network_source, 'ipapi.co')
})

test('returns Amap location when the network provider is unavailable', () => {
  const result = mergeLookupResults({
    ip: '106.36.192.6',
    ipVersion: 4,
    amap: {
      country_name: '中国',
      country_code: 'CN',
      region: '陕西省',
      city: '西安市',
    },
    ipApi: null,
  })

  assert.equal(result.region, '陕西省')
  assert.equal(result.city, '西安市')
  assert.equal(result.location_source, '高德地图')
  assert.equal(result.network_source, '')
})

test('keeps a successful Amap result when ipapi.co is rate limited', async () => {
  const originalFetch = globalThis.fetch
  const originalConsoleError = console.error

  globalThis.fetch = async (url) => {
    const hostname = new URL(url).hostname
    const body = hostname === 'restapi.amap.com'
      ? {
          status: '1',
          infocode: '10000',
          province: '陕西省',
          city: '西安市',
          adcode: '610100',
          rectangle: '108.7,33.7;109.8,34.8',
        }
      : {
          error: true,
          reason: 'RateLimited',
        }

    return new Response(JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  console.error = () => {}

  try {
    const result = await lookupIp({
      ip: '106.36.192.6',
      version: 4,
      amapKey: 'test-key',
      requestId: 'test-request',
    })

    assert.equal(result.region, '陕西省')
    assert.equal(result.city, '西安市')
    assert.equal(result.location_source, '高德地图')
    assert.equal(result.network_source, '')
  } finally {
    globalThis.fetch = originalFetch
    console.error = originalConsoleError
  }
})

test('normalizes Cloudflare request metadata', () => {
  const result = normalizeCloudflareLocation({
    country: 'US',
    region: 'California',
    city: 'Los Angeles',
    postalCode: '90013',
    latitude: '34.05223',
    longitude: '-118.24368',
    timezone: 'America/Los_Angeles',
    asn: 21859,
    asOrganization: 'Example Network',
  })

  assert.equal(result.country_code, 'US')
  assert.equal(result.country_name, '美国')
  assert.equal(result.region, 'California')
  assert.equal(result.city, 'Los Angeles')
  assert.equal(result.asn, 'AS21859')
  assert.equal(result.org, 'Example Network')
})

test('uses Cloudflare metadata for the current IPv6 without calling a provider', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => {
    throw new Error('不应调用外部查询服务')
  }

  try {
    const result = await lookupIp({
      ip: '2001:4860:4860::8888',
      version: 6,
      amapKey: 'test-key',
      requestId: 'test-request',
      cloudflare: {
        country: 'US',
        region: 'California',
        city: 'Los Angeles',
        timezone: 'America/Los_Angeles',
        asn: 15169,
        asOrganization: 'Google LLC',
      },
    })

    assert.equal(result.version, 'IPv6')
    assert.equal(result.country_code, 'US')
    assert.equal(result.city, 'Los Angeles')
    assert.equal(result.location_source, 'Cloudflare')
    assert.equal(result.network_source, 'Cloudflare')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('keeps Amap location and supplements network details from Cloudflare', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({
    status: '1',
    infocode: '10000',
    province: '陕西省',
    city: '西安市',
    adcode: '610100',
    rectangle: '108.7,33.7;109.8,34.8',
  }))

  try {
    const result = await lookupIp({
      ip: '106.36.192.6',
      version: 4,
      amapKey: 'test-key',
      requestId: 'test-request',
      cloudflare: {
        country: 'CN',
        region: 'Hunan',
        city: 'Changsha',
        asn: 4134,
        asOrganization: 'CHINANET-BACKBONE',
      },
    })

    assert.equal(result.region, '陕西省')
    assert.equal(result.city, '西安市')
    assert.equal(result.org, 'CHINANET-BACKBONE')
    assert.equal(result.location_source, '高德地图')
    assert.equal(result.network_source, 'Cloudflare')
  } finally {
    globalThis.fetch = originalFetch
  }
})
