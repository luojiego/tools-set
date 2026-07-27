import { useMemo, useState } from 'react'
import ToolPage from '@/components/ToolPage'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Copy } from 'lucide-react'

const copyText = (value) => navigator.clipboard?.writeText(value)

const UrlPage = () => {
  const [url, setUrl] = useState('https://example.com/search?q=tools&lang=zh#top')
  const [text, setText] = useState('中文 URL 参数 & symbols = ok')

  const parsed = useMemo(() => {
    try {
      const parsedUrl = new URL(url)
      return {
        ok: true,
        origin: parsedUrl.origin,
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        hash: parsedUrl.hash,
        params: Array.from(parsedUrl.searchParams.entries()),
      }
    } catch {
      return { ok: false }
    }
  }, [url])

  const encoded = encodeURIComponent(text)
  const decoded = useMemo(() => {
    try {
      return decodeURIComponent(text)
    } catch {
      return '无法解码：输入内容不是合法的 URL 编码文本'
    }
  }, [text])

  return (
    <ToolPage title="URL 工具" description="解析 URL 结构，查看 Query 参数，处理 URL 编码和解码">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>URL 解析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">URL</Label>
              <Textarea id="url-input" value={url} onChange={(event) => setUrl(event.target.value)} className="min-h-28 font-mono" />
            </div>

            {parsed.ok ? (
              <div className="space-y-3 text-sm">
                {[
                  ['协议', parsed.protocol],
                  ['域名', parsed.host],
                  ['来源', parsed.origin],
                  ['路径', parsed.pathname],
                  ['Hash', parsed.hash || '(无)'],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[80px_1fr]">
                    <span className="text-muted-foreground">{label}</span>
                    <code className="break-all font-mono">{value}</code>
                  </div>
                ))}

                <div className="rounded-md border">
                  <div className="border-b px-3 py-2 font-medium">Query 参数</div>
                  {parsed.params.length > 0 ? (
                    <div className="divide-y">
                      {parsed.params.map(([key, value], index) => (
                        <div key={`${key}-${index}`} className="grid gap-2 px-3 py-2 sm:grid-cols-[1fr_2fr]">
                          <code className="break-all font-mono text-blue-600 dark:text-blue-300">{key}</code>
                          <code className="break-all font-mono">{value}</code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-4 text-muted-foreground">没有 Query 参数</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">请输入完整合法 URL，例如 https://example.com?a=1</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>编码 / 解码</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-text">文本</Label>
              <Textarea id="url-text" value={text} onChange={(event) => setText(event.target.value)} className="min-h-28 font-mono" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>encodeURIComponent</Label>
                <Button variant="ghost" size="sm" onClick={() => copyText(encoded)}>
                  <Copy className="h-4 w-4" />
                  复制
                </Button>
              </div>
              <Input readOnly value={encoded} className="font-mono" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>decodeURIComponent</Label>
                <Button variant="ghost" size="sm" onClick={() => copyText(decoded)}>
                  <Copy className="h-4 w-4" />
                  复制
                </Button>
              </div>
              <Textarea readOnly value={decoded} className="min-h-24 font-mono" />
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  )
}

export default UrlPage
