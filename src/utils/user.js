/**
 * 用户状态管理
 */

import { callCloud } from './cloud.js'

const USER_KEY = 'qdd_user'

/**
 * 获取本地用户信息
 */
export const getLocalUser = () => {
  try {
    const data = uni.getStorageSync(USER_KEY)
    return data || null
  } catch (e) {
    return null
  }
}

/**
 * 保存用户信息到本地
 */
export const saveLocalUser = (user) => {
  try {
    uni.setStorageSync(USER_KEY, user)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 清除本地用户信息
 */
export const clearLocalUser = () => {
  try {
    uni.removeStorageSync(USER_KEY)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 检查是否登录
 */
export const isLoggedIn = () => {
  const user = getLocalUser()
  return !!user && !!user.openid
}

/**
 * 用户登录
 */
export const login = async (userInfo = {}) => {
  try {
    // #ifdef MP-WEIXIN
    // 微信小程序获取用户信息
    const { result } = await wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'login',
        userInfo
      }
    })
    
    if (result.code === 0) {
      const userData = result.data
      saveLocalUser(userData)
      return userData
    } else {
      throw new Error(result.message)
    }
    // #endif

    // #ifdef H5
    // H5端模拟登录
    const userData = await callCloud('user', {
      action: 'login',
      userInfo
    })
    saveLocalUser(userData)
    return userData
    // #endif
  } catch (e) {
    console.error('登录失败:', e)
    throw e
  }
}

/**
 * 获取用户信息
 */
export const getUserInfo = async () => {
  try {
    const data = await callCloud('user', { action: 'getUserInfo' })
    return data
  } catch (e) {
    console.error('获取用户信息失败:', e)
    throw e
  }
}

/**
 * 更新用户信息
 */
export const updateUserInfo = async (info) => {
  try {
    await callCloud('user', {
      action: 'updateUserInfo',
      ...info
    })
    
    // 更新本地缓存
    const user = getLocalUser()
    if (user) {
      saveLocalUser({ ...user, ...info })
    }
    
    return true
  } catch (e) {
    console.error('更新用户信息失败:', e)
    throw e
  }
}

/**
 * 退出登录
 */
export const logout = () => {
  clearLocalUser()
}

export default {
  getLocalUser,
  saveLocalUser,
  clearLocalUser,
  isLoggedIn,
  login,
  getUserInfo,
  updateUserInfo,
  logout
}
