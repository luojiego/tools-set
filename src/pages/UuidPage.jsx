import { useMemo, useState } from 'react'
import ToolPage from '@/components/ToolPage'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Copy, RefreshCw } from 'lucide-react'

const alphabets = {
  readable: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',
  alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  hex: '0123456789abcdef',
}

const randomString = (length, alphabet) => {
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

const generateIds = (type, length, count) => {
  return Array.from({ length: count }, () => {
    if (type === 'uuid') return crypto.randomUUID()
    return randomString(length, alphabets[type])
  })
}

const UuidPage = () => {
  const [type, setType] = useState('uuid')
  const [length, setLength] = useState(16)
  const [count, setCount] = useState(8)
  const [nonce, setNonce] = useState(0)

  const ids = useMemo(() => {
    void nonce
    return generateIds(type, length, count)
  }, [type, length, count, nonce])
  const output = ids.join('\n')

  return (
    <ToolPage title="UUID / 随机 ID" description="批量生成 UUID v4、可读随机串、字母数字串和十六进制 ID">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>生成选项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uuid">UUID v4</SelectItem>
                  <SelectItem value="readable">易读随机串</SelectItem>
                  <SelectItem value="alnum">字母数字</SelectItem>
                  <SelectItem value="hex">十六进制</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="uuid-length">长度</Label>
                <Input
                  id="uuid-length"
                  type="number"
                  min="4"
                  max="128"
                  disabled={type === 'uuid'}
                  value={type === 'uuid' ? 36 : length}
                  onChange={(event) => setLength(Number(event.target.value) || 16)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uuid-count">数量</Label>
                <Input
                  id="uuid-count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(event) => setCount(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Button onClick={() => setNonce((value) => value + 1)}>
                <RefreshCw className="h-4 w-4" />
                重新生成
              </Button>
              <Button variant="outline" onClick={() => navigator.clipboard?.writeText(output)}>
                <Copy className="h-4 w-4" />
                复制全部
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="min-h-96 overflow-auto rounded-md border bg-muted/50 p-4 font-mono text-sm leading-7">{output}</pre>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  )
}

export default UuidPage
