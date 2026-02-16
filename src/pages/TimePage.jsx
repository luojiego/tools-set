import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import ToolPage from '@/components/ToolPage'
import { 
  Clock, 
  Plus, 
  Trash2, 
  HelpCircle,
  ArrowUpDown,
  Terminal,
  Code,
  Copy,
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const TIMEZONES = [
  { value: 'Asia/Shanghai', label: '中国 (Asia/Shanghai)', offset: 8 },
  { value: 'Asia/Tokyo', label: '日本 (Asia/Tokyo)', offset: 9 },
  { value: 'Asia/Seoul', label: '韩国 (Asia/Seoul)', offset: 9 },
  { value: 'Asia/Singapore', label: '新加坡 (Asia/Singapore)', offset: 8 },
  { value: 'Asia/Hong_Kong', label: '香港 (Asia/Hong_Kong)', offset: 8 },
  { value: 'America/New_York', label: '纽约 (America/New_York)', offset: -5 },
  { value: 'America/Los_Angeles', label: '洛杉矶 (America/Los_Angeles)', offset: -8 },
  { value: 'America/Chicago', label: '芝加哥 (America/Chicago)', offset: -6 },
  { value: 'Europe/London', label: '伦敦 (Europe/London)', offset: 0 },
  { value: 'Europe/Paris', label: '巴黎 (Europe/Paris)', offset: 1 },
  { value: 'Europe/Berlin', label: '柏林 (Europe/Berlin)', offset: 1 },
  { value: 'Australia/Sydney', label: '悉尼 (Australia/Sydney)', offset: 11 },
  { value: 'UTC', label: 'UTC', offset: 0 },
]

const getLocalTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

const formatTimestamp = (ts, timezone) => {
  try {
    const date = new Date(ts * 1000)
    return format(date, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
  } catch (e) {
    return '无效时间戳'
  }
}

const formatTimeDiff = (ts1, ts2) => {
  const diff = Math.abs(ts1 - ts2)
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`)
  
  return parts.join('')
}

const getTimezoneOffset = (tz) => {
  const found = TIMEZONES.find(t => t.value === tz)
  return found ? found.offset : 0
}

const HelpContent = () => {
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const cliCommands = [
    { os: 'Linux/macOS', cmd: 'date -d @1699900800', desc: '时间戳转日期' },
    { os: 'Linux/macOS', cmd: 'date +%s', desc: '当前时间戳' },
    { os: 'Linux/macOS', cmd: 'date -d "2023-11-13 10:00:00" +%s', desc: '日期转时间戳' },
    { os: 'Windows PowerShell', cmd: '[datetime]::FromUnixTimestamp(1699900800)', desc: '时间戳转日期' },
    { os: 'Windows PowerShell', cmd: '(Get-Date).ToUnixTimeSeconds()', desc: '当前时间戳' },
    { os: 'Windows CMD', cmd: 'powershell -Command "[datetime]::FromUnixTimestamp(1699900800)"', desc: '时间戳转日期' },
  ]

  const langExamples = [
    { lang: 'JavaScript', code: "new Date(1699900800 * 1000).toISOString()" },
    { lang: 'Python', code: "datetime.fromtimestamp(1699900800)" },
    { lang: 'Java', code: "new Date(1699900800L * 1000)" },
    { lang: 'Go', code: "time.Unix(1699900800, 0)" },
    { lang: 'C#', code: "DateTimeOffset.FromUnixTimeSeconds(1699900800)" },
    { lang: 'Ruby', code: "Time.at(1699900800)" },
    { lang: 'PHP', code: "date('Y-m-d H:i:s', 1699900800)" },
    { lang: 'Swift', code: "Date(timeIntervalSince1970: 1699900800)" },
    { lang: 'Rust', code: "DateTime::from_timestamp(1699900800, 0)" },
    { lang: 'TypeScript', code: "new Date(1699900800 * 1000)" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          <Terminal className="h-4 w-4 mr-2" />
          命令行时间转换
        </h3>
        <div className="space-y-2">
          {cliCommands.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-muted">
              <div>
                <span className="text-xs font-medium text-muted-foreground">{item.os}</span>
                <code className="block text-sm">{item.cmd}</code>
                <span className="text-xs text-muted-foreground">{item.desc}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => copyToClipboard(item.cmd, `cli-${i}`)}
              >
                {copied === `cli-${i}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          <Code className="h-4 w-4 mr-2" />
          编程语言时间转换
        </h3>
        <div className="space-y-2">
          {langExamples.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-muted">
              <span className="text-sm font-medium min-w-[80px]">{item.lang}</span>
              <code className="flex-1 text-sm ml-2">{item.code}</code>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => copyToClipboard(item.code, `lang-${i}`)}
              >
                {copied === `lang-${i}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const TimePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timestamps, setTimestamps] = useState([
    { id: 1, value: '', timezone: getLocalTimezone() }
  ])
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAddTimestamp = () => {
    const newId = Math.max(...timestamps.map(t => t.id), 0) + 1
    setTimestamps([...timestamps, { id: newId, value: '', timezone: getLocalTimezone() }])
  }

  const handleRemoveTimestamp = (id) => {
    if (timestamps.length > 1) {
      setTimestamps(timestamps.filter(t => t.id !== id))
    }
  }

  const handleTimestampChange = (id, value) => {
    setTimestamps(timestamps.map(t => 
      t.id === id ? { ...t, value } : t
    ))
  }

  const handleTimezoneChange = (id, timezone) => {
    setTimestamps(timestamps.map(t => 
      t.id === id ? { ...t, timezone } : t
    ))
  }

  const localTz = getLocalTimezone()
  const currentTimestamp = Math.floor(currentTime.getTime() / 1000)

  return (
    <ToolPage title="时间转换" description="时间戳与时间格式互转，支持多时区">
      <div className="space-y-6">
        {/* 当前时间 */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8" />
                <div>
                  <div className="text-3xl font-mono font-bold">
                    {format(currentTime, 'yyyy-MM-dd HH:mm:ss')}
                  </div>
                  <div className="text-sm opacity-90">
                    {localTz}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold">
                  {currentTimestamp}
                </div>
                <div className="text-sm opacity-90">
                  秒级时间戳
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 时间戳输入 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                时间戳转换
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setHelpOpen(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  帮助
                </Button>
                <Button variant="default" size="sm" onClick={handleAddTimestamp}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timestamps.map((ts, index) => (
              <div key={ts.id}>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      时间戳 (秒)
                    </Label>
                    <Input
                      placeholder="输入时间戳..."
                      value={ts.value}
                      onChange={(e) => handleTimestampChange(ts.id, e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="w-[200px]">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      时区
                    </Label>
                    <Select value={ts.timezone} onValueChange={(v) => handleTimezoneChange(ts.id, v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveTimestamp(ts.id)}
                    disabled={timestamps.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {ts.value && (
                  <div className="mt-2 p-2 rounded bg-muted/50 text-sm">
                    <span className="text-muted-foreground">转换结果: </span>
                    <span className="font-mono">
                      {formatTimestamp(parseInt(ts.value) || 0, ts.timezone)}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {ts.timezone}
                    </Badge>
                  </div>
                )}
                {index > 0 && ts.value && timestamps[index - 1].value && (
                  <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-950/30 text-sm">
                    <span className="text-muted-foreground">与上一个时间差: </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {formatTimeDiff(parseInt(ts.value) || 0, parseInt(timestamps[index - 1].value) || 0)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 帮助弹窗 */}
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>时间转换帮助</DialogTitle>
            </DialogHeader>
            <HelpContent />
          </DialogContent>
        </Dialog>
      </div>
    </ToolPage>
  )
}

export default TimePage
