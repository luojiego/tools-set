import { useMemo, useState } from 'react'
import { CronExpressionParser } from 'cron-parser'
import ToolPage from '@/components/ToolPage'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Copy, Play } from 'lucide-react'

const examples = [
  { label: '每 5 分钟', value: '*/5 * * * *' },
  { label: '每天 08:30', value: '30 8 * * *' },
  { label: '工作日 09:00', value: '0 9 * * 1-5' },
  { label: '每月 1 日 00:00', value: '0 0 1 * *' },
  { label: 'Cloudflare 每小时', value: '0 * * * *' },
]

const timeZones = [
  'Asia/Shanghai',
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
]

const formatDate = (date, timeZone) => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date).replace(/\//g, '-')
}

const getNextRuns = (expression, timeZone, count) => {
  const interval = CronExpressionParser.parse(expression, {
    currentDate: new Date(),
    tz: timeZone,
  })

  return Array.from({ length: count }, () => interval.next().toDate())
}

const CronPage = () => {
  const [expression, setExpression] = useState('*/5 * * * *')
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai')
  const [count, setCount] = useState(10)

  const result = useMemo(() => {
    try {
      return { ok: true, runs: getNextRuns(expression, timeZone, count) }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Cron 表达式无效' }
    }
  }, [expression, timeZone, count])

  const fields = expression.trim().split(/\s+/)

  return (
    <ToolPage title="Cron 表达式解释器" description="解析 5/6 位 Cron 表达式，显示后续执行时间，适合后端和 Cloudflare 定时任务">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>表达式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cron-expression">Cron</Label>
              <Input
                id="cron-expression"
                value={expression}
                onChange={(event) => setExpression(event.target.value)}
                className="font-mono"
                placeholder="*/5 * * * *"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <Label>时区</Label>
                <Select value={timeZone} onValueChange={setTimeZone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeZones.map((zone) => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cron-count">执行次数</Label>
                <Input
                  id="cron-count"
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(event) => setCount(Math.min(50, Math.max(1, Number(event.target.value) || 1)))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>快速示例</Label>
              <div className="grid gap-2">
                {examples.map((item) => (
                  <Button key={item.value} variant="outline" className="justify-start" onClick={() => setExpression(item.value)}>
                    <Play className="h-4 w-4" />
                    <span>{item.label}</span>
                    <code className="ml-auto font-mono text-xs text-muted-foreground">{item.value}</code>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>字段拆解</CardTitle>
                <Badge variant={result.ok ? 'default' : 'destructive'}>{result.ok ? '有效' : '无效'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-5">
                {['分钟', '小时', '日期', '月份', '星期'].map((label, index) => (
                  <div key={label} className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <code className="mt-1 block break-all font-mono">{fields[index] || '-'}</code>
                  </div>
                ))}
              </div>
              {!result.ok && <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{result.error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>后续执行时间</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!result.ok}
                  onClick={() => navigator.clipboard?.writeText(result.ok ? result.runs.map((date) => formatDate(date, timeZone)).join('\n') : '')}
                >
                  <Copy className="h-4 w-4" />
                  复制
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {result.ok ? (
                <div className="divide-y rounded-md border">
                  {result.runs.map((date, index) => (
                    <div key={date.toISOString()} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[64px_1fr_1fr]">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <code className="font-mono">{formatDate(date, timeZone)}</code>
                      <span className="text-muted-foreground">{date.toISOString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">修正表达式后会显示下一批执行时间。</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolPage>
  )
}

export default CronPage
