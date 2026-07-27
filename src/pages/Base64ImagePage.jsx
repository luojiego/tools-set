import { useMemo, useRef, useState } from 'react'
import ToolPage from '@/components/ToolPage'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Copy, Download, ImagePlus } from 'lucide-react'

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`
}

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error('图片加载失败'))
  image.src = src
})

const Base64ImagePage = () => {
  const [base64, setBase64] = useState('')
  const [fileInfo, setFileInfo] = useState(null)
  const [maxWidth, setMaxWidth] = useState(1200)
  const [quality, setQuality] = useState(0.82)
  const [format, setFormat] = useState('image/jpeg')
  const [compressed, setCompressed] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const base64Bytes = useMemo(() => Math.ceil((base64.length * 3) / 4), [base64])
  const compressedBytes = useMemo(() => Math.ceil((compressed.length * 3) / 4), [compressed])
  const previewSrc = base64.trim()

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setBase64(String(reader.result || ''))
      setCompressed('')
      setFileInfo({ name: file.name, size: file.size, type: file.type })
      setError('')
    }
    reader.onerror = () => setError('读取图片失败')
    reader.readAsDataURL(file)
  }

  const compressImage = async () => {
    try {
      if (!previewSrc) {
        setError('请先上传图片或粘贴 Base64 图片')
        return
      }

      const image = await loadImage(previewSrc)
      const ratio = Math.min(1, maxWidth / image.naturalWidth)
      const width = Math.max(1, Math.round(image.naturalWidth * ratio))
      const height = Math.max(1, Math.round(image.naturalHeight * ratio))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, width, height)
      setCompressed(canvas.toDataURL(format, quality))
      setError('')
    } catch (err) {
      setCompressed('')
      setError(err instanceof Error ? err.message : '压缩失败')
    }
  }

  const downloadHref = compressed || base64
  const downloadName = compressed ? `compressed.${format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'}` : 'image.txt'

  return (
    <ToolPage title="Base64 图片工具" description="图片转 Base64、Base64 图片预览，并支持按宽度和质量压缩输出">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed p-6 text-center">
              <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">选择图片后会自动转换为 Data URL Base64</p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
                选择图片
              </Button>
            </div>

            {fileInfo && (
              <div className="grid gap-2 rounded-md border p-3 text-sm sm:grid-cols-3">
                <span className="break-all">{fileInfo.name}</span>
                <span className="text-muted-foreground">{fileInfo.type}</span>
                <span className="text-muted-foreground">{formatBytes(fileInfo.size)}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="base64-input">Base64 / Data URL</Label>
              <Textarea
                id="base64-input"
                value={base64}
                onChange={(event) => {
                  setBase64(event.target.value)
                  setCompressed('')
                  setError('')
                }}
                className="min-h-64 font-mono text-xs"
                placeholder="data:image/png;base64,..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={!base64} onClick={() => navigator.clipboard?.writeText(base64)}>
                <Copy className="h-4 w-4" />
                复制原图 Base64
              </Button>
              <Button variant="outline" disabled={!downloadHref} asChild>
                <a href={downloadHref} download={downloadName}>
                  <Download className="h-4 w-4" />
                  下载结果
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>预览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                {previewSrc ? (
                  <img src={previewSrc} alt="Base64 图片预览" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-sm text-muted-foreground">暂无图片</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3">
                  <div className="text-muted-foreground">原始长度</div>
                  <div className="font-mono">{formatBytes(base64Bytes)}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-muted-foreground">压缩长度</div>
                  <div className="font-mono">{formatBytes(compressedBytes)}</div>
                </div>
              </div>
              {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>压缩输出</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="image-width">最大宽度</Label>
                  <Input id="image-width" type="number" min="64" max="4096" value={maxWidth} onChange={(event) => setMaxWidth(Number(event.target.value) || 1200)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-quality">质量</Label>
                  <Input id="image-quality" type="number" min="0.1" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Math.min(1, Math.max(0.1, Number(event.target.value) || 0.82)))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>输出格式</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={compressImage} disabled={!base64}>
                压缩图片
              </Button>

              {compressed && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>压缩后 Base64</Label>
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(compressed)}>
                      <Copy className="h-4 w-4" />
                      复制
                    </Button>
                  </div>
                  <Textarea readOnly value={compressed} className="min-h-40 font-mono text-xs" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolPage>
  )
}

export default Base64ImagePage
