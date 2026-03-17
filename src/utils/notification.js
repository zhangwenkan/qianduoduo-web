/**
 * 消息通知工具
 */

const NOTIFICATION_KEY = 'qdd_notifications'
const SETTINGS_KEY = 'qdd_notification_settings'

/**
 * 默认通知设置
 */
const defaultSettings = {
  enabled: false,
  dailyReport: true,      // 每日收益报告
  profitAlert: true,      // 收益波动提醒
  threshold: 5,           // 波动阈值（百分比）
  quietHours: {           // 免打扰时段
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
}

/**
 * 获取通知设置
 */
export const getNotificationSettings = () => {
  try {
    const settings = uni.getStorageSync(SETTINGS_KEY)
    return { ...defaultSettings, ...settings }
  } catch (e) {
    return defaultSettings
  }
}

/**
 * 保存通知设置
 */
export const saveNotificationSettings = (settings) => {
  uni.setStorageSync(SETTINGS_KEY, settings)
}

/**
 * 获取通知列表
 */
export const getNotifications = () => {
  try {
    return uni.getStorageSync(NOTIFICATION_KEY) || []
  } catch (e) {
    return []
  }
}

/**
 * 添加通知
 */
export const addNotification = (notification) => {
  const notifications = getNotifications()
  const newNotification = {
    id: Date.now().toString(),
    ...notification,
    read: false,
    createdAt: new Date().toISOString()
  }
  notifications.unshift(newNotification)
  
  // 最多保留100条通知
  if (notifications.length > 100) {
    notifications.splice(100)
  }
  
  uni.setStorageSync(NOTIFICATION_KEY, notifications)
  return newNotification
}

/**
 * 标记通知为已读
 */
export const markAsRead = (id) => {
  const notifications = getNotifications()
  const index = notifications.findIndex(n => n.id === id)
  if (index > -1) {
    notifications[index].read = true
    uni.setStorageSync(NOTIFICATION_KEY, notifications)
  }
}

/**
 * 标记所有通知为已读
 */
export const markAllAsRead = () => {
  const notifications = getNotifications()
  notifications.forEach(n => n.read = true)
  uni.setStorageSync(NOTIFICATION_KEY, notifications)
}

/**
 * 删除通知
 */
export const deleteNotification = (id) => {
  const notifications = getNotifications()
  const newNotifications = notifications.filter(n => n.id !== id)
  uni.setStorageSync(NOTIFICATION_KEY, newNotifications)
}

/**
 * 清空所有通知
 */
export const clearNotifications = () => {
  uni.setStorageSync(NOTIFICATION_KEY, [])
}

/**
 * 获取未读数量
 */
export const getUnreadCount = () => {
  const notifications = getNotifications()
  return notifications.filter(n => !n.read).length
}

/**
 * 生成每日收益报告通知
 */
export const generateDailyReport = (stats) => {
  const settings = getNotificationSettings()
  if (!settings.enabled || !settings.dailyReport) return null
  
  const { totalProfit, todayProfit, todayRate } = stats
  const isPositive = todayProfit >= 0
  
  return addNotification({
    type: 'daily',
    title: '今日收益报告',
    content: `今日${isPositive ? '盈利' : '亏损'} ¥${Math.abs(todayProfit).toFixed(2)}（${isPositive ? '+' : ''}${todayRate.toFixed(2)}%），累计收益 ¥${totalProfit.toFixed(2)}`,
    icon: isPositive ? '📈' : '📉'
  })
}

/**
 * 生成收益波动提醒
 */
export const generateProfitAlert = (holding, change) => {
  const settings = getNotificationSettings()
  if (!settings.enabled || !settings.profitAlert) return null
  
  const absChange = Math.abs(change)
  if (absChange < settings.threshold) return null
  
  const isUp = change > 0
  
  return addNotification({
    type: 'alert',
    title: '收益波动提醒',
    content: `${holding.fundName} 今日${isUp ? '上涨' : '下跌'} ${absChange.toFixed(2)}%，请注意关注`,
    icon: isUp ? '🚀' : '⚠️',
    fundCode: holding.fundCode
  })
}

/**
 * 生成系统通知
 */
export const generateSystemNotice = (title, content) => {
  return addNotification({
    type: 'system',
    title,
    content,
    icon: '📢'
  })
}

/**
 * 检查是否在免打扰时段
 */
export const isInQuietHours = () => {
  const settings = getNotificationSettings()
  if (!settings.quietHours.enabled) return false
  
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const [startHour, startMin] = settings.quietHours.start.split(':').map(Number)
  const [endHour, endMin] = settings.quietHours.end.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  if (startMinutes > endMinutes) {
    // 跨天的情况，如 22:00 - 08:00
    return currentTime >= startMinutes || currentTime < endMinutes
  } else {
    return currentTime >= startMinutes && currentTime < endMinutes
  }
}

/**
 * 显示本地通知（小程序端）
 */
export const showLocalNotification = (title, content) => {
  const settings = getNotificationSettings()
  if (!settings.enabled) return
  if (isInQuietHours()) return
  
  // #ifdef MP-WEIXIN
  // 需要先获取用户授权
  wx.requestSubscribeMessage({
    tmplIds: ['your_template_id'], // 替换为实际的模板ID
    success: (res) => {
      console.log('订阅消息授权成功', res)
    },
    fail: (err) => {
      console.log('订阅消息授权失败', err)
    }
  })
  // #endif
  
  // H5端使用系统通知API
  // #ifdef H5
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: content })
  }
  // #endif
}

/**
 * 请求通知权限
 */
export const requestNotificationPermission = () => {
  // #ifdef H5
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        const settings = getNotificationSettings()
        settings.enabled = true
        saveNotificationSettings(settings)
      }
    })
  }
  // #endif
  
  // #ifdef MP-WEIXIN
  const settings = getNotificationSettings()
  settings.enabled = true
  saveNotificationSettings(settings)
  // #endif
}

export default {
  getNotificationSettings,
  saveNotificationSettings,
  getNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
  getUnreadCount,
  generateDailyReport,
  generateProfitAlert,
  generateSystemNotice,
  isInQuietHours,
  showLocalNotification,
  requestNotificationPermission
}
