import CryptoTool from '@/components/CryptoTool'
import ToolPage from '@/components/ToolPage'

const CryptoPage = () => {
  return (
    <ToolPage title="加密解密" description="支持多种加密算法，保护您的敏感信息">
      <CryptoTool />
    </ToolPage>
  )
}

export default CryptoPage
