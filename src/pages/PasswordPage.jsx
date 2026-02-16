import PasswordGenerator from '@/components/PasswordGenerator'
import ToolPage from '@/components/ToolPage'

const PasswordPage = () => {
  return (
    <ToolPage title="密码生成" description="生成安全可靠的密码，支持多种字符组合和长度设置">
      <PasswordGenerator />
    </ToolPage>
  )
}

export default PasswordPage
