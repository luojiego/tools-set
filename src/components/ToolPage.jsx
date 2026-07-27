import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import ThemeToggle from '@/components/ThemeToggle.jsx'
import { 
  Home, 
  Key, 
  Shield, 
  CreditCard, 
  Globe, 
  Clock, 
  FileJson,
  QrCode,
  Link2,
  Regex,
  KeyRound,
  Fingerprint,
  CalendarClock,
  Image,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile.js'

const tools = [
  { id: 'password', title: '密码生成', icon: Key, href: '/tools/password' },
  { id: 'crypto', title: '加密解密', icon: Shield, href: '/tools/crypto' },
  { id: 'id', title: '身份证校验', icon: CreditCard, href: '/tools/id' },
  { id: 'ip', title: 'IP查询', icon: Globe, href: '/tools/ip' },
  { id: 'time', title: '时间转换', icon: Clock, href: '/tools/time' },
  { id: 'json', title: 'JSON工具', icon: FileJson, href: '/tools/json' },
  { id: 'qr', title: '二维码', icon: QrCode, href: '/tools/qr' },
  { id: 'url', title: 'URL工具', icon: Link2, href: '/tools/url' },
  { id: 'regex', title: '正则测试', icon: Regex, href: '/tools/regex' },
  { id: 'jwt', title: 'JWT解析', icon: KeyRound, href: '/tools/jwt' },
  { id: 'uuid', title: '随机ID', icon: Fingerprint, href: '/tools/uuid' },
  { id: 'cron', title: 'Cron', icon: CalendarClock, href: '/tools/cron' },
  { id: 'base64-image', title: '图片Base64', icon: Image, href: '/tools/base64-image' }
]

const ToolPage = ({ children, title, description, fullWidth = false }) => {
  const location = useLocation()
  const isMobile = useIsMobile()
  const visibleTools = isMobile ? tools.filter((tool) => tool.id !== 'json') : tools
  const currentIndex = visibleTools.findIndex(t => t.href === location.pathname)
  
  const prevTool = currentIndex > 0 ? visibleTools[currentIndex - 1] : null
  const nextTool = currentIndex >= 0 && currentIndex < visibleTools.length - 1 ? visibleTools[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-black/80 sticky top-0 z-50">
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
            
            <div className="flex items-center gap-2">
              {/* 工具快速导航 */}
              <div className="hidden md:flex max-w-[calc(100vw-220px)] items-center space-x-1 overflow-x-auto py-1">
                {visibleTools.filter(t => !t.disabled).map((tool) => (
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
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={fullWidth ? "pt-6 pb-24 sm:py-6" : "container mx-auto px-4 pt-6 pb-24 sm:py-6"}>
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
