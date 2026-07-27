import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import ToolPage from '@/components/ToolPage'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Download, QrCode } from 'lucide-react'

const QrPage = () => {
  const [text, setText] = useState('https://tools.luojie.dev')
  const [size, setSize] = useState(280)
  const [level, setLevel] = useState('M')
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const renderQr = async () => {
      if (!text.trim()) {
        setDataUrl('')
        setError('')
        return
      }

      try {
        const url = await QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          errorCorrectionLevel: level,
          color: {
            dark: '#111827',
            light: '#ffffff',
          },
        })

        if (!cancelled) {
          setDataUrl(url)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setDataUrl('')
          setError(err instanceof Error ? err.message : '二维码生成失败')
        }
      }
    }

    renderQr()
    return () => {
      cancelled = true
    }
  }, [text, size, level])

  return (
    <ToolPage title="二维码工具" description="本地生成文本、链接或 Wi-Fi 信息二维码，支持 PNG 下载">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-text">文本或链接</Label>
              <Textarea
                id="qr-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="min-h-48 font-mono"
                placeholder="输入需要生成二维码的内容"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qr-size">尺寸</Label>
                <Input
                  id="qr-size"
                  type="number"
                  min="160"
                  max="640"
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value) || 280)}
                />
              </div>
              <div className="space-y-2">
                <Label>容错级别</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L - 低</SelectItem>
                    <SelectItem value="M">M - 中</SelectItem>
                    <SelectItem value="Q">Q - 较高</SelectItem>
                    <SelectItem value="H">H - 高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>预览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-white p-4">
              {dataUrl ? (
                <img src={dataUrl} alt="二维码预览" className="h-full w-full object-contain" />
              ) : (
                <QrCode className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" disabled={!dataUrl} asChild>
              <a href={dataUrl} download="qrcode.png">
                <Download className="h-4 w-4" />
                下载 PNG
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  )
}

export default QrPage
