import { Link } from 'react-router-dom'
import { 
  Shield, 
  Key, 
  CreditCard, 
  Globe, 
  Clock, 
  FileJson, 
  Wrench,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const tools = [
  {
    id: 'password',
    title: '密码生成',
    description: '生成安全可靠的密码，支持多种字符组合',
    icon: Key,
    href: '/tools/password',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'crypto',
    title: '加密解密',
    description: '支持多种加密算法，保护您的敏感信息',
    icon: Shield,
    href: '/tools/crypto',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'id',
    title: '身份证校验',
    description: '验证身份证号码的合法性和校验位',
    icon: CreditCard,
    href: '/tools/id',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'ip',
    title: 'IP地址查询',
    description: '查询IP地址归属地和详细信息',
    icon: Globe,
    href: '/tools/ip',
    color: 'from-orange-500 to-red-500',
    disabled: true
  },
  {
    id: 'time',
    title: '时间转换',
    description: '时间戳转换、时区转换等',
    icon: Clock,
    href: '/tools/time',
    color: 'from-cyan-500 to-blue-500',
    disabled: true
  },
  {
    id: 'json',
    title: 'JSON 工具',
    description: 'JSON 格式化、验证、压缩等',
    icon: FileJson,
    href: '/tools/json',
    color: 'from-yellow-500 to-amber-500'
  }
]

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  工具站
                </h1>
                <p className="text-sm text-muted-foreground">实用在线工具集合</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              实用在线工具
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              简洁高效的在线工具集合，让工作更轻松
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link 
                key={tool.id} 
                to={tool.disabled ? '#' : tool.href}
                className={`block transition-transform hover:scale-[1.02] ${tool.disabled ? 'pointer-events-none opacity-60' : ''}`}
              >
                <Card className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${tool.color}`}>
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      {tool.disabled && (
                        <span className="text-xs text-muted-foreground">即将上线</span>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-3">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-blue-500">
                      <span>立即使用</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 工具站. 所有工具均在本地运行，保护您的隐私安全.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
