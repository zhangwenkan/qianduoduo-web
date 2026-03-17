/**
 * 基金持仓数据获取工具
 * 获取基金前十大重仓股信息
 */

// #ifdef H5
const HOLDINGS_URL = '/api/fundholdings'
const STOCK_URL = '/api/stockquote'
// #endif
// #ifndef H5
const HOLDINGS_URL = 'https://fundf10.eastmoney.com/FundArchivesDatas.aspx'
const STOCK_URL = 'https://push2.eastmoney.com/api/qt/ulist.np'
// #endif

/**
 * 获取基金持仓数据
 * @param {string} fundCode 基金代码
 * @returns {Promise<Array>} 持仓列表
 */
export const getFundHoldings = (fundCode) => {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    uni.request({
      url: HOLDINGS_URL,
      data: {
        code: fundCode,
        type: 'ccmx'
      },
      dataType: 'text',
      success: (res) => {
        try {
          const holdings = parseHoldingsData(res.data, fundCode)
          resolve(holdings)
        } catch (e) {
          console.error('解析持仓数据失败:', e)
          resolve([])
        }
      },
      fail: (err) => {
        console.error('获取持仓数据失败:', err)
        resolve([])
      }
    })
    // #endif

    // #ifndef H5
    uni.request({
      url: HOLDINGS_URL,
      data: {
        type: 'ccmx',
        code: fundCode,
        token: '1fc9cc1c1bdc4538b8408b72571e67d1',
        st: '1',
        sr: '-1',
        p: 1,
        ps: 10
      },
      dataType: 'text',
      success: (res) => {
        try {
          const holdings = parseHoldingsData(res.data, fundCode)
          resolve(holdings)
        } catch (e) {
          console.error('解析持仓数据失败:', e)
          resolve([])
        }
      },
      fail: (err) => {
        console.error('获取持仓数据失败:', err)
        resolve([])
      }
    })
    // #endif
  })
}

/**
 * 解析持仓数据
 */
const parseHoldingsData = (data, fundCode) => {
  if (!data) return []
  
  try {
    const holdings = []
    const contentMatch = data.match(/content:"([^"]+)"/)
    if (contentMatch) {
      const html = contentMatch[1].replace(/\\u002F/g, '/')
      const rowMatches = html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/g)
      
      for (const row of rowMatches) {
        const cells = row[0].match(/<td[^>]*>([\s\S]*?)<\/td>/g)
        if (cells && cells.length >= 4) {
          const stockCode = cells[0]?.replace(/<[^>]+>/g, '').trim() || ''
          const stockName = cells[1]?.replace(/<[^>]+>/g, '').trim() || ''
          const ratio = parseFloat(cells[3]?.replace(/<[^>]+>/g, '').trim()) || 0
          
          if (stockCode && stockName) {
            holdings.push({
              stockCode,
              stockName,
              ratio,
              change: 0
            })
          }
        }
      }
    }
    
    return holdings.length > 0 ? holdings.slice(0, 10) : []
  } catch (e) {
    return []
  }
}

/**
 * 获取股票实时涨幅
 * @param {Array<string>} stockCodes 股票代码数组
 */
export const getStockQuotes = (stockCodes) => {
  return new Promise((resolve, reject) => {
    if (!stockCodes || stockCodes.length === 0) {
      resolve([])
      return
    }

    // #ifdef H5
    uni.request({
      url: STOCK_URL,
      data: {
        codes: stockCodes.join(',')
      },
      dataType: 'json',
      success: (res) => {
        try {
          const quotes = parseStockQuotes(res.data)
          resolve(quotes)
        } catch (e) {
          console.error('解析股票行情失败:', e)
          resolve([])
        }
      },
      fail: (err) => {
        console.error('获取股票行情失败:', err)
        resolve([])
      }
    })
    // #endif

    // #ifndef H5
    const secids = stockCodes.map(code => {
      if (code.startsWith('6')) return `1.${code}`
      return `0.${code}`
    }).join(',')
    
    uni.request({
      url: STOCK_URL,
      data: {
        fltt: 2,
        secids,
        fields: 'f12,f14,f2,f3,f4'
      },
      dataType: 'json',
      success: (res) => {
        try {
          const quotes = parseStockQuotes(res.data)
          resolve(quotes)
        } catch (e) {
          console.error('解析股票行情失败:', e)
          resolve([])
        }
      },
      fail: (err) => {
        console.error('获取股票行情失败:', err)
        resolve([])
      }
    })
    // #endif
  })
}

/**
 * 解析股票行情数据
 */
const parseStockQuotes = (data) => {
  if (!data || !data.data || !data.data.diff) {
    return []
  }
  
  return data.data.diff.map(item => ({
    code: item.f12,
    name: item.f14,
    price: item.f2,
    change: item.f3,
    changeAmount: item.f4
  }))
}

/**
 * 获取基金持仓和股票行情
 * @param {string} fundCode 基金代码
 */
export const getFundHoldingsWithQuotes = async (fundCode) => {
  const holdings = await getFundHoldings(fundCode)
  
  if (holdings.length === 0) {
    return []
  }
  
  const stockCodes = holdings.map(h => h.stockCode)
  const quotes = await getStockQuotes(stockCodes)
  
  const quoteMap = {}
  quotes.forEach(q => {
    quoteMap[q.code] = q
  })
  
  return holdings.map(h => ({
    ...h,
    change: quoteMap[h.stockCode]?.change || 0,
    price: quoteMap[h.stockCode]?.price || 0
  }))
}

export default {
  getFundHoldings,
  getStockQuotes,
  getFundHoldingsWithQuotes
}
