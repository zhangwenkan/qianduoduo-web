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
        <view
          class="holding-item"
          :class="{ 'is-active': activeHoldingIndex === index }"
          v-for="(item, index) in topHoldings"
          :key="item.code"
          :style="getHoldingStyle(index)"
        >
          <view class="holding-face holding-main">
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
      topHoldings: [],
      activeHoldingIndex: 0,
      holdingTimer: null
    }
  },
  
  onLoad(options) {
    this.fundCode = options.code || ''
    this.fundName = decodeURIComponent(options.name || '未命名基金')
    if (this.fundCode) {
      this.loadDetail()
    }
  },

  onUnload() {
    this.clearHoldingAnimation()
  },

  methods: {
    goBack() {
      uni.navigateBack()
    },

    getHoldingTone(index) {
      const tones = [
        { front: '#b39be8', side: '#b39be8', top: '#b39be8' },
        { front: '#bea8eb', side: '#bea8eb', top: '#bea8eb' },
        { front: '#c9b5ee', side: '#c9b5ee', top: '#c9b5ee' },
        { front: '#d3c2f1', side: '#d3c2f1', top: '#d3c2f1' },
        { front: '#ddcff3', side: '#ddcff3', top: '#ddcff3' },
        { front: '#e6dbf6', side: '#e6dbf6', top: '#e6dbf6' },
        { front: '#eee5f8', side: '#eee5f8', top: '#eee5f8' },
        { front: '#f4ecfa', side: '#f4ecfa', top: '#f4ecfa' },
        { front: '#f8f1fc', side: '#f8f1fc', top: '#f8f1fc' },
        { front: '#fcf7fe', side: '#fcf7fe', top: '#fcf7fe' }
      ]
      return tones[index] || tones[tones.length - 1]
    },

    getHoldingStyle(index) {
      const tone = this.getHoldingTone(index)
      return `--i:${this.topHoldings.length - index};--tone:${tone.front};--tone-side:${tone.side};--tone-top:${tone.top}`
    },

    startHoldingAnimation() {
      this.clearHoldingAnimation()
      if (!this.topHoldings.length) {
        this.activeHoldingIndex = 0
        return
      }
      this.activeHoldingIndex = 0
      if (this.topHoldings.length === 1) {
        return
      }
      this.holdingTimer = setInterval(() => {
        this.activeHoldingIndex = (this.activeHoldingIndex + 1) % this.topHoldings.length
      }, 3000)
    },

    clearHoldingAnimation() {
      if (this.holdingTimer) {
        clearInterval(this.holdingTimer)
        this.holdingTimer = null
      }
    },

    parseHoldingPercent(value) {
      const num = parseFloat(String(value || '').replace('%', ''))
      return Number.isFinite(num) ? num : 0
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
        this.topHoldings = (holdings || []).slice().sort((a, b) => this.parseHoldingPercent(b.percent) - this.parseHoldingPercent(a.percent))
        this.startHoldingAnimation()
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
  padding-bottom: 80rpx;
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
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 40rpx 0 0 40rpx;
  transform: skewY(-14deg);
}

.holding-item {
  position: relative;
  list-style: none;
  width: 100%;
  z-index: var(--i);
  transition: 0.3s;
  color: #fff;
}

.holding-item::before,
.holding-item::after {
  position: absolute;
  content: '';
  transition: 0.3s;
}

.holding-item::before {
  background: var(--tone-side);
  top: 0;
  left: -40rpx;
  width: 40rpx;
  height: 100%;
  transform-origin: right;
  transform: skewY(45deg);
}

.holding-item::after {
  background: var(--tone-top);
  width: 100%;
  height: 40rpx;
  top: -40rpx;
  left: 0;
  transform-origin: bottom;
  transform: skewX(45deg);
}

.holding-item.is-active {
  transform: translateX(-20rpx);
}

.holding-face {
  width: 100%;
  min-height: 40px;
  position: relative;
  padding: 18rpx 22rpx;
  box-sizing: border-box;
  background: var(--tone);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.holding-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
  flex: 1;
}

.holding-rank {
  min-width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  color: #111;
  background: rgba(255, 255, 255, 0.35);
}

.holding-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.holding-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.holding-code {
  font-size: 20rpx;
  color: #222;
}

.holding-right {
  flex-shrink: 0;
  margin-left: 20rpx;
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
