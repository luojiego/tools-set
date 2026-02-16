import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { 
  Home, 
  Key, 
  Shield, 
  CreditCard, 
  Globe, 
  Clock, 
  FileJson,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const tools = [
  { id: 'password', title: '密码生成', icon: Key, href: '/tools/password' },
  { id: 'crypto', title: '加密解密', icon: Shield, href: '/tools/crypto' },
  { id: 'id', title: '身份证校验', icon: CreditCard, href: '/tools/id' },
  { id: 'ip', title: 'IP查询', icon: Globe, href: '/tools/ip' },
  { id: 'time', title: '时间转换', icon: Clock, href: '/tools/time' },
  { id: 'json', title: 'JSON工具', icon: FileJson, href: '/tools/json' }
]

const ToolPage = ({ children, title, description, fullWidth = false }) => {
  const location = useLocation()
  const currentIndex = tools.findIndex(t => t.href === location.pathname)
  
  const prevTool = currentIndex > 0 ? tools[currentIndex - 1] : null
  const nextTool = currentIndex < tools.length - 1 ? tools[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  工具站
                </span>
              </Link>
            </div>
            
            {/* 工具快速导航 */}
            <div className="hidden md:flex items-center space-x-1">
              {tools.filter(t => !t.disabled).map((tool) => (
                <Link key={tool.id} to={tool.href}>
                  <Button 
                    variant={location.pathname === tool.href ? 'default' : 'ghost'} 
                    size="sm"
                    className="h-8"
                  >
                    <tool.icon className="h-3.5 w-3.5 mr-1.5" />
                    {tool.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={fullWidth ? "py-6" : "container mx-auto px-4 py-6"}>
        <div className={fullWidth ? "px-4" : "max-w-5xl mx-auto"}>
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-sm mt-1">{description}</p>
            )}
          </div>

          {/* 工具内容 */}
          {children}

          {/* 上下工具切换 */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            {prevTool ? (
              <Link to={prevTool.href}>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {prevTool.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            
            {nextTool ? (
              <Link to={nextTool.href}>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  {nextTool.title}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ToolPage
