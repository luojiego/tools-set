import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import {
  Globe,
  Search,
  MapPin,
  Building2,
  Wifi,
  Clock,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Shield
} from 'lucide-react'
import ToolPage from '@/components/ToolPage'

const IpPage = () => {
  const [ip, setIp] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    handleLookup('')
  }, [])

  const handleLookup = async (ipAddress) => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const targetUrl = ipAddress 
        ? `https://ipwho.is/${ipAddress}`
        : `https://ipwho.is/`
      
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.message || '查询失败，请检查 IP 地址格式')
        return
      }

      setResult(data)
    } catch (err) {
      setError('网络请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (ip.trim()) {
      handleLookup(ip.trim())
    }
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const ResultField = ({ label, value, icon: Icon, copyKey }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{value || '-'}</span>
        {copyKey && value && (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={() => copyToClipboard(value, copyKey)}
          >
            {copied === copyKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <ToolPage title="IP 地址查询" description="查询 IP 地址的地理位置、网络信息">
      <div className="space-y-6">
        {/* 搜索框 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Search className="h-4 w-4 mr-2" />
              IP 查询
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="输入 IP 地址 (留空查询本机 IP)..."
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    查询
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 查询结果 */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center flex-wrap gap-2">
                  <Globe className="h-4 w-4" />
                  基本信息
                  <Badge variant="secondary">
                    IP: {result.ip}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ResultField 
                  label="国家" 
                  value={result.country ? `${result.country_flag_emoji} ${result.country}` : ''}
                  icon={Globe}
                  copyKey="country"
                />
                <ResultField 
                  label="地区" 
                  value={result.region}
                  icon={MapPin}
                  copyKey="region"
                />
                <ResultField 
                  label="城市" 
                  value={result.city}
                  icon={MapPin}
                  copyKey="city"
                />
                <ResultField 
                  label="邮政编码" 
                  value={result.postal}
                  copyKey="postal"
                />
                <ResultField 
                  label="纬度/经度" 
                  value={result.latitude && result.longitude ? `${result.latitude}, ${result.longitude}` : ''}
                  icon={MapPin}
                  copyKey="coords"
                />
                <ResultField 
                  label="时区" 
                  value={result.timezone?.id}
                  icon={Clock}
                  copyKey="timezone"
                />
              </CardContent>
            </Card>

            {/* 网络信息 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  网络信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ResultField 
                  label="ISP" 
                  value={result.connection?.isp}
                  icon={Building2}
                  copyKey="isp"
                />
                <ResultField 
                  label="组织" 
                  value={result.connection?.org}
                  icon={Building2}
                  copyKey="org"
                />
                <ResultField 
                  label="AS 号码" 
                  value={result.connection?.asn}
                  icon={Shield}
                  copyKey="asn"
                />
                <ResultField 
                  label="域名" 
                  value={result.domain}
                  icon={Globe}
                  copyKey="domain"
                />
                <ResultField 
                  label="首都" 
                  value={result.capital}
                  icon={MapPin}
                  copyKey="capital"
                />
                <ResultField 
                  label="货币" 
                  value={result.currency ? `${result.currency.name} (${result.currency.code})` : ''}
                  copyKey="currency"
                />
              </CardContent>
            </Card>

            {/* 其他信息 */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  其他信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">呼叫代码</span>
                    </div>
                    <span className="font-mono text-sm">{result.calling_code || '-'}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">语言</span>
                    </div>
                    <span className="font-mono text-sm">{result.languages?.[0]?.name || '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">正在查询...</span>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

export default IpPage
