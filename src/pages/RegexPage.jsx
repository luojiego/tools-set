import { useMemo, useState } from 'react'
import ToolPage from '@/components/ToolPage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const buildRanges = (regex, text) => {
  const matches = []
  const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`)

  for (const match of text.matchAll(globalRegex)) {
    const value = match[0]
    const index = match.index ?? 0
    matches.push({
      value,
      index,
      groups: match.slice(1),
    })

    if (value === '') break
  }

  return matches
}

const RegexPage = () => {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b')
  const [flags, setFlags] = useState('gi')
  const [sample, setSample] = useState('Contact: hello@example.com or admin@test.dev')

  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags)
      return { ok: true, matches: buildRanges(regex, sample) }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : '正则表达式无效' }
    }
  }, [pattern, flags, sample])

  const highlighted = useMemo(() => {
    if (!result.ok || result.matches.length === 0) return [sample]

    const chunks = []
    let cursor = 0
    result.matches.forEach((match, index) => {
      if (match.index > cursor) chunks.push(sample.slice(cursor, match.index))
      chunks.push(
        <mark key={`${match.index}-${index}`} className="rounded bg-yellow-200 px-1 text-black">
          {sample.slice(match.index, match.index + match.value.length)}
        </mark>
      )
      cursor = match.index + match.value.length
    })
    if (cursor < sample.length) chunks.push(sample.slice(cursor))
    return chunks
  }, [result, sample])

  return (
    <ToolPage title="正则测试器" description="实时测试正则表达式，查看匹配结果、位置和捕获组">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>表达式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div className="space-y-2">
                <Label htmlFor="regex-pattern">Pattern</Label>
                <Input id="regex-pattern" value={pattern} onChange={(event) => setPattern(event.target.value)} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regex-flags">Flags</Label>
                <Input id="regex-flags" value={flags} onChange={(event) => setFlags(event.target.value)} className="font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regex-sample">测试文本</Label>
              <Textarea id="regex-sample" value={sample} onChange={(event) => setSample(event.target.value)} className="min-h-64 font-mono" />
            </div>

            {!result.ok && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{result.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>结果</CardTitle>
              <Badge variant="secondary">{result.ok ? `${result.matches.length} 个匹配` : '无效'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-32 whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3 font-mono text-sm leading-7">
              {highlighted}
            </div>

            <div className="max-h-80 space-y-2 overflow-auto pr-1">
              {result.ok && result.matches.map((match, index) => (
                <div key={`${match.index}-${index}`} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <code className="break-all font-mono">{match.value || '(空匹配)'}</code>
                    <span className="shrink-0 text-muted-foreground">@ {match.index}</span>
                  </div>
                  {match.groups.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {match.groups.map((group, groupIndex) => (
                        <div key={groupIndex}>
                          ${groupIndex + 1}: <code>{group ?? '(未匹配)'}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  )
}

export default RegexPage
