<template>
  <view class="page">
    <view class="bg-grid"></view>
    
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">{{ fundName }}</text>
      <view class="placeholder"></view>
    </view>
    
    <view class="fund-info-card">
      <view class="fund-code-row">
        <text class="fund-code">{{ fundCode }}</text>
      </view>
      <view class="fund-value">
        <text class="value-label">单位净值</text>
        <text class="value-num">{{ nav || '--' }}</text>
        <text class="value-date" v-if="navDate">({{ navDate }})</text>
      </view>
      <view class="estimate-row" v-if="estimatedNav">
        <text class="estimate-label">估值</text>
        <text class="estimate-value" :class="estimatedPercent >= 0 ? 'red' : 'green'">{{ estimatedNav }}</text>
        <text class="estimate-percent" :class="estimatedPercent >= 0 ? 'red' : 'green'">
          {{ estimatedPercent >= 0 ? '+' : '' }}{{ estimatedPercent }}%
        </text>
        <text class="estimate-time" v-if="timeDesc">{{ timeDesc }}</text>
      </view>
    </view>
    
    <view class="section" v-if="topHoldings.length > 0">
      <text class="section-title">十大持仓股</text>
      <view class="holdings-list">
        <view class="holding-item" v-for="item in topHoldings" :key="item.code">
          <view class="holding-left">
            <text class="holding-rank">{{ item.rank }}</text>
            <view class="holding-info">
              <text class="holding-name">{{ item.name }}</text>
              <text class="holding-code">{{ item.code }}</text>
            </view>
          </view>
          <view class="holding-right">
            <text class="holding-percent" :class="parseFloat(item.percent) >= 0 ? 'red' : 'green'">{{ item.percent }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section empty-section" v-if="!loading && topHoldings.length === 0">
      <text class="empty-text">暂无持仓数据</text>
    </view>
    
    <view class="loading" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getFundDetail, getFundTopHoldings } from '@/utils/api.js'

export default {
  data() {
    return {
      fundCode: '',
      fundName: '',
      loading: false,
      nav: null,
      navDate: '',
      estimatedNav: null,
      estimatedPercent: null,
      timeDesc: '',
      topHoldings: []
    }
  },
  
  onLoad(options) {
    this.fundCode = options.code || ''
    this.fundName = decodeURIComponent(options.name || '未命名基金')
    if (this.fundCode) {
      this.loadDetail()
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    async loadDetail() {
      this.loading = true
      try {
        const detail = await getFundDetail(this.fundCode)
        if (detail) {
          this.nav = detail.nav
          this.navDate = detail.navDate
          this.estimatedNav = detail.estimatedNav
          this.estimatedPercent = detail.estimatedPercent
          this.timeDesc = detail.timeDesc
        }
        
        const holdings = await getFundTopHoldings(this.fundCode)
        this.topHoldings = holdings || []
      } catch (e) {
        console.error('获取基金详情失败:', e)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
  background: #faf8f5;
}

.bg-grid {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(180, 130, 70, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(180, 130, 70, 0.03) 1px, transparent 1px);
  background-size: 80rpx 80rpx;
  pointer-events: none;
  z-index: 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  border: 1px solid rgba(180, 130, 70, 0.2);
  
  &:active {
    transform: scale(0.95);
  }
}

.back-icon {
  font-size: 32rpx;
  color: $text-primary;
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  width: 64rpx;
}

.fund-info-card {
  background: linear-gradient(135deg, 
    rgba(254, 243, 199, 0.9) 0%, 
    rgba(253, 230, 138, 0.7) 50%,
    rgba(252, 211, 77, 0.5) 100%);
  border: 1px solid rgba(217, 119, 6, 0.2);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 10;
}

.fund-code-row {
  margin-bottom: 24rpx;
}

.fund-code {
  font-size: 24rpx;
  color: $text-tertiary;
  background: rgba(180, 130, 70, 0.15);
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
}

.fund-value {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  flex-wrap: wrap;
}

.value-label {
  font-size: 24rpx;
  color: $text-secondary;
}

.value-num {
  font-size: 56rpx;
  font-weight: 800;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.value-date {
  font-size: 22rpx;
  color: $text-tertiary;
}

.estimate-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid rgba(217, 119, 6, 0.2);
}

.estimate-label {
  font-size: 24rpx;
  color: $text-secondary;
}

.estimate-value {
  font-size: 32rpx;
  font-weight: 700;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.estimate-percent {
  font-size: 28rpx;
  font-weight: 700;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.estimate-time {
  font-size: 20rpx;
  color: $text-tertiary;
  background: rgba(180, 130, 70, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.section {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(180, 130, 70, 0.1);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 10;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 20rpx;
  display: block;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1px solid rgba(180, 130, 70, 0.08);
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: $text-secondary;
}

.info-value {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 500;
}

.sector-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.sector-tag {
  font-size: 24rpx;
  color: $accent-terracotta;
  background: rgba(217, 119, 6, 0.1);
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.holdings-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.holding-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  border: 1px solid rgba(180, 130, 70, 0.1);
}

.holding-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.holding-rank {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(180, 83, 9, 0.15) 100%);
  border-radius: 50%;
  font-size: 22rpx;
  font-weight: 700;
  color: $accent-terracotta;
}

.holding-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.holding-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.holding-code {
  font-size: 20rpx;
  color: $text-tertiary;
}

.holding-right {
  flex-shrink: 0;
}

.holding-percent {
  font-size: 28rpx;
  font-weight: 700;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.empty-section {
  text-align: center;
  padding: 60rpx 40rpx;
}

.empty-text {
  font-size: 26rpx;
  color: $text-tertiary;
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.loading-text {
  font-size: 28rpx;
  color: $text-tertiary;
}
</style>
