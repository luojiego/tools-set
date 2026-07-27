import { useMemo, useState } from 'react'
import ToolPage from '@/components/ToolPage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const parseJwt = (token) => {
  const parts = token.trim().split('.')
  if (parts.length < 2) throw new Error('JWT 至少需要 header.payload 两段')

  return {
    header: JSON.parse(base64UrlDecode(parts[0])),
    payload: JSON.parse(base64UrlDecode(parts[1])),
    signature: parts[2] || '',
  }
}

const formatDate = (seconds) => {
  if (!Number.isFinite(seconds)) return ''
  return new Date(seconds * 1000).toLocaleString('zh-CN', { hour12: false })
}

const JwtPage = () => {
  const [token, setToken] = useState('')

  const result = useMemo(() => {
    if (!token.trim()) return { ok: false, empty: true }
    try {
      return { ok: true, value: parseJwt(token) }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'JWT 解析失败' }
    }
  }, [token])

  const claims = result.ok ? [
    ['签发人', result.value.payload.iss],
    ['主题', result.value.payload.sub],
    ['受众', Array.isArray(result.value.payload.aud) ? result.value.payload.aud.join(', ') : result.value.payload.aud],
    ['签发时间', formatDate(result.value.payload.iat)],
    ['生效时间', formatDate(result.value.payload.nbf)],
    ['过期时间', formatDate(result.value.payload.exp)],
  ].filter(([, value]) => value) : []

  return (
    <ToolPage title="JWT 解析器" description="本地解码 JWT Header 和 Payload，快速查看常用声明">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jwt-token">JWT</Label>
              <Textarea
                id="jwt-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="min-h-72 font-mono"
                placeholder="粘贴 JWT，内容只在浏览器本地解析"
              />
            </div>
            {!result.ok && !result.empty && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{result.error}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>常用声明</CardTitle>
                <Badge variant={result.ok ? 'default' : 'secondary'}>{result.ok ? '已解析' : '等待输入'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {claims.length > 0 ? claims.map(([label, value]) => (
                <div key={label} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[80px_1fr]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="break-all">{value}</span>
                </div>
              )) : (
                <p className="text-muted-foreground">解析后会显示 iss、sub、aud、iat、nbf、exp 等字段。</p>
              )}
            </CardContent>
          </Card>

          {result.ok && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Header</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-auto rounded-md bg-muted p-3 text-sm">{JSON.stringify(result.value.header, null, 2)}</pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Payload</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-auto rounded-md bg-muted p-3 text-sm">{JSON.stringify(result.value.payload, null, 2)}</pre>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPage>
  )
}

export default JwtPage
