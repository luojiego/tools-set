import IdValidator from '@/components/IdValidator'
import ToolPage from '@/components/ToolPage'

const IdPage = () => {
  return (
    <ToolPage title="身份证校验" description="验证身份证号码的合法性和校验位">
      <IdValidator />
    </ToolPage>
  )
}

export default IdPage
