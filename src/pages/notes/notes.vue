<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的笔记</text>
      <text class="header-action" hover-class="header-action--hover" @click="createNew">新建</text>
    </view>

    <view v-if="notes.length === 0" class="empty">
      <text class="empty-text">还没有笔记</text>
      <text class="empty-hint">点击右上角「新建」写下第一条</text>
    </view>

    <view v-else class="list">
      <view
        v-for="note in notes"
        :key="note.id"
        class="item"
        hover-class="item--hover"
        @click="openDetail(note.id)"
      >
        <text class="item-preview">{{ getNotePreview(note.content, 60) }}</text>
        <text class="item-time">{{ formatNoteTime(note.updatedAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getNotes, addNote, formatNoteTime, getNotePreview } from '@/utils/notes.js'

const notes = ref([])

const reload = () => {
  notes.value = getNotes()
}

onShow(() => {
  reload()
})

const createNew = () => {
  const note = addNote('')
  uni.navigateTo({ url: `/pages/notes/detail?id=${note.id}&edit=1` })
}

const openDetail = (id) => {
  uni.navigateTo({ url: `/pages/notes/detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #faf8f5;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 80rpx 32rpx 24rpx;
}
.header-title {
  font-size: 56rpx;
  font-weight: 600;
  color: #1f1f1f;
}
.header-action {
  font-size: 30rpx;
  color: #d97706;
  padding: 12rpx 20rpx;
  border-radius: 30rpx;
}
.header-action--hover {
  background: rgba(217, 119, 6, 0.08);
}

.empty {
  margin-top: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-text {
  font-size: 32rpx;
  color: #1f1f1f;
}
.empty-hint {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #a89880;
}

.list {
  margin: 24rpx 24rpx 0;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.item {
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}
.item--hover {
  background: #f5f1ea;
}
.item + .item {
  border-top: 1rpx solid #f0ebe2;
}
.item-preview {
  font-size: 30rpx;
  color: #1f1f1f;
  line-height: 1.5;
  /* clamp to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.item-time {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #a89880;
}
</style>
