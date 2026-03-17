import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/uni.scss";`
      }
    }
  },
  server: {
    proxy: {
      '/api/fundsearch': {
        target: 'https://fundsuggest.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fundsearch/, '/FundSearch/api/FundSearchAPI.ashx')
      },
      '/api/fundgz': {
        target: 'https://fundgz.1234567.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fundgz/, '')
      },
      '/api/fundholdings': {
        target: 'https://fundf10.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fundholdings/, '/FundArchivesDatas.aspx')
      },
      '/api/stockquotes': {
        target: 'https://web.sqt.gtimg.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stockquotes\?/, '/q=')
      },
      '/api/fundcode': {
        target: 'https://fund.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fundcode/, '/js/fundcode_search.js')
      }
    }
  }
})
