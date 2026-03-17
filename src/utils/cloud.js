/**
 * 云函数调用工具 - HTTP 版本
 */

const API_BASE = 'https://qianduoduo.dpdns.org'

export const callCloud = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    if (name === 'fundSectors') {
      uni.request({
        url: `${API_BASE}/api/fund-sectors`,
        method: 'POST',
        data: data,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.code === 0) {
            resolve(res.data.data)
          } else {
            reject(new Error(res.data?.message || '请求失败'))
          }
        },
        fail: (err) => {
          console.error('API调用失败:', err)
          reject(err)
        }
      })
    } else if (name === 'fundHoldings') {
      uni.request({
        url: `${API_BASE}/api/fund-holdings`,
        method: 'POST',
        data: data,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.code === 0) {
            resolve(res.data.data)
          } else {
            reject(new Error(res.data?.message || '请求失败'))
          }
        },
        fail: (err) => {
          console.error('API调用失败:', err)
          reject(err)
        }
      })
    } else {
      reject(new Error('不支持的云函数: ' + name))
    }
  })
}

export default {
  callCloud
}
