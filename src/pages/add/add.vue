<template>
  <view class="page">
    <!-- 背景装饰 -->
    <view class="bg-grid"></view>
    <view class="bg-glow bg-glow-1"></view>
    <view class="bg-glow bg-glow-2"></view>

    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">{{ isEdit ? '编辑持仓' : '新增持仓' }}</text>
      <view class="header-right"></view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 基金代码 -->
      <view class="form-section">
        <text class="form-label">基金代码</text>
        <input 
          class="form-input" 
          v-model="form.fundCode"
          placeholder="输入基金代码，如 161725"
          maxlength="6"
          :disabled="isEdit"
          @input="onFundCodeInput"
        />
        
        <!-- 搜索结果 -->
        <view class="search-result" v-if="searchResults.length > 0 && showSearch">
          <view 
            class="search-result-item" 
            v-for="item in searchResults" 
            :key="item.code"
            @tap="selectFund(item)"
          >
            <view class="result-info">
              <text class="result-name">{{ item.name }}</text>
              <text class="result-code">{{ item.code }}</text>
            </view>
            <text class="result-type">{{ item.type || '基金' }}</text>
          </view>
        </view>
      </view>

      <!-- 持有金额 -->
      <view class="form-section">
        <text class="form-label">持有金额</text>
        <view class="input-wrapper">
          <text class="input-prefix">¥</text>
          <input 
            class="form-input form-input-lg input-with-prefix" 
            v-model="form.amount"
            type="digit"
            placeholder="0.00"
          />
        </view>
      </view>

      <!-- 持有收益 -->
      <view class="form-section">
        <text class="form-label">持有收益</text>
        <input 
          class="form-input form-input-lg" 
          v-model="form.profit"
          type="digit"
          placeholder="+/- 0.00"
        />
      </view>

      <!-- 收益预览 -->
      <view class="preview-card">
        <text class="preview-title">收益预览</text>
        <view class="preview-stats">
          <view class="preview-item">
            <text class="preview-item-label">累计收益率</text>
            <text class="preview-item-value" :class="preview.rate >= 0 ? 'red' : 'green'">
              {{ preview.rate >= 0 ? '+' : '' }}{{ preview.rate.toFixed(2) }}%
            </text>
          </view>
          <view class="preview-item">
            <text class="preview-item-label">今日估算盈亏</text>
            <text class="preview-item-value" :class="preview.today >= 0 ? 'red' : 'green'">
              {{ preview.today >= 0 ? '+' : '-' }}¥{{ Math.abs(preview.today).toFixed(2) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" :disabled="!canSubmit" @tap="submit">
        {{ isEdit ? '保存修改' : '确认添加' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getHoldings, addHolding, updateHolding, deleteHolding as deleteHoldingStorage } from '@/utils/storage.js'
import { searchFund, getFundDetail } from '@/utils/api.js'

export default {
  data() {
    return {
      isEdit: false,
      editId: null,
      form: {
        fundCode: '',
        fundName: '',
        amount: '',
        profit: ''
      },
      searchResults: [],
      showSearch: false,
      preview: {
        rate: 0,
        today: 0
      }
    }
  },
  computed: {
    canSubmit() {
      return this.form.fundCode.length >= 6 && 
             parseFloat(this.form.amount) > 0 && 
             this.form.profit !== ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.editId = options.id
      this.loadHolding(options.id)
    }
  },
  watch: {
    'form.amount'() {
      this.calculatePreview()
    },
    'form.profit'() {
      this.calculatePreview()
    },
    'form.fundCode'() {
      this.calculatePreview()
    }
  },
  methods: {
    // 加载持仓数据
    async loadHolding(id) {
      const holdings = getHoldings()
      const holding = holdings.find(h => h.id === id)
      if (holding) {
        this.form = {
          fundCode: holding.fundCode,
          fundName: holding.fundName,
          amount: holding.amount.toString(),
          profit: holding.profit.toString()
        }
        // 加载数据后计算预览
        await this.calculatePreview()
      }
    },
    
    // 基金代码输入
    onFundCodeInput(value) {
      const code = this.form.fundCode
      if (code.length >= 2) {
        this.searchFunds(code)
        this.showSearch = true
      } else {
        this.searchResults = []
        this.showSearch = false
      }
    },
    
    // 搜索基金
    async searchFunds(keyword) {
      try {
        this.searchResults = await searchFund(keyword)
      } catch (e) {
        console.error('搜索基金失败:', e)
      }
    },
    
    // 选择基金
    selectFund(fund) {
      this.form.fundCode = fund.code
      this.form.fundName = fund.name
      this.showSearch = false
      this.searchResults = []
    },
    
    // 计算预览
    async calculatePreview() {
      const amount = parseFloat(this.form.amount) || 0
      const profit = parseFloat(this.form.profit) || 0
      
      // 累计收益率
      this.preview.rate = amount > 0 ? (profit / amount * 100) : 0
      
      // 今日估算（从API获取）
      if (this.form.fundCode.length >= 6 && amount > 0) {
        try {
          const detail = await getFundDetail(this.form.fundCode)
          if (detail && detail.estimatedPercent) {
            // 今日估算盈亏 = 持有金额 × 估算涨跌幅
            const estimatedPercent = parseFloat(detail.estimatedPercent) || 0
            this.preview.today = amount * (estimatedPercent / 100)
          } else {
            this.preview.today = 0
          }
        } catch (e) {
          console.error('获取今日估算失败:', e)
          this.preview.today = 0
        }
      } else {
        this.preview.today = 0
      }
    },
    
    // 提交
    async submit() {
      if (!this.canSubmit) return
      
      uni.showLoading({ title: '保存中...' })
      
      try {
        // 获取基金详情
        let fundName = this.form.fundName
        if (!fundName) {
          const detail = await getFundDetail(this.form.fundCode)
          fundName = detail?.name || '未知基金'
        }
        
        const data = {
          fundCode: this.form.fundCode,
          fundName: fundName,
          amount: parseFloat(this.form.amount),
          profit: parseFloat(this.form.profit)
        }
        
        if (this.isEdit) {
          await updateHolding(this.editId, data)
        } else {
          await addHolding(data)
        }
        
        uni.hideLoading()
        uni.showToast({
          title: this.isEdit ? '修改成功' : '添加成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
        
      } catch (e) {
        uni.hideLoading()
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    },
    
    // 删除
    async deleteHolding() {
      uni.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除吗？',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '删除中...' })
            await deleteHoldingStorage(this.editId)
            uni.hideLoading()
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            setTimeout(() => {
              uni.navigateBack()
            }, 1000)
          }
        }
      })
    },
    
    // 返回
    goBack() {
      uni.navigateBack()
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
}

/* 背景装饰 */
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

.bg-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(200rpx);
  pointer-events: none;
  z-index: 0;
  
  &.bg-glow-1 {
    width: 600rpx;
    height: 600rpx;
    background: radial-gradient(circle, rgba(217, 119, 6, 0.18) 0%, transparent 70%);
    top: -160rpx;
    right: -120rpx;
  }
  
  &.bg-glow-2 {
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%);
    bottom: 400rpx;
    left: -160rpx;
  }
}

/* 头部 */
.header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-sm;
  background: $glass-bg;
  border: 1px solid $border-card;
  backdrop-filter: $glass-blur;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    background: $accent-cream;
  }
}

.back-icon {
  font-size: 40rpx;
  color: $text-primary;
}

.header-title {
  font-size: 48rpx;
  font-weight: 600;
  color: $text-primary;
}

.header-right {
  margin-left: auto;
}

.delete-btn {
  font-size: 28rpx;
  color: $accent-red;
  padding: 16rpx 24rpx;
}

/* 表单 */
.form {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 160rpx);
}

.form-section {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 24rpx;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}

.form-input {
  max-width: 100%;
  background: $glass-bg;
  border: 1px solid $border-card;
  border-radius: $radius-lg;
  padding: 20rpx 24rpx;
  font-size: 32rpx;
  color: $text-primary;
  backdrop-filter: $glass-blur;
  box-shadow: $shadow-sm;
  
  &:focus {
    border-color: $accent-gold;
    background: rgba(255, 252, 247, 0.8);
    box-shadow: $shadow-md, 0 0 0 6rpx rgba(217, 119, 6, 0.1);
  }
}

.form-input-lg {
  font-size: 48rpx;
  font-weight: 700;
  padding: 28rpx 32rpx;
  letter-spacing: -2rpx;
}

.input-wrapper {
  position: relative;
}

.input-prefix {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 48rpx;
  font-weight: 700;
  color: $text-tertiary;
  z-index: 1;
}

.input-with-prefix {
  padding-left: 96rpx;
}

/* 搜索结果 */
.search-result {
  background: $glass-bg;
  border: 1px solid $border-card;
  border-radius: $radius-md;
  backdrop-filter: $glass-blur;
  margin-top: 20rpx;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.search-result-item {
  padding: 32rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-card;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: $accent-cream;
  }
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.result-name {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.result-code {
  font-size: 24rpx;
  color: $text-tertiary;
}

.result-type {
  font-size: 24rpx;
  color: $text-secondary;
  background: rgba(180, 130, 70, 0.1);
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  font-weight: 600;
}

/* 预览卡片 */
.preview-card {
  background: $glass-bg;
  border: 1px solid $border-card;
  border-radius: $radius-xl;
  backdrop-filter: $glass-blur;
  padding: 24rpx;
  box-shadow: $shadow-md;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8rpx;
    background: linear-gradient(90deg, $accent-gold, $accent-amber, $accent-terracotta);
  }
}

.preview-title {
  font-size: 24rpx;
  color: $text-tertiary;
  margin-bottom: 16rpx;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  font-weight: 600;
  display: block;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.preview-item {
  text-align: center;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: $radius-md;
  border: 1px solid $border-card;
}

.preview-item-label {
  font-size: 24rpx;
  color: $text-tertiary;
  margin-bottom: 16rpx;
  font-weight: 600;
  display: block;
}

.preview-item-value {
  font-size: 32rpx;
  font-weight: 700;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

/* 提示 */
.tips {
  margin-top: 48rpx;
  padding: 36rpx 44rpx;
  background: $accent-cream;
  border: 1px solid rgba(217, 119, 6, 0.2);
  border-radius: $radius-md;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: $accent-terracotta;
  margin-bottom: 16rpx;
}

.tips-icon {
  font-size: 36rpx;
}

.tips-content {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.6;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 28rpx 40rpx;
  background: linear-gradient(135deg, $accent-gold, $accent-terracotta);
  border: none;
  border-radius: $radius-lg;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-top: auto;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(217, 119, 6, 0.3);
  
  &:disabled {
    opacity: 0.4;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}
</style>
