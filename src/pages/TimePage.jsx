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
    const formatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    return formatter.format(date).replace(/\//g, '-')
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
  const [activeTab, setActiveTab] = useState('basics')

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const basicsContent = [
    {
      title: '什么是时间戳？',
      content: `时间戳（Timestamp）是表示从1970年1月1日 00:00:00 UTC 到指定日期所经过的秒数（毫秒数）。

例如：
• 1699900800 秒 = 2023-11-13 10:00:00 UTC
• 1704067200 秒 = 2024-01-01 00:00:00 UTC

时间戳的特点：
• 与时区无关 - 同一个时间戳在全球任何地方都表示同一个瞬间
• 便于存储和计算 - 只需要一个数字就能表示一个时间点
• 易于排序和比较`
    },
    {
      title: '什么是时区？',
      content: `时区是地球上同一理论时间一致的区域。世界划分为24个时区，每个时区相差1小时。

常见时区：
• UTC (Coordinated Universal Time) - 世界标准时间
• Asia/Shanghai (UTC+8) - 中国标准时间
• America/New_York (UTC-5) - 美国东部时间
• Europe/London (UTC+0) - 英国时间

注意：中国虽然地理上跨5个时区，但全国统一使用 UTC+8`
    },
    {
      title: '快速获取年份公式',
      content: `时间戳转年份的快捷公式（忽略闰年精确性）：

年 = 1970 + ⌊时间戳 / 31536000⌋

其中 31536000 = 365 × 24 × 60 × 60（一年秒数）

更精确的公式（考虑闰年）：
年 = 1970 + ⌊(时间戳 - 闰年补偿) / 31556952⌋

闰年补偿 = ⌊(年 - 1969) / 4⌋ - ⌊(年 - 1901) / 100⌋ + ⌊(年 - 1601) / 400⌋

例如：1699900800 秒
• 简单计算：1970 + 53 = 2023年
• 实际：2023年（正确）`
    },
    {
      title: '闰年知识',
      content: `闰年（Leap Year）是为了弥补地球公转周期与日历年的差异而设立的。

闰年规则：
• 能被4整除的年份是闰年
• 但能被100整除的不是闰年
• 能被400整除的又是闰年

例如：
• 2024 ÷ 4 = 506 → 闰年 ✓
• 1900 ÷ 4 = 475 → 1900 ÷ 100 = 19 → 不是闰年 ✗
• 2000 ÷ 4 = 500 → 2000 ÷ 100 = 20 → 2000 ÷ 400 = 5 → 闰年 ✓

历史原因：罗马皇帝凯撒创立了闰年制度，但当时每4年闰一次。后来发现每年其实比365.25天少一点，所以到了1582年，教皇格里高利十三世改革了闰年规则，也就是现在的规则。`
    },
    {
      title: '闰秒 (Leap Second)',
      content: `闰秒是为了保持原子时与地球自转时间同步而添加的调整。

为什么需要闰秒？
• 地球自转在慢慢变慢（每天增加约1.4毫秒）
• 原子钟非常稳定
• 两者会逐渐产生偏差

闰秒规则：
• 当原子时比世界时快0.9秒以上时，就会插入闰秒
• 闰秒通常在6月30日或12月31日的23:59:60秒插入

历史趣事：
• 1972年开始实施闰秒制度
• 到2023年已添加27次闰秒
• 2026年可能会取消闰秒（正在讨论中）

有趣的是：2016年跨年时，全世界多等了1秒（23:59:60），被称为"史上最长跨年"！`
    },
    {
      title: '历史上不存在的时间',
      content: `由于历史原因，有些看似"正常"的时间实际上是不存在的！

1. 日历变更（1582年10月）
• 1582年10月5日-14日被直接跳过！
• 原因：格里高利历改革，需要消除累积的10天误差
• 那天之后出生的人，日期直接跳到10月15日

2. 夏令时切换时刻
• 夏令时结束时，时钟会"倒退"1小时
• 例如：凌晨2:00变成凌晨1:00
• 所以凌晨1:00-2:00之间的某些时刻是不存在的

3. 0年不存在
• 历史学家没有公元0年
• 公元前1年之后是公元1年
• 但天文学和编程中通常有0年`
    },
    {
      title: '秒级 vs 毫秒级',
      content: `时间戳有两种精度：
• 秒级时间戳：10位数字，如 1699900800
• 毫秒级时间戳：13位数字，如 1699900800000

转换关系：
• 毫秒级 = 秒级 × 1000
• 秒级 = 毫秒级 ÷ 1000

不同编程语言默认使用不同精度：
• JavaScript/Java 使用毫秒级
• Python/Go 使用秒级
• PHP 可配置`
    },
    {
      title: '夏令时 (DST)',
      content: `夏令时（Daylight Saving Time）是一种在夏季调快时钟的制度。

注意事项：
• 夏令时期间，时区偏移会发生变化
• 涉及夏令时的转换建议使用专业的时区库
• 中国不使用夏令时，但欧美国家使用

例如：
• 美国纽约标准时间 UTC-5
• 夏令时期间变为 UTC-4（提前1小时）

起源：最早由英国建筑师威廉·威利特在1908年提出，目的是让人们充分利用日光，节省能源。`
    }
  ]

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basics">基本常识</TabsTrigger>
          <TabsTrigger value="cli">命令行</TabsTrigger>
          <TabsTrigger value="code">编程语言</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6">
          <div className="space-y-4">
            {basicsContent.map((item, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold text-base mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm mr-2">
                    {i + 1}
                  </span>
                  {item.title}
                </h4>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted p-3 rounded">{item.content}</pre>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cli" className="mt-6">
          <div className="space-y-6">
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
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <div className="space-y-6">
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
        </TabsContent>
      </Tabs>
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
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
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
