/**
 * 基金数据接口
 * 数据来源：天天基金
 */

import { callCloud } from './cloud.js'

// 判断平台
// #ifdef H5
const SEARCH_URL = '/api/fundsearch'
const DETAIL_URL = '/api/fundgz'
// #endif
// #ifndef H5
const SEARCH_URL = 'https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx'
const DETAIL_URL = 'https://fundgz.1234567.com.cn'
// #endif

/**
 * 根据估值时间获取时间描述
 */
const getEstimateTimeDesc = (gztime) => {
  if (!gztime) return ''
  
  const now = new Date()
  const estimateDate = new Date(gztime)
  const isToday = estimateDate.toDateString() === now.toDateString()
  const hours = estimateDate.getHours()
  const minutes = estimateDate.getMinutes()
  const isTradingTime = (hours === 9 && minutes >= 30) || (hours >= 10 && hours < 15) || (hours === 15 && minutes === 0)
  
  if (isToday && isTradingTime) {
    return '实时'
  } else if (isToday) {
    return '今日收盘'
  } else {
    const month = estimateDate.getMonth() + 1
    const day = estimateDate.getDate()
    return `${month}/${day}收盘`
  }
}

/**
 * 搜索基金
 */
export const searchFund = (keyword) => {
  return new Promise((resolve) => {
    if (!keyword || keyword.length < 2) {
      resolve([])
      return
    }

    uni.request({
      url: SEARCH_URL,
      data: {
        m: 1,
        key: keyword,
        _t: Date.now()
      },
      dataType: 'json',
      success: (res) => {
        try {
          const data = res.data
          if (data && data.Datas) {
            const funds = data.Datas.slice(0, 10).map(item => ({
              code: item.CODE,
              name: item.NAME,
              type: item.FUNDTYPE,
              pinyin: item.JIANPIN
            }))
            resolve(funds)
          } else {
            resolve([])
          }
        } catch (e) {
          console.error('解析基金数据失败:', e)
          resolve([])
        }
      },
      fail: (err) => {
        console.error('搜索基金失败:', err)
        resolve([])
      }
    })
  })
}

/**
 * 获取基金详情（实时净值）
 */
export const getFundDetail = (fundCode) => {
  return new Promise((resolve) => {
    uni.request({
      url: `${DETAIL_URL}/js/${fundCode}.js`,
      dataType: 'text',
      success: (res) => {
        try {
          const text = res.data
          const match = text.match(/jsonpgz\((.+)\)/)
          if (match) {
            const data = JSON.parse(match[1])
            const timeDesc = getEstimateTimeDesc(data.gztime)
            resolve({
              code: data.fundcode,
              name: data.name,
              nav: data.dwjz,
              navDate: data.jzrq,
              estimatedNav: data.gsz,
              estimatedPercent: data.gszzl,
              estimatedTime: data.gztime,
              timeDesc: timeDesc
            })
          } else {
            resolve(null)
          }
        } catch (e) {
          console.error('解析基金详情失败:', e)
          resolve(null)
        }
      },
      fail: (err) => {
        console.error('获取基金详情失败:', err)
        resolve(null)
      }
    })
  })
}

/**
 * 批量获取基金估值
 */
export const getFundEstimates = (fundCodes) => {
  return Promise.all(fundCodes.map(code => getFundDetail(code)))
}

/**
 * 获取基金板块信息（调用后端云函数）
 */
export const getFundSectorsBatch = async (fundCodes) => {
  try {
    const result = await callCloud('fundSectors', { codes: fundCodes })
    if (result && result.sectors) {
      const sectorsMap = result.sectors
      return fundCodes.map(code => ({
        code: code,
        sectors: sectorsMap[code] ? [sectorsMap[code]] : ['混合']
      }))
    }
    
    return fundCodes.map(code => ({ code, sectors: ['混合'] }))
  } catch (e) {
    console.error('获取基金板块失败:', e)
    return fundCodes.map(code => ({ code, sectors: ['混合'] }))
  }
}

/**
 * 获取基金十大持仓股
 */
export const getFundTopHoldings = async (fundCode) => {
  try {
    const result = await callCloud('fundHoldings', { code: fundCode })
    if (result && result.holdings) {
      return result.holdings
    }
    return []
  } catch (e) {
    console.error('获取基金持仓失败:', e)
    return []
  }
}

/**
 * 获取单个基金信息
 */
export const getFundInfo = async (fundCode) => {
  const detail = await getFundDetail(fundCode)
  
  if (!detail) {
    return {
      code: fundCode,
      name: '',
      sectors: ['混合']
    }
  }
  
  const sectorsResult = await getFundSectorsBatch([fundCode])
  
  return {
    code: fundCode,
    name: detail.name,
    sectors: sectorsResult[0]?.sectors || ['混合']
  }
}

export default {
  searchFund,
  getFundDetail,
  getFundEstimates,
  getFundInfo,
  getFundSectorsBatch,
  getFundTopHoldings
}
