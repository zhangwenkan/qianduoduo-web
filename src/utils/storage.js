/**
 * 本地存储工具
 */

import { isLoggedIn } from './user.js'
import { 
  getLocalHoldings, 
  saveLocalHoldings, 
  syncToCloud, 
  updateCloudHolding, 
  deleteCloudHolding,
  getCloudStats,
  smartSync
} from './sync.js'

const STORAGE_KEYS = {
  HOLDINGS: 'qdd_holdings'
}

/**
 * 获取持仓列表
 */
export const getHoldings = () => {
  return getLocalHoldings()
}

/**
 * 保存持仓列表
 */
export const saveHoldings = (holdings) => {
  saveLocalHoldings(holdings)
}

/**
 * 新增持仓
 */
export const addHolding = async (holding) => {
  const holdings = getHoldings()
  const newHolding = {
    id: Date.now().toString(),
    ...holding,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  holdings.push(newHolding)
  saveHoldings(holdings)
  
  // 同步到云端
  if (isLoggedIn()) {
    try {
      const cloudResult = await syncToCloud(newHolding)
      if (cloudResult && cloudResult._id) {
        // 更新本地ID为云端ID
        const index = holdings.findIndex(h => h.id === newHolding.id)
        if (index > -1) {
          holdings[index].id = cloudResult._id
          saveHoldings(holdings)
        }
      }
    } catch (e) {
      console.error('同步到云端失败:', e)
    }
  }
  
  return newHolding
}

/**
 * 更新持仓
 */
export const updateHolding = async (id, data) => {
  const holdings = getHoldings()
  const index = holdings.findIndex(h => h.id === id)
  if (index > -1) {
    holdings[index] = {
      ...holdings[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    saveHoldings(holdings)
    
    // 同步到云端
    if (isLoggedIn()) {
      try {
        await updateCloudHolding(id, data)
      } catch (e) {
        console.error('更新云端失败:', e)
      }
    }
    
    return holdings[index]
  }
  return null
}

/**
 * 删除持仓
 */
export const deleteHolding = async (id) => {
  const holdings = getHoldings()
  const newHoldings = holdings.filter(h => h.id !== id)
  saveHoldings(newHoldings)
  
  // 同步到云端
  if (isLoggedIn()) {
    try {
      await deleteCloudHolding(id)
    } catch (e) {
      console.error('删除云端失败:', e)
    }
  }
  
  return true
}

/**
 * 计算统计数据
 */
export const calculateStats = (holdings) => {
  if (!holdings || holdings.length === 0) {
    return {
      totalAmount: 0,
      totalProfit: 0,
      totalRate: 0,
      todayProfit: 0,
      todayRate: 0
    }
  }

  const totalAmount = holdings.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0)
  const totalProfit = holdings.reduce((sum, h) => sum + (parseFloat(h.profit) || 0), 0)
  const totalRate = totalAmount > 0 ? (totalProfit / totalAmount * 100) : 0
  const todayProfit = holdings.reduce((sum, h) => sum + (parseFloat(h.todayProfit) || 0), 0)
  const todayRate = totalAmount > 0 ? (todayProfit / totalAmount * 100) : 0

  return {
    totalAmount,
    totalProfit,
    totalRate,
    todayProfit,
    todayRate
  }
}

/**
 * 格式化金额
 */
export const formatMoney = (value, showSign = false) => {
  if (value === null || value === undefined || isNaN(value)) return '--'
  const num = parseFloat(value)
  
  if (showSign) {
    const formatted = Math.abs(num).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    if (num !== 0) {
      return num > 0 ? `+¥${formatted}` : `-¥${formatted}`
    }
    return `¥${formatted}`
  }
  
  const formatted = num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `¥${formatted}`
}

/**
 * 格式化百分比
 */
export const formatPercent = (value, showSign = true) => {
  if (value === null || value === undefined || isNaN(value)) return '--'
  const num = parseFloat(value)
  const formatted = Math.abs(num).toFixed(2)
  if (showSign && num !== 0) {
    return num > 0 ? `+${formatted}%` : `-${formatted}%`
  }
  return `${formatted}%`
}

/**
 * 同步数据
 */
export const syncData = async () => {
  return await smartSync()
}

export default {
  getHoldings,
  saveHoldings,
  addHolding,
  updateHolding,
  deleteHolding,
  calculateStats,
  formatMoney,
  formatPercent,
  syncData
}
