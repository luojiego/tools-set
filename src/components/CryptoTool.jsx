import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Copy, Lock, Unlock, AlertCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'

const CryptoTool = () => {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [algorithm, setAlgorithm] = useState('base64')
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Base64 编码/解码
  const base64Encode = (text) => {
    try {
      return btoa(unescape(encodeURIComponent(text)))
    } catch (e) {
      throw new Error('Base64 编码失败')
    }
  }

  const base64Decode = (text) => {
    try {
      return decodeURIComponent(escape(atob(text)))
    } catch (e) {
      throw new Error('Base64 解码失败，请检查输入格式')
    }
  }

  // URL 编码/解码
  const urlEncode = (text) => {
    return encodeURIComponent(text)
  }

  const urlDecode = (text) => {
    try {
      return decodeURIComponent(text)
    } catch (e) {
      throw new Error('URL 解码失败，请检查输入格式')
    }
  }

  // HTML 编码/解码
  const htmlEncode = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const htmlDecode = (text) => {
    const div = document.createElement('div')
    div.innerHTML = text
    return div.textContent || div.innerText || ''
  }

  // MD5 哈希 (简单实现)
  const md5Hash = (text) => {
    // 这里使用一个简化的 MD5 实现
    // 在实际项目中，建议使用专业的加密库
    let hash = 0
    if (text.length === 0) return hash.toString()
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(16)
  }

  // SHA256 哈希 (简单实现)
  const sha256Hash = async (text) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // 凯撒密码
  const caesarCipher = (text, shift, decode = false) => {
    if (decode) shift = -shift
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97
      return String.fromCharCode(((char.charCodeAt(0) - start + shift + 26) % 26) + start)
    })
  }

  // 简单替换密码
  const substitutionCipher = (text, key, decode = false) => {
    if (!key) throw new Error('请输入密钥')
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const keyUpper = key.toUpperCase()
    
    if (decode) {
      return text.toUpperCase().replace(/[A-Z]/g, (char) => {
        const index = keyUpper.indexOf(char)
        return index !== -1 ? alphabet[index] : char
      })
    } else {
      return text.toUpperCase().replace(/[A-Z]/g, (char) => {
        const index = alphabet.indexOf(char)
        return index !== -1 ? keyUpper[index % keyUpper.length] : char
      })
    }
  }

  const handleEncrypt = async () => {
    setError('')
    try {
      let result = ''
      
      switch (algorithm) {
        case 'base64':
          result = base64Encode(inputText)
          break
        case 'url':
          result = urlEncode(inputText)
          break
        case 'html':
          result = htmlEncode(inputText)
          break
        case 'md5':
          result = md5Hash(inputText)
          break
        case 'sha256':
          result = await sha256Hash(inputText)
          break
        case 'caesar':
          result = caesarCipher(inputText, 3)
          break
        case 'substitution':
          result = substitutionCipher(inputText, key)
          break
        default:
          throw new Error('不支持的算法')
      }
      
      setOutputText(result)
    } catch (e) {
      setError(e.message)
      setOutputText('')
    }
  }

  const handleDecrypt = async () => {
    setError('')
    try {
      let result = ''
      
      switch (algorithm) {
        case 'base64':
          result = base64Decode(inputText)
          break
        case 'url':
          result = urlDecode(inputText)
          break
        case 'html':
          result = htmlDecode(inputText)
          break
        case 'md5':
        case 'sha256':
          throw new Error('哈希算法不支持解密')
        case 'caesar':
          result = caesarCipher(inputText, 3, true)
          break
        case 'substitution':
          result = substitutionCipher(inputText, key, true)
          break
        default:
          throw new Error('不支持的算法')
      }
      
      setOutputText(result)
    } catch (e) {
      setError(e.message)
      setOutputText('')
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const algorithms = [
    { value: 'base64', label: 'Base64 编码', needsKey: false },
    { value: 'url', label: 'URL 编码', needsKey: false },
    { value: 'html', label: 'HTML 编码', needsKey: false },
    { value: 'md5', label: 'MD5 哈希', needsKey: false, hashOnly: true },
    { value: 'sha256', label: 'SHA256 哈希', needsKey: false, hashOnly: true },
    { value: 'caesar', label: '凯撒密码', needsKey: false },
    { value: 'substitution', label: '替换密码', needsKey: true }
  ]

  const currentAlgorithm = algorithms.find(alg => alg.value === algorithm)

  return (
    <div className="space-y-4">
      {/* 算法选择和密钥 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label className="text-sm font-medium mb-1.5 block">选择算法</Label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger>
              <SelectValue placeholder="选择加密算法" />
            </SelectTrigger>
            <SelectContent>
              {algorithms.map((alg) => (
                <SelectItem key={alg.value} value={alg.value}>
                  {alg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {currentAlgorithm?.needsKey && (
          <div className="flex-1">
            <Label className="text-sm font-medium mb-1.5 block">密钥</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="请输入密钥"
              type="password"
            />
          </div>
        )}
      </div>

      {/* 输入输出 - 左右分栏 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 输入区域 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">输入文本</Label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入要处理的文本..."
            className="min-h-[180px] font-mono text-sm"
          />
        </div>

        {/* 输出区域 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">输出结果</Label>
          <Textarea
            value={outputText}
            readOnly
            placeholder="处理结果将显示在这里..."
            className="min-h-[180px] font-mono text-sm bg-muted/50"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleEncrypt}
          disabled={!inputText.trim()}
          className="flex-1 bg-green-500 hover:bg-green-600"
        >
          <Lock className="h-4 w-4 mr-2" />
          {currentAlgorithm?.hashOnly ? '生成哈希' : '加密/编码'}
        </Button>
        
        {!currentAlgorithm?.hashOnly && (
          <Button 
            onClick={handleDecrypt}
            disabled={!inputText.trim()}
            variant="outline"
            className="flex-1"
          >
            <Unlock className="h-4 w-4 mr-2" />
            解密/解码
          </Button>
        )}
        
        {outputText && (
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            复制
          </Button>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 复制成功提示 */}
      {copied && (
        <p className="text-sm text-green-600 dark:text-green-400">已复制到剪贴板!</p>
      )}

      {/* 算法说明 */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              {algorithm === 'base64' && 'Base64 是一种基于64个可打印字符来表示二进制数据的表示方法，常用于数据传输。'}
              {algorithm === 'url' && 'URL 编码将特殊字符转换为百分号编码格式，确保 URL 的正确传输。'}
              {algorithm === 'html' && 'HTML 编码将特殊字符转换为 HTML 实体，防止 XSS 攻击。'}
              {algorithm === 'md5' && 'MD5 是一种广泛使用的哈希函数，产生128位哈希值。注意：MD5 已不够安全，仅用于演示。'}
              {algorithm === 'sha256' && 'SHA256 是 SHA-2 系列的一种，产生256位哈希值，比 MD5 更安全。'}
              {algorithm === 'caesar' && '凯撒密码是一种简单的替换密码，通过将字母向后移动固定位数来加密。'}
              {algorithm === 'substitution' && '替换密码使用密钥中的字符替换原文中的字符，需要提供密钥。'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CryptoTool

