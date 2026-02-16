import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import ToolPage from '@/components/ToolPage'
import { 
  FileJson, 
  Save, 
  Trash2, 
  Copy, 
  Check,
  AlertCircle,
  Clock,
  FileOutput,
  FileInput,
  Minimize2,
  RotateCcw
} from 'lucide-react'

const STORAGE_KEY = 'json_tool_history'
const MAX_SIZE = 100 * 1024 * 1024
const MAX_ITEMS = 10

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const JsonPage = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('input')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  const saveToHistory = (content) => {
    const contentSize = new Blob([content]).size
    
    if (contentSize > MAX_SIZE) {
      setError(`内容大小 ${formatBytes(contentSize)} 超过限制 ${formatBytes(MAX_SIZE)}`)
      return false
    }

    let newHistory = [...history]
    if (newHistory.length >= MAX_ITEMS) {
      newHistory = newHistory.slice(1)
    }

    newHistory.push({
      id: Date.now(),
      content,
      timestamp: new Date().toISOString(),
      size: contentSize
    })

    setHistory(newHistory)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
    return true
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')
      setActiveTab('output')
    } catch (e) {
      setError('JSON 格式错误: ' + e.message)
    }
  }

  const handleCompress = () => {
    try {
      const parsed = JSON.parse(input)
      const compressed = JSON.stringify(parsed)
      setOutput(compressed)
      setError('')
      setActiveTab('output')
    } catch (e) {
      setError('JSON 格式错误: ' + e.message)
    }
  }

  const handleValidate = () => {
    try {
      JSON.parse(input)
      setOutput('Valid JSON')
      setError('')
    } catch (e) {
      setError('JSON 格式错误: ' + e.message)
    }
  }

  const handleSave = () => {
    const content = activeTab === 'output' ? output : input
    if (!content.trim()) {
      setError('没有可保存的内容')
      return
    }

    const success = saveToHistory(content)
    if (success) {
      setError('')
    }
  }

  const handleCopy = async () => {
    const content = activeTab === 'output' ? output : input
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLoadFromHistory = (item) => {
    setInput(item.content)
    setOutput(item.content)
    setActiveTab('input')
    setError('')
  }

  const handleDeleteHistory = (id) => {
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const totalSize = history.reduce((acc, item) => acc + item.size, 0)

  return (
    <ToolPage title="JSON 工具" description="JSON 格式化、验证、压缩，支持保存历史记录">
      <div className="space-y-4">
        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleFormat} variant="default" size="sm">
            <FileOutput className="h-4 w-4 mr-2" />
            格式化
          </Button>
          <Button onClick={handleCompress} variant="default" size="sm">
            <Minimize2 className="h-4 w-4 mr-2" />
            压缩
          </Button>
          <Button onClick={handleValidate} variant="outline" size="sm">
            <Check className="h-4 w-4 mr-2" />
            验证
          </Button>
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? '已复制' : '复制'}
          </Button>
          <Button onClick={handleSave} variant="default" size="sm">
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
          <Button onClick={handleClear} variant="ghost" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            清空
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center">
                  <FileInput className="h-4 w-4 mr-2" />
                  输入
                </span>
                <Badge variant="secondary">{input.length} 字符</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入 JSON..."
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center">
                  <FileOutput className="h-4 w-4 mr-2" />
                  输出
                </span>
                <Badge variant="secondary">{output.length} 字符</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="结果将显示在这里..."
                className="min-h-[300px] font-mono text-sm"
                readOnly={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* 历史记录 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                历史记录
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {history.length}/{MAX_ITEMS} 条
                </Badge>
                <Badge variant="outline">
                  {formatBytes(totalSize)} / {formatBytes(MAX_SIZE)}
                </Badge>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                暂无历史记录
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <button
                        onClick={() => handleLoadFromHistory(item)}
                        className="flex-1 text-left"
                      >
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString('zh-CN')}
                        </div>
                        <div className="text-sm font-mono truncate max-w-md">
                          {item.content.slice(0, 100)}
                          {item.content.length > 100 ? '...' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatBytes(item.size)}
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteHistory(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  )
}

export default JsonPage
