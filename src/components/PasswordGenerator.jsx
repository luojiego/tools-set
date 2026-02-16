import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react'

const PasswordGenerator = () => {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState([12])
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false
  })
  const [showPassword, setShowPassword] = useState(true)
  const [copied, setCopied] = useState(false)

  const generatePassword = () => {
    let charset = ''
    
    // 处理隐藏选项
    if (options.numbersOnly) {
      charset = '0123456789'
    } else if (options.lettersOnly) {
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    } else {
      // 常规选项
      if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
      if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (options.numbers) charset += '0123456789'
      if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    if (charset === '') {
      setPassword('请至少选择一种字符类型')
      return
    }

    let result = ''
    for (let i = 0; i < length[0]; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setPassword(result)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const getPasswordStrength = () => {
    if (!password || password.length < 6) return { level: 'weak', text: '弱', color: 'bg-red-500' }
    
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { level: 'weak', text: '弱', color: 'bg-red-500' }
    if (score <= 4) return { level: 'medium', text: '中等', color: 'bg-yellow-500' }
    return { level: 'strong', text: '强', color: 'bg-green-500' }
  }

  const strength = getPasswordStrength()

  const handleOptionChange = (option, checked) => {
    // 如果选择隐藏选项，取消其他选项
    if (option === 'numbersOnly' && checked) {
      setOptions({
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
        numbersOnly: true,
        lettersOnly: false
      })
    } else if (option === 'lettersOnly' && checked) {
      setOptions({
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
        numbersOnly: false,
        lettersOnly: true
      })
    } else {
      // 如果选择常规选项，取消隐藏选项
      if (['lowercase', 'uppercase', 'numbers', 'symbols'].includes(option) && checked) {
        setOptions(prev => ({
          ...prev,
          [option]: checked,
          numbersOnly: false,
          lettersOnly: false
        }))
      } else {
        setOptions(prev => ({
          ...prev,
          [option]: checked
        }))
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* 密码显示区域 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">生成的密码</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`${strength.color} text-white border-0 text-xs`}>
                  {strength.text}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-7 w-7 p-0"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Input
                value={showPassword ? password : '•'.repeat(password.length)}
                readOnly
                className="pr-16 font-mono text-base bg-white dark:bg-gray-800 h-10"
                placeholder="点击生成密码..."
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!password}
                  className="h-7 w-7 p-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generatePassword}
                  className="h-7 w-7 p-0"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {copied && (
              <p className="text-sm text-green-600 dark:text-green-400">已复制到剪贴板!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 密码长度和字符类型 - 左右分栏 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 密码长度设置 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">密码长度</Label>
            <span className="text-sm text-muted-foreground">{length[0]} 位</span>
          </div>
          <Slider
            value={length}
            onValueChange={setLength}
            max={50}
            min={4}
            step={1}
            className="w-full"
          />
        </div>

        {/* 字符类型选择 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">字符类型</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={options.lowercase}
                onCheckedChange={(checked) => handleOptionChange('lowercase', checked)}
              />
              <Label htmlFor="lowercase" className="text-xs">小写字母</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={(checked) => handleOptionChange('uppercase', checked)}
              />
              <Label htmlFor="uppercase" className="text-xs">大写字母</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={options.numbers}
                onCheckedChange={(checked) => handleOptionChange('numbers', checked)}
              />
              <Label htmlFor="numbers" className="text-xs">数字</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={options.symbols}
                onCheckedChange={(checked) => handleOptionChange('symbols', checked)}
              />
              <Label htmlFor="symbols" className="text-xs">特殊字符</Label>
            </div>
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <Button 
        onClick={generatePassword} 
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        生成密码
      </Button>
    </div>
  )
}

export default PasswordGenerator

