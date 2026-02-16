import { Construction } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import ToolPage from '@/components/ToolPage'

const ComingSoonPage = ({ title, description }) => {
  return (
    <ToolPage title={title} description={description}>
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Construction className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">即将上线</h3>
          <p className="text-muted-foreground text-center max-w-md">
            该功能正在紧张开发中，敬请期待...
          </p>
        </CardContent>
      </Card>
    </ToolPage>
  )
}

export const IpPage = () => (
  <ComingSoonPage title="IP地址查询" description="查询IP地址归属地和详细信息" />
)

export const TimePage = () => (
  <ComingSoonPage title="时间转换" description="时间戳转换、时区转换等" />
)

export const JsonPage = () => (
  <ComingSoonPage title="JSON 工具" description="JSON 格式化、验证、压缩等" />
)
