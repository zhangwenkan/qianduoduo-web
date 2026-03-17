/**
 * 数据同步工具
 * 管理本地和云端数据的同步
 */

import { callCloud } from './cloud.js'
import { isLoggedIn } from './user.js'

const SYNC_KEY = 'qdd_last_sync_time'
const LOCAL_HOLDINGS_KEY = 'qdd_holdings'

/**
 * 获取上次同步时间
 */
export const getLastSyncTime = () => {
  return uni.getStorageSync(SYNC_KEY) || null
}

/**
 * 设置上次同步时间
 */
export const setLastSyncTime = (time) => {
  uni.setStorageSync(SYNC_KEY, time)
}

/**
 * 获取本地持仓
 */
export const getLocalHoldings = () => {
  try {
    return uni.getStorageSync(LOCAL_HOLDINGS_KEY) || []
  } catch (e) {
    return []
  }
}

/**
 * 保存本地持仓
 */
export const saveLocalHoldings = (holdings) => {
  uni.setStorageSync(LOCAL_HOLDINGS_KEY, holdings)
}

/**
 * 从云端获取持仓列表
 */
export const getCloudHoldings = async () => {
  if (!isLoggedIn()) {
    return []
  }
  
  try {
    const result = await callCloud('holdings', { action: 'list' })
    return result.list || []
  } catch (e) {
    console.error('获取云端持仓失败:', e)
    return []
  }
}

/**
 * 同步持仓到云端
 */
export const syncToCloud = async (holding) => {
  if (!isLoggedIn()) {
    return null
  }
  
  try {
    const result = await callCloud('holdings', {
      action: 'add',
      fundCode: holding.fundCode,
      fundName: holding.fundName,
      amount: holding.amount,
      profit: holding.profit
    })
    return result
  } catch (e) {
    console.error('同步到云端失败:', e)
    throw e
  }
}

/**
 * 更新云端持仓
 */
export const updateCloudHolding = async (id, data) => {
  if (!isLoggedIn()) {
    return null
  }
  
  try {
    await callCloud('holdings', {
      action: 'update',
      id,
      ...data
    })
    return true
  } catch (e) {
    console.error('更新云端持仓失败:', e)
    throw e
  }
}

/**
 * 删除云端持仓
 */
export const deleteCloudHolding = async (id) => {
  if (!isLoggedIn()) {
    return null
  }
  
  try {
    await callCloud('holdings', {
      action: 'delete',
      id
    })
    return true
  } catch (e) {
    console.error('删除云端持仓失败:', e)
    throw e
  }
}

/**
 * 获取云端统计数据
 */
export const getCloudStats = async () => {
  if (!isLoggedIn()) {
    return null
  }
  
  try {
    return await callCloud('holdings', { action: 'stats' })
  } catch (e) {
    console.error('获取云端统计失败:', e)
    return null
  }
}

/**
 * 全量同步：将云端数据拉取到本地
 */
export const pullFromCloud = async () => {
  if (!isLoggedIn()) {
    return { success: false, message: '未登录' }
  }
  
  try {
    const cloudHoldings = await getCloudHoldings()
    
    // 转换云端数据格式为本地格式
    const localHoldings = cloudHoldings.map(item => ({
      id: item._id,
      fundCode: item.fundCode,
      fundName: item.fundName,
      amount: item.amount,
      profit: item.profit,
      todayProfit: item.todayProfit || 0,
      todayRate: item.todayRate || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
    
    saveLocalHoldings(localHoldings)
    setLastSyncTime(new Date().toISOString())
    
    return { success: true, count: localHoldings.length }
  } catch (e) {
    console.error('拉取云端数据失败:', e)
    return { success: false, message: e.message }
  }
}

/**
 * 推送本地数据到云端（首次同步）
 */
export const pushToCloud = async () => {
  if (!isLoggedIn()) {
    return { success: false, message: '未登录' }
  }
  
  try {
    const localHoldings = getLocalHoldings()
    let successCount = 0
    
    for (const holding of localHoldings) {
      try {
        await syncToCloud(holding)
        successCount++
      } catch (e) {
        console.error('推送失败:', holding.fundCode, e)
      }
    }
    
    setLastSyncTime(new Date().toISOString())
    return { success: true, count: successCount }
  } catch (e) {
    console.error('推送到云端失败:', e)
    return { success: false, message: e.message }
  }
}

/**
 * 智能同步：根据情况选择拉取或推送
 */
export const smartSync = async () => {
  if (!isLoggedIn()) {
    return { success: false, message: '未登录' }
  }
  
  const lastSync = getLastSyncTime()
  const localHoldings = getLocalHoldings()
  
  // 如果从未同步过
  if (!lastSync) {
    // 如果本地有数据，推送到云端
    if (localHoldings.length > 0) {
      return await pushToCloud()
    }
    // 否则从云端拉取
    return await pullFromCloud()
  }
  
  // 否则优先从云端拉取最新数据
  return await pullFromCloud()
}

export default {
  getLastSyncTime,
  setLastSyncTime,
  getLocalHoldings,
  saveLocalHoldings,
  getCloudHoldings,
  syncToCloud,
  updateCloudHolding,
  deleteCloudHolding,
  getCloudStats,
  pullFromCloud,
  pushToCloud,
  smartSync
}
