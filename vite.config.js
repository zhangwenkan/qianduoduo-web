import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE || 'http://localhost:3000'

  return {
    plugins: [uni()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/uni.scss";`
        }
      }
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api/fundsearch': {
          target: 'https://fundsuggest.eastmoney.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fundsearch/, '/FundSearch/api/FundSearchAPI.ashx')
        },
        '/api/fundgz': {
          target: 'https://fundgz.1234567.com.cn',
          changeOrigin: true,
          rewrite: (path) => {
            const match = path.match(/code=(\d+)/)
            if (match) {
              return `/js/${match[1]}.js`
            }
            return path.replace(/^\/api\/fundgz/, '')
          }
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
        },
        '/api/fund-sectors': {
          target: apiBase,
          changeOrigin: true
        },
        '/api/fund-holdings': {
          target: apiBase,
          changeOrigin: true
        },
        '/api/fund-period-returns': {
          target: 'https://fundf10.eastmoney.com',
          changeOrigin: true,
          rewrite: (path) => {
            const match = path.match(/code=(\d+)/)
            return match ? `/FundArchivesDatas.aspx?type=jdzf&code=${match[1]}&rt=${Math.random()}` : path
          }
        }
      }
    }
  }
})
