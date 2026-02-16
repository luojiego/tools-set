import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { CheckCircle, XCircle, Info, Calendar, MapPin, User } from 'lucide-react'

const IdValidator = () => {
  const [idNumber, setIdNumber] = useState('')
  const [validationResult, setValidationResult] = useState(null)
  const [idInfo, setIdInfo] = useState(null)

  // 省份代码映射
  const provinceMap = {
    '11': '北京', '12': '天津', '13': '河北', '14': '山西', '15': '内蒙古',
    '21': '辽宁', '22': '吉林', '23': '黑龙江',
    '31': '上海', '32': '江苏', '33': '浙江', '34': '安徽', '35': '福建', '36': '江西', '37': '山东',
    '41': '河南', '42': '湖北', '43': '湖南', '44': '广东', '45': '广西', '46': '海南',
    '50': '重庆', '51': '四川', '52': '贵州', '53': '云南', '54': '西藏',
    '61': '陕西', '62': '甘肃', '63': '青海', '64': '宁夏', '65': '新疆',
    '71': '台湾', '81': '香港', '82': '澳门'
  }

  // 校验位计算
  const calculateCheckDigit = (id17) => {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(id17[i]) * weights[i]
    }
    
    return checkCodes[sum % 11]
  }

  // 验证日期是否有效
  const isValidDate = (year, month, day) => {
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day
  }

  // 验证身份证号码
  const validateIdNumber = (id) => {
    const errors = []
    const warnings = []
    
    // 基本格式检查
    if (!id) {
      errors.push('请输入身份证号码')
      return { isValid: false, errors, warnings }
    }

    // 长度检查
    if (id.length !== 18) {
      errors.push('身份证号码必须为18位')
      return { isValid: false, errors, warnings }
    }

    // 字符检查
    const regex = /^[0-9]{17}[0-9Xx]$/
    if (!regex.test(id)) {
      errors.push('身份证号码格式不正确，前17位必须为数字，最后一位为数字或X')
      return { isValid: false, errors, warnings }
    }

    // 省份代码检查
    const provinceCode = id.substring(0, 2)
    if (!provinceMap[provinceCode]) {
      errors.push('省份代码不正确')
    }

    // 出生日期检查
    const year = parseInt(id.substring(6, 10))
    const month = parseInt(id.substring(10, 12))
    const day = parseInt(id.substring(12, 14))
    
    if (year < 1900 || year > new Date().getFullYear()) {
      errors.push('出生年份不在有效范围内')
    }
    
    if (month < 1 || month > 12) {
      errors.push('出生月份不正确')
    }
    
    if (day < 1 || day > 31) {
      errors.push('出生日期不正确')
    }
    
    if (!isValidDate(year, month, day)) {
      errors.push('出生日期不存在')
    }

    // 年龄检查
    const today = new Date()
    const birthDate = new Date(year, month - 1, day)
    const age = today.getFullYear() - year - (today < new Date(today.getFullYear(), month - 1, day) ? 1 : 0)
    
    if (age > 150) {
      warnings.push('年龄超过150岁，请确认是否正确')
    }
    
    if (age < 0) {
      errors.push('出生日期不能晚于今天')
    }

    // 校验位检查
    const calculatedCheck = calculateCheckDigit(id.substring(0, 17))
    const actualCheck = id.substring(17, 18).toUpperCase()
    
    if (calculatedCheck !== actualCheck) {
      errors.push(`校验位不正确，应为 ${calculatedCheck}，实际为 ${actualCheck}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 解析身份证信息
  const parseIdInfo = (id) => {
    if (id.length !== 18) return null

    const provinceCode = id.substring(0, 2)
    const cityCode = id.substring(2, 4)
    const countyCode = id.substring(4, 6)
    const year = parseInt(id.substring(6, 10))
    const month = parseInt(id.substring(10, 12))
    const day = parseInt(id.substring(12, 14))
    const sequenceCode = id.substring(14, 17)
    const checkDigit = id.substring(17, 18)

    // 性别判断（倒数第二位，奇数为男，偶数为女）
    const genderCode = parseInt(id.substring(16, 17))
    const gender = genderCode % 2 === 1 ? '男' : '女'

    // 年龄计算
    const today = new Date()
    const birthDate = new Date(year, month - 1, day)
    const age = today.getFullYear() - year - (today < new Date(today.getFullYear(), month - 1, day) ? 1 : 0)

    return {
      province: provinceMap[provinceCode] || '未知省份',
      provinceCode,
      cityCode,
      countyCode,
      birthDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      age,
      gender,
      sequenceCode,
      checkDigit,
      calculatedCheckDigit: calculateCheckDigit(id.substring(0, 17))
    }
  }

  const handleValidate = () => {
    const result = validateIdNumber(idNumber.trim())
    setValidationResult(result)
    
    if (result.isValid || idNumber.length === 18) {
      const info = parseIdInfo(idNumber.trim())
      setIdInfo(info)
    } else {
      setIdInfo(null)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase()
    setIdNumber(value)
    
    // 实时验证
    if (value.length === 18) {
      handleValidate()
    } else {
      setValidationResult(null)
      setIdInfo(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">身份证号码</Label>
          <Input
            value={idNumber}
            onChange={handleInputChange}
            placeholder="请输入18位身份证号码"
            className="font-mono text-lg"
            maxLength={18}
          />
          <p className="text-xs text-muted-foreground">
            支持18位二代身份证号码，最后一位可以是数字或字母X
          </p>
        </div>

        <Button 
          onClick={handleValidate}
          disabled={!idNumber.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          验证身份证
        </Button>
      </div>

      {/* 验证结果 */}
      {validationResult && (
        <Card className={`${validationResult.isValid 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
          : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>
                {validationResult.isValid ? '验证通过' : '验证失败'}
              </span>
              <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                {validationResult.isValid ? '有效' : '无效'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 错误信息 */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                {validationResult.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* 警告信息 */}
            {validationResult.warnings.length > 0 && (
              <div className="space-y-2">
                {validationResult.warnings.map((warning, index) => (
                  <Alert key={index}>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 身份证信息解析 */}
      {idInfo && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>身份证信息解析</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">归属地</p>
                  <p className="font-medium">{idInfo.province}</p>
                  <p className="text-xs text-muted-foreground">
                    省份代码: {idInfo.provinceCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">出生日期</p>
                  <p className="font-medium">{idInfo.birthDate}</p>
                  <p className="text-xs text-muted-foreground">
                    年龄: {idInfo.age} 岁
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">性别</p>
                  <p className="font-medium">{idInfo.gender}</p>
                  <p className="text-xs text-muted-foreground">
                    根据倒数第二位数字判断
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">校验位</p>
                  <p className="font-medium">
                    {idInfo.checkDigit}
                    {idInfo.checkDigit === idInfo.calculatedCheckDigit ? (
                      <Badge variant="default" className="ml-2 bg-green-500">正确</Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-2">
                        错误 (应为 {idInfo.calculatedCheckDigit})
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    序列码: {idInfo.sequenceCode}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 说明信息 */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <Info className="h-4 w-4 text-yellow-600" />
            <span>身份证号码规则说明</span>
          </h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• 身份证号码由18位数字组成，最后一位可能是字母X</p>
            <p>• 前6位为地区代码，7-14位为出生日期，15-17位为顺序码</p>
            <p>• 第17位数字为性别标识：奇数为男性，偶数为女性</p>
            <p>• 第18位为校验码，通过前17位数字计算得出</p>
            <p>• 本工具仅验证号码格式和校验位，不验证真实性</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default IdValidator

