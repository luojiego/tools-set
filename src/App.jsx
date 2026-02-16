import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Shield, Key, CreditCard, Github } from 'lucide-react'
import PasswordGenerator from './components/PasswordGenerator.jsx'
import CryptoTool from './components/CryptoTool.jsx'
import IdValidator from './components/IdValidator.jsx'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  加密工具箱
                </h1>
                <p className="text-sm text-muted-foreground">安全、便捷的在线工具集合</p>
              </div>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              专业的加密工具集合
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              提供密码生成、文本加密解密、身份证校验等实用工具，保护您的数据安全
            </p>
          </div>

          {/* Tools Tabs */}
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="password" className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>密码生成</span>
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>加密解密</span>
              </TabsTrigger>
              <TabsTrigger value="id" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>身份证校验</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-blue-500" />
                    <span>密码生成器</span>
                  </CardTitle>
                  <CardDescription>
                    生成安全可靠的密码，支持多种字符组合和长度设置
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span>加密解密工具</span>
                  </CardTitle>
                  <CardDescription>
                    支持多种加密算法，保护您的敏感信息
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CryptoTool />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="id" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-purple-500" />
                    <span>身份证校验</span>
                  </CardTitle>
                  <CardDescription>
                    验证身份证号码的合法性和校验位
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IdValidator />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 加密工具箱. 所有工具均在本地运行，保护您的隐私安全.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

