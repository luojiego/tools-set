import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx'
import ToolPage from '@/components/ToolPage'
import { 
  Clock, 
  Plus, 
  Trash2, 
  HelpCircle,
  ArrowRight,
  Terminal,
  Code,
  Copy,
  Check,
  ArrowDown,
  ArrowUp
} from 'lucide-react'
import { format, parse } from 'date-fns'
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

const HelpContent = () => {
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const cliCommands = [
    { os: 'Linux/macOS', tsToDate: 'date -d @1699900800', dateToTs: 'date -d "2023-11-13 10:00:00" +%s' },
    { os: 'Linux/macOS', tsToDate: 'date -r 1699900800', dateToTs: 'date -j -f "%Y-%m-%d %H:%M:%S" "2023-11-13 10:00:00" +%s' },
    { os: 'Windows PowerShell', tsToDate: '[datetime]::FromUnixTimestamp(1699900800)', dateToTs: '(Get-Date "2023-11-13 10:00:00").ToUnixTimeSeconds()' },
    { os: 'Windows CMD', tsToDate: 'powershell -Command "[datetime]::FromUnixTimestamp(1699900800)"', dateToTs: 'powershell -Command "(Get-Date \\"2023-11-13 10:00:00\\").ToUnixTimeSeconds()"' },
    { os: 'macOS Terminal', tsToDate: 'date -r 1699900800', dateToTs: 'date -j -f "%Y-%m-%d %H:%M:%S" "2023-11-13 10:00:00" +%s' },
  ]

  const langExamples = [
    { lang: 'JavaScript', tsToDate: "new Date(1699900800 * 1000)", dateToTs: "Math.floor(new Date('2023-11-13').getTime() / 1000)" },
    { lang: 'TypeScript', tsToDate: "new Date(1699900800 * 1000)", dateToTs: "Math.floor(new Date('2023-11-13').getTime() / 1000)" },
    { lang: 'Python', tsToDate: "datetime.fromtimestamp(1699900800)", dateToTs: "int(datetime(2023,11,13,10,0,0).timestamp())" },
    { lang: 'Java', tsToDate: "new Date(1699900800L * 1000)", dateToTs: "(int)(Instant.parse(\"2023-11-13T10:00:00Z\").getEpochSecond())" },
    { lang: 'Go', tsToDate: 'time.Unix(1699900800, 0)', dateToTs: 'time.Date(2023, 11, 13, 10, 0, 0, 0, time.UTC).Unix()' },
    { lang: 'C#', tsToDate: 'DateTimeOffset.FromUnixTimeSeconds(1699900800)', dateToTs: '(int)(DateTime.Parse("2023-11-13 10:00:00").Subtract(new DateTime(1970,1,1)).TotalSeconds)' },
    { lang: 'Ruby', tsToDate: 'Time.at(1699900800)', dateToTs: 'Time.parse("2023-11-13 10:00:00").to_i' },
    { lang: 'PHP', tsToDate: "date('Y-m-d H:i:s', 1699900800)", dateToTs: 'strtotime("2023-11-13 10:00:00")' },
    { lang: 'Swift', tsToDate: 'Date(timeIntervalSince1970: 1699900800)', dateToTs: 'Int(Date().timeIntervalSince1970)' },
    { lang: 'Rust', tsToDate: 'DateTime::from_timestamp(1699900800, 0)', dateToTs: 'SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()' },
  ]

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="cli">
        <AccordionItem value="cli">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center">
              <Terminal className="h-5 w-5 mr-2 text-blue-500" />
              命令行时间转换
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  时间戳 → 日期
                </h4>
                <div className="grid gap-2">
                  {cliCommands.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{item.os}</span>
                        <code className="block text-sm mt-1">{item.tsToDate}</code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(item.tsToDate, `tsToDate-${i}`)}
                      >
                        {copied === `tsToDate-${i}` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  日期 → 时间戳
                </h4>
                <div className="grid gap-2">
                  {cliCommands.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">{item.os}</span>
                        <code className="block text-sm mt-1">{item.dateToTs}</code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(item.dateToTs, `dateToTs-${i}`)}
                      >
                        {copied === `dateToTs-${i}` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="code">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center">
              <Code className="h-5 w-5 mr-2 text-purple-500" />
              编程语言时间转换
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  时间戳 → 日期
                </h4>
                <div className="grid gap-2">
                  {langExamples.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                      <span className="text-sm font-medium min-w-[80px]">{item.lang}</span>
                      <code className="flex-1 text-sm ml-2 truncate">{item.tsToDate}</code>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(item.tsToDate, `langTsToDate-${i}`)}
                      >
                        {copied === `langTsToDate-${i}` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  日期 → 时间戳
                </h4>
                <div className="grid gap-2">
                  {langExamples.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                      <span className="text-sm font-medium min-w-[80px]">{item.lang}</span>
                      <code className="flex-1 text-sm ml-2 truncate">{item.dateToTs}</code>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(item.dateToTs, `langDateToTs-${i}`)}
                      >
                        {copied === `langDateToTs-${i}` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const TimestampItem = ({ ts, index, onRemove, onChange, onTimezoneChange, isLast, prevValue }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">
            时间戳 (秒)
          </Label>
          <Input
            placeholder="输入时间戳..."
            value={ts.value}
            onChange={(e) => onChange(ts.id, e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="w-[200px]">
          <Label className="text-xs text-muted-foreground mb-1 block">
            时区
          </Label>
          <Select value={ts.timezone} onValueChange={(v) => onTimezoneChange(ts.id, v)}>
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
          onClick={() => onRemove(ts.id)}
          disabled={isLast && index === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {ts.value && (
        <div className="mt-2 p-3 rounded-lg bg-muted/50 border-l-4 border-blue-500">
          <span className="text-sm text-muted-foreground">转换结果: </span>
          <span className="font-mono font-medium">
            {formatTimestamp(parseInt(ts.value) || 0, ts.timezone)}
          </span>
          <Badge variant="outline" className="ml-2">
            {ts.timezone}
          </Badge>
        </div>
      )}
      {index > 0 && ts.value && prevValue && (
        <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-400">
          <span className="text-sm text-muted-foreground">与上一个时间差: </span>
          <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
            {formatTimeDiff(parseInt(ts.value) || 0, parseInt(prevValue) || 0)}
          </span>
        </div>
      )}
    </div>
  )
}

const DateItem = ({ item, index, onRemove, onChange, onTimezoneChange, isLast, prevValue }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">
            日期时间
          </Label>
          <Input
            type="datetime-local"
            value={item.value}
            onChange={(e) => onChange(item.id, e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="w-[200px]">
          <Label className="text-xs text-muted-foreground mb-1 block">
            时区
          </Label>
          <Select value={item.timezone} onValueChange={(v) => onTimezoneChange(item.id, v)}>
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
          onClick={() => onRemove(item.id)}
          disabled={isLast && index === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {item.value && (
        <div className="mt-2 p-3 rounded-lg bg-muted/50 border-l-4 border-green-500">
          <span className="text-sm text-muted-foreground">时间戳: </span>
          <span className="font-mono font-medium">
            {(() => {
              try {
                const date = new Date(item.value)
                return Math.floor(date.getTime() / 1000)
              } catch (e) {
                return '无效日期'
              }
            })()}
          </span>
          <Badge variant="outline" className="ml-2">
            秒级
          </Badge>
          <Badge variant="secondary" className="ml-2">
            毫秒级: {(() => {
              try {
                const date = new Date(item.value)
                return date.getTime()
              } catch (e) {
                return '无效日期'
              }
            })()}
          </Badge>
        </div>
      )}
      {index > 0 && item.value && prevValue && (
        <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border-l-4 border-green-400">
          <span className="text-sm text-muted-foreground">与上一个时间差: </span>
          <span className="font-mono font-medium text-green-600 dark:text-green-400">
            {(() => {
              try {
                const d1 = new Date(item.value).getTime() / 1000
                const d2 = new Date(prevValue).getTime() / 1000
                return formatTimeDiff(d1, d2)
              } catch (e) {
                return '-'
              }
            })()}
          </span>
        </div>
      )}
    </div>
  )
}

let timestamps = []
let items = []

const TimePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timestamps, setTimestamps] = useState([
    { id: 1, value: '', timezone: getLocalTimezone() }
  ])
  const [dateItems, setDateItems] = useState([
    { id: 1, value: '', timezone: getLocalTimezone() }
  ])
  const [helpOpen, setHelpOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ts-to-date')

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

  const handleAddDate = () => {
    const newId = Math.max(...dateItems.map(t => t.id), 0) + 1
    setDateItems([...dateItems, { id: newId, value: '', timezone: getLocalTimezone() }])
  }

  const handleRemoveDate = (id) => {
    if (dateItems.length > 1) {
      setDateItems(dateItems.filter(t => t.id !== id))
    }
  }

  const handleDateChange = (id, value) => {
    setDateItems(dateItems.map(t => 
      t.id === id ? { ...t, value } : t
    ))
  }

  const handleDateTimezoneChange = (id, timezone) => {
    setDateItems(dateItems.map(t => 
      t.id === id ? { ...t, timezone } : t
    ))
  }

  const localTz = getLocalTimezone()
  const currentTimestamp = Math.floor(currentTime.getTime() / 1000)

  return (
    <ToolPage title="时间转换" description="时间戳与时间格式互转，支持多时区">
      <div className="space-y-6">
        {/* 当前时间 */}
        <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg">
          <CardContent className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="h-10 w-10" />
                </div>
                <div>
                  <div className="text-3xl font-mono font-bold tracking-wide">
                    {format(currentTime, 'yyyy-MM-dd HH:mm:ss')}
                  </div>
                  <div className="text-sm opacity-90 flex items-center gap-2">
                    <Badge variant="secondary" className="text-white bg-white/20">
                      {localTz}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  {currentTimestamp}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  秒级时间戳
                </div>
                <div className="text-lg font-mono opacity-75">
                  {currentTime.getTime()}
                </div>
                <div className="text-xs opacity-75">
                  毫秒级时间戳
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 转换类型选择 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ts-to-date" className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              时间戳 → 日期
            </TabsTrigger>
            <TabsTrigger value="date-to-ts" className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              日期 → 时间戳
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ts-to-date" className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center">
                    <ArrowUp className="h-4 w-4 mr-2 text-blue-500" />
                    时间戳转换为日期时间
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
                  <TimestampItem
                    key={ts.id}
                    ts={ts}
                    index={index}
                    onRemove={handleRemoveTimestamp}
                    onChange={handleTimestampChange}
                    onTimezoneChange={handleTimezoneChange}
                    isLast={index === timestamps.length - 1}
                    prevValue={index > 0 ? timestamps[index - 1].value : null}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="date-to-ts" className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center">
                    <ArrowDown className="h-4 w-4 mr-2 text-green-500" />
                    日期时间转换为时间戳
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setHelpOpen(true)}>
                      <HelpCircle className="h-4 w-4 mr-2" />
                      帮助
                    </Button>
                    <Button variant="default" size="sm" onClick={handleAddDate}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dateItems.map((item, index) => (
                  <DateItem
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={handleRemoveDate}
                    onChange={handleDateChange}
                    onTimezoneChange={handleDateTimezoneChange}
                    isLast={index === dateItems.length - 1}
                    prevValue={index > 0 ? dateItems[index - 1].value : null}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 帮助弹窗 */}
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">时间转换帮助</DialogTitle>
            </DialogHeader>
            <HelpContent />
          </DialogContent>
        </Dialog>
      </div>
    </ToolPage>
  )
}

export default TimePage
