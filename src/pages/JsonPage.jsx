import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'
import ToolPage from '@/components/ToolPage'
import { 
  Save, 
  Trash2, 
  Copy, 
  Check,
  AlertCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  History,
  Search,
  FileJson,
  Layers
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

const JsonEditorPanel = ({ value, onChange, label, badge, mode = 'tree' }) => {
  const containerRef = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const options = {
      mode,
      modes: ['tree', 'code', 'form', 'text', 'preview'],
      onChangeText: (json) => {
        try {
          JSON.parse(json)
          onChange(json)
        } catch (e) {
        }
      },
      onChange: () => {
        if (editorRef.current) {
          const json = editorRef.current.get()
          onChange(JSON.stringify(json, null, 2))
        }
      },
      enableDrag: true,
      enableSort: true,
      enableTransform: true,
      mainMenuBar: true,
      navigationBar: true,
      statusBar: true,
      theme: 'os dark'
    }

    editorRef.current = new JSONEditor(containerRef.current, options)

    try {
      const parsed = JSON.parse(value || '{}')
      editorRef.current.set(parsed)
    } catch (e) {
      editorRef.current.setText(value || '')
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (editorRef.current && value) {
      try {
        const currentJson = editorRef.current.get()
        const currentStr = JSON.stringify(currentJson)
        if (currentStr !== value && currentStr !== JSON.stringify(JSON.parse(value))) {
          const parsed = JSON.parse(value)
          editorRef.current.set(parsed)
        }
      } catch (e) {
        editorRef.current.setText(value)
      }
    }
  }, [value])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{label}</span>
          <Badge variant="secondary">{badge}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-2">
        <div 
          ref={containerRef} 
          className="h-full w-full json-editor-container"
          style={{ minHeight: '400px' }}
        />
      </CardContent>
    </Card>
  )
}

const JsonPage = () => {
  const [input, setInput] = useState('{\n  \n}')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')
    } catch (e) {
      setError('JSON 格式错误: ' + e.message)
    }
  }, [input])

  const handleCompress = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const compressed = JSON.stringify(parsed)
      setOutput(compressed)
      setError('')
    } catch (e) {
      setError('JSON 格式错误: ' + e.message)
    }
  }, [input])

  const handleValidate = useCallback(() => {
    try {
      JSON.parse(input)
      setOutput('Valid JSON')
      setError('')
    } catch (e) {
      setError('JSON 格式错误: ' + e.message)
    }
  }, [input])

  const handleSave = () => {
    const content = output || input
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
    const content = output || input
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLoadFromHistory = (item) => {
    setInput(item.content)
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
    setInput('{\n  \n}')
    setOutput('')
    setError('')
  }

  const handleCopyToInput = () => {
    if (output) {
      setInput(output)
    }
  }

  const totalSize = history.reduce((acc, item) => acc + item.size, 0)

  return (
    <ToolPage title="JSON 工具" description="JSON 格式化、验证、压缩，支持保存历史记录" fullWidth>
      <div className="h-[calc(100vh-140px)] flex flex-col px-4">
        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Button onClick={handleFormat} variant="default" size="sm">
            格式化
          </Button>
          <Button onClick={handleCompress} variant="default" size="sm">
            压缩
          </Button>
          <Button onClick={handleValidate} variant="outline" size="sm">
            验证
          </Button>
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? '已复制' : '复制'}
          </Button>
          <Button onClick={handleCopyToInput} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            复制到输入
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
          <Alert variant="destructive" className="flex-shrink-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 编辑器区域 */}
        <div className="flex-1 min-h-0">
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={50} minSize={30}>
              <JsonEditorPanel
                value={input}
                onChange={setInput}
                label="输入"
                badge={`${input.length} 字符`}
                mode="text"
              />
            </Panel>
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />
            <Panel defaultSize={50} minSize={30}>
              <JsonEditorPanel
                value={output}
                onChange={setOutput}
                label="输出"
                badge={`${output.length} 字符`}
              />
            </Panel>
          </PanelGroup>
        </div>

        {/* 历史记录按钮 */}
        <div className="flex items-center gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setHistoryDialogOpen(true)}
            disabled={history.length === 0}
          >
            <History className="h-4 w-4 mr-2" />
            历史记录 ({history.length})
          </Button>
          <Badge variant="outline">
            {formatBytes(totalSize)} / {formatBytes(MAX_SIZE)}
          </Badge>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-1" />
              清空
            </Button>
          )}
        </div>

        {/* 历史记录弹窗 */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                历史记录
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索 JSON 内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-[400px]">
                {history.filter(item => 
                  searchQuery ? item.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
                ).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {searchQuery ? '没有匹配的搜索结果' : '暂无历史记录'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history
                      .filter(item => 
                        searchQuery ? item.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
                      )
                      .map((item) => {
                        let preview = { keys: 0, preview: '' }
                        try {
                          const parsed = JSON.parse(item.content)
                          preview.keys = Object.keys(parsed).length
                          preview.preview = JSON.stringify(parsed).slice(0, 100)
                        } catch (e) {}
                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => {
                              setInput(item.content)
                              setHistoryDialogOpen(false)
                              setSearchQuery('')
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.timestamp).toLocaleString('zh-CN')}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Layers className="h-3 w-3 mr-1" />
                                  {preview.keys} 个键
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {formatBytes(item.size)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm font-mono text-muted-foreground truncate">
                              {preview.preview}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ToolPage>
  )
}

export default JsonPage
