<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的</text>
    </view>

    <view class="list">
      <view class="cell" hover-class="cell--hover" @click="goNotes">
        <view class="cell-main">
          <text class="cell-title">我的笔记</text>
        </view>
        <text class="cell-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const goNotes = () => {
  uni.navigateTo({ url: '/pages/notes/notes' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #faf8f5;
}

.header {
  padding: 80rpx 32rpx 24rpx;
}
.header-title {
  font-size: 56rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.list {
  margin: 24rpx 24rpx 0;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.cell {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  background: #ffffff;
}
.cell--hover {
  background: #f5f1ea;
}
.cell + .cell {
  border-top: 1rpx solid #f0ebe2;
}
.cell-main {
  flex: 1;
}
.cell-title {
  font-size: 30rpx;
  color: #1f1f1f;
}
.cell-arrow {
  font-size: 40rpx;
  color: #c8b9a2;
  line-height: 1;
  margin-left: 16rpx;
}
</style>
