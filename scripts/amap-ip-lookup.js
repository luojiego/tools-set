import { isIP } from 'node:net'
import { existsSync } from 'node:fs'
import process, { loadEnvFile } from 'node:process'
import { parseArgs } from 'node:util'

const DEFAULT_IP = '106.36.192.6'
const AMAP_IP_ENDPOINT = 'https://restapi.amap.com/v3/ip'
const REQUEST_TIMEOUT_MS = 10_000

const printUsage = () => {
  console.log(`
本地调用高德 IP 定位 API

用法：
  pnpm amap:ip
  pnpm amap:ip -- 106.36.192.6
  pnpm amap:ip -- --ip 106.36.192.6

环境变量：
  AMAP_WEB_SERVICE_KEY  高德 Web 服务 Key（必填）

程序会优先使用当前终端的环境变量；未设置时读取项目根目录下的 .dev.vars。
未指定 IP 时默认查询 ${DEFAULT_IP}。
`.trim())
}

const loadLocalEnvironment = () => {
  if (!process.env.AMAP_WEB_SERVICE_KEY && existsSync('.dev.vars')) {
    loadEnvFile('.dev.vars')
  }
}

const parseCliArguments = () => {
  const args = process.argv.slice(2)
  if (args[0] === '--') {
    args.shift()
  }

  const { values, positionals } = parseArgs({
    args,
    options: {
      help: {
        type: 'boolean',
        short: 'h',
      },
      ip: {
        type: 'string',
      },
    },
    allowPositionals: true,
  })

  if (values.help) {
    printUsage()
    process.exit(0)
  }

  if (positionals.length > 1) {
    throw new Error('只能指定一个 IP 地址')
  }

  return values.ip || positionals[0] || DEFAULT_IP
}

const lookupAmapIp = async ({ ip, key }) => {
  const url = new URL(AMAP_IP_ENDPOINT)
  url.searchParams.set('ip', ip)
  url.searchParams.set('output', 'json')
  url.searchParams.set('key', key)

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'tools-set-amap-local-test/1.0',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  const rawBody = await response.text()
  let data
  try {
    data = JSON.parse(rawBody)
  } catch {
    throw new Error(`高德返回了非 JSON 响应（HTTP ${response.status}）`)
  }

  return {
    httpStatus: response.status,
    data,
  }
}

const responseSucceeded = (httpStatus, data) => (
  httpStatus >= 200
  && httpStatus < 300
  && data?.status === '1'
)

const main = async () => {
  loadLocalEnvironment()

  const ip = parseCliArguments()
  if (isIP(ip) !== 4) {
    throw new Error(`高德 IP 定位仅支持 IPv4，当前输入：${ip}`)
  }

  const key = process.env.AMAP_WEB_SERVICE_KEY?.trim()
  if (!key) {
    throw new Error(
      '未找到 AMAP_WEB_SERVICE_KEY，请将 .dev.vars.example 复制为 .dev.vars 并填写 Key',
    )
  }

  console.log(JSON.stringify({
    level: 'debug',
    event: 'amap_ip_lookup_started',
    ip,
  }))

  const { httpStatus, data } = await lookupAmapIp({ ip, key })
  const result = {
    http_status: httpStatus,
    status: data.status ?? '',
    info: data.info ?? '',
    infocode: data.infocode ?? '',
    province: data.province ?? '',
    city: data.city ?? '',
    adcode: data.adcode ?? '',
    rectangle: data.rectangle ?? '',
  }

  console.log(JSON.stringify(result, null, 2))

  if (!responseSucceeded(httpStatus, data)) {
    throw new Error(
      `高德查询失败：${data.info || '未知错误'} (${data.infocode || '无错误码'})`,
    )
  }
}

main().catch((error) => {
  console.error(JSON.stringify({
    level: 'error',
    event: 'amap_ip_lookup_failed',
    message: error instanceof Error ? error.message : String(error),
  }))
  process.exitCode = 1
})
