import assert from 'node:assert/strict'
import test from 'node:test'
import {
  lookupIp,
  mergeLookupResults,
  normalizeAmapLocation,
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
