/**
 * 基金心跳计算工具
 * 基于基金前十大重仓股实时涨幅，通过AI计算估算涨幅
 */

import { getApiBase } from './cloud.js'

const isDev = import.meta.env.DEV
const API_BASE = isDev ? '' : getApiBase()

const HOLDINGS_URL = isDev ? '/api/fundholdings' : `${API_BASE}/api/fundholdings`
const STOCK_URL = isDev ? '/api/stockquotes' : `${API_BASE}/api/stockquotes`

// 豆包API配置
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const DOUBAO_API_KEY = ''

// 股票行情缓存
let stockQuotesCache = {
  data: null,
  timestamp: 0,
  codes: []
}

/**
 * 判断当前是否在交易时间
 */
const isTradingTime = () => {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minute = now.getMinutes()
  
  if (day === 0 || day === 6) return false
  
  const time = hour * 60 + minute
  if (time >= 9 * 60 + 30 && time <= 11 * 60 + 30) return true
  if (time >= 13 * 60 && time <= 15 * 60) return true
  
  return false
}

/**
 * 获取基金持仓数据
 */
export const getFundHoldings = (fundCode) => {
  return new Promise((resolve) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    let quarterMonth = 12
    if (month <= 3) quarterMonth = 12
    else if (month <= 6) quarterMonth = 3
    else if (month <= 9) quarterMonth = 6
    else quarterMonth = 9
    
    const quarterYear = month <= 3 ? year - 1 : year
    
    uni.request({
      url: HOLDINGS_URL,
      data: { 
        type: 'jjcc', 
        code: fundCode,
        topline: 10,
        year: quarterYear,
        month: quarterMonth
      },
      dataType: 'text',
      success: (res) => {
        try {
          const holdings = parseHoldingsData(res.data)
          resolve(holdings && holdings.length > 0 ? holdings : [])
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
  })
}

/**
 * 解析持仓数据
 */
const parseHoldingsData = (html) => {
  if (!html) return null
  
  const holdings = []
  const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi
  const rows = html.match(rowRegex) || []
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
    const cells = []
    let match
    
    while ((match = cellRegex.exec(row)) !== null) {
      let content = match[1].replace(/<[^>]+>/g, '').trim()
      cells.push(content)
    }
    
    if (cells.length >= 5) {
      const stockCode = cells[1] || ''
      const stockName = cells[2] || ''
      const ratioStr = cells[4] || '0'
      const ratio = parseFloat(ratioStr.replace('%', ''))
      
      if (stockCode && stockName && !isNaN(ratio) && ratio > 0) {
        holdings.push({
          stockCode,
          stockName,
          ratio,
          change: 0
        })
      }
    }
    
    if (holdings.length >= 10) break
  }
  
  return holdings.length > 0 ? holdings : null
}

/**
 * 获取股票实时行情（使用腾讯接口）
 */
export const getStockQuotes = (stockCodes) => {
  return new Promise((resolve) => {
    if (!stockCodes || stockCodes.length === 0) {
      resolve([])
      return
    }
    
    const qtCodes = stockCodes.map(code => {
      if (code.startsWith('6')) return `sh${code}`
      return `sz${code}`
    }).join(',')
    
    uni.request({
      url: `${STOCK_URL}?q=${qtCodes}`,
      dataType: 'text',
      success: (res) => {
        try {
          const quotes = parseTencentStockQuotes(res.data, stockCodes)
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
  })
}

/**
 * 解析腾讯股票行情数据
 */
const parseTencentStockQuotes = (data, stockCodes) => {
  const quotes = []
  
  stockCodes.forEach(code => {
    const prefix = code.startsWith('6') ? 'sh' : 'sz'
    const regex = new RegExp(`v_${prefix}${code}="([^"]*)"`)
    const match = data.match(regex)
    
    if (match) {
      const parts = match[1].split('~')
      const currentPrice = parseFloat(parts[3]) || 0
      const lastClose = parseFloat(parts[4]) || 0
      const change = lastClose > 0 ? ((currentPrice - lastClose) / lastClose * 100) : 0
      
      quotes.push({
        code: code,
        name: parts[1] || '',
        price: currentPrice,
        change: parseFloat(change.toFixed(2)),
        changeAmount: parseFloat(parts[3]) - parseFloat(parts[4]) || 0
      })
    }
  })
  
  return quotes
}

/**
 * 本地计算基金涨幅
 */
const localCalculate = (holdings) => {
  if (!holdings || holdings.length === 0) {
    return { success: false, rate: 0 }
  }
  
  let weightedSum = 0
  let totalRatio = 0
  
  holdings.forEach(h => {
    weightedSum += (h.ratio || 0) * (h.change || 0)
    totalRatio += h.ratio || 0
  })
  
  const estimatedRate = totalRatio > 0 ? (weightedSum / totalRatio) * 0.65 : 0
  
  return {
    success: true,
    rate: parseFloat(estimatedRate.toFixed(2)),
    explanation: `基于前十大重仓股（占比约${totalRatio.toFixed(1)}%）加权计算`
  }
}

/**
 * 批量计算所有基金心跳（优化版：合并股票请求）
 * @param {Array} fundList 基金列表 [{fundCode, fundName, amount, id}]
 * @returns {Object} 心跳结果 {fundId: heartbeatData}
 */
export const calculateAllHeartbeats = async (fundList) => {
  if (!fundList || fundList.length === 0) {
    return {}
  }
  
  const results = {}
  const tradingTime = isTradingTime()
  
  // 1. 获取所有基金的持仓数据
  const holdingsPromises = fundList.map(fund => 
    getFundHoldings(fund.fundCode).then(holdings => ({
      fundId: fund.id,
      fundCode: fund.fundCode,
      fundName: fund.fundName,
      amount: fund.amount,
      holdings
    }))
  )
  
  const fundsWithHoldings = await Promise.all(holdingsPromises)
  
  // 2. 收集所有不重复的股票代码
  const allStockCodes = new Set()
  fundsWithHoldings.forEach(fund => {
    if (fund.holdings) {
      fund.holdings.forEach(h => allStockCodes.add(h.stockCode))
    }
  })
  
  const stockCodesArray = Array.from(allStockCodes)
  
  // 3. 检查缓存是否有效
  let quotes = []
  let shouldFetchNew = tradingTime
  
  if (!tradingTime) {
    // 非交易时间，尝试使用缓存
    const cacheKey = 'heartbeat_all_stocks'
    let cachedData = null
    
    try {
      cachedData = JSON.parse(uni.getStorageSync(cacheKey) || 'null')
    } catch (e) {
      cachedData = null
    }
    
    if (cachedData) {
      const cacheDate = new Date(cachedData.timestamp)
      const now = new Date()
      const isSameDay = cacheDate.toDateString() === now.toDateString()
      const isWeekend = now.getDay() === 0 || now.getDay() === 6
      
      if (isWeekend && cacheDate.getDay() === 5) {
        shouldFetchNew = false
        quotes = cachedData.quotes
      } else if (isSameDay && cacheDate.getHours() >= 15) {
        shouldFetchNew = false
        quotes = cachedData.quotes
      } else if (!isSameDay && cacheDate.getHours() >= 15) {
        const dayDiff = Math.floor((now - cacheDate) / (1000 * 60 * 60 * 24))
        if (dayDiff === 1 && now.getDay() !== 1) {
          shouldFetchNew = false
          quotes = cachedData.quotes
        } else if (dayDiff <= 3 && now.getDay() === 1) {
          shouldFetchNew = false
          quotes = cachedData.quotes
        }
      }
    }
  }
  
  // 4. 如果需要获取新数据，一次性请求所有股票行情
  if (shouldFetchNew && stockCodesArray.length > 0) {
    quotes = await getStockQuotes(stockCodesArray)
    
    // 缓存数据
    if (quotes && quotes.length > 0) {
      try {
        uni.setStorageSync('heartbeat_all_stocks', JSON.stringify({
          timestamp: Date.now(),
          quotes
        }))
      } catch (e) {
        console.error('缓存行情数据失败:', e)
      }
    }
  }
  
  // 5. 构建股票行情映射
  const quoteMap = {}
  quotes.forEach(q => {
    quoteMap[q.code] = q
  })
  
  // 6. 计算每个基金的心跳
  fundsWithHoldings.forEach(fund => {
    if (!fund.holdings || fund.holdings.length === 0) {
      results[fund.fundId] = { success: false, message: '无法获取持仓数据' }
      return
    }
    
    // 合并行情数据
    const holdingsWithChange = fund.holdings.map(h => ({
      ...h,
      change: quoteMap[h.stockCode]?.change || 0
    }))
    
    // 计算涨幅
    const calcResult = localCalculate(holdingsWithChange)
    
    // 计算当日收益金额
    const todayProfit = fund.amount * calcResult.rate / 100
    
    // 时间描述
    let timeDesc = ''
    if (tradingTime) {
      timeDesc = '实时'
    } else if (quotes.length > 0) {
      const cachedData = JSON.parse(uni.getStorageSync('heartbeat_all_stocks') || 'null')
      if (cachedData) {
        const cacheDate = new Date(cachedData.timestamp)
        const now = new Date()
        if (cacheDate.toDateString() === now.toDateString()) {
          timeDesc = '今日收盘'
        } else {
          const month = cacheDate.getMonth() + 1
          const day = cacheDate.getDate()
          timeDesc = `${month}/${day}收盘`
        }
      }
    }
    
    results[fund.fundId] = {
      success: true,
      rate: calcResult.rate,
      todayProfit: parseFloat(todayProfit.toFixed(2)),
      explanation: calcResult.explanation,
      holdings: holdingsWithChange,
      isRealTime: tradingTime,
      timeDesc
    }
  })
  
  return results
}

/**
 * 单个基金心跳计算（兼容旧接口）
 */
export const calculateFundHeartbeat = async (fundCode, fundName, amount = 0) => {
  const results = await calculateAllHeartbeats([{
    id: 'single',
    fundCode,
    fundName,
    amount
  }])
  
  return results['single'] || { success: false, message: '计算失败' }
}

export default {
  getFundHoldings,
  getStockQuotes,
  calculateFundHeartbeat,
  calculateAllHeartbeats
}
