<template>
  <view class="page">
    <view class="header">
      <text class="header-time">{{ note ? formatNoteTime(note.updatedAt) : '' }}</text>
      <view class="header-actions">
        <text
          v-if="!isEditing"
          class="btn btn-secondary"
          hover-class="btn--hover"
          @click="onDelete"
        >删除</text>
        <text
          v-if="!isEditing"
          class="btn btn-primary"
          hover-class="btn--hover"
          @click="startEdit"
        >编辑</text>
        <text
          v-if="isEditing"
          class="btn btn-secondary"
          hover-class="btn--hover"
          @click="cancelEdit"
        >取消</text>
        <text
          v-if="isEditing"
          class="btn btn-primary"
          hover-class="btn--hover"
          @click="save"
        >保存</text>
      </view>
    </view>

    <view class="body">
      <textarea
        v-if="isEditing"
        class="editor"
        v-model="draft"
        :focus="true"
        :auto-height="true"
        placeholder="写点什么…"
        placeholder-class="editor-placeholder"
        :maxlength="-1"
      />
      <view v-else class="viewer">
        <text v-if="note && note.content" class="viewer-text" :selectable="true">{{ note.content }}</text>
        <text v-else class="viewer-empty">（空笔记，点「编辑」开始写）</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNoteById, updateNote, deleteNote, formatNoteTime } from '@/utils/notes.js'

const note = ref(null)
const draft = ref('')
const isEditing = ref(false)

onLoad((query) => {
  const id = query?.id
  if (!id) {
    uni.showToast({ title: '笔记不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 600)
    return
  }
  const found = getNoteById(id)
  if (!found) {
    uni.showToast({ title: '笔记不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 600)
    return
  }
  note.value = found
  draft.value = found.content || ''
  if (query.edit === '1') {
    isEditing.value = true
  }
})

const startEdit = () => {
  draft.value = note.value?.content || ''
  isEditing.value = true
}

const cancelEdit = () => {
  if (!note.value) return
  const isNewEmpty = !note.value.content && !draft.value
  if (isNewEmpty) {
    deleteNote(note.value.id)
    uni.navigateBack()
    return
  }
  draft.value = note.value.content || ''
  isEditing.value = false
}

const save = () => {
  if (!note.value) return
  const updated = updateNote(note.value.id, draft.value)
  if (updated) {
    note.value = updated
    isEditing.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
  }
}

const onDelete = () => {
  if (!note.value) return
  uni.showModal({
    title: '删除笔记',
    content: '删除后不可恢复，确定吗？',
    confirmText: '删除',
    confirmColor: '#d33',
    success: (res) => {
      if (res.confirm) {
        deleteNote(note.value.id)
        uni.navigateBack()
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #faf8f5;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx 16rpx;
}
.header-time {
  font-size: 26rpx;
  color: #a89880;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.btn {
  font-size: 28rpx;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  line-height: 1.4;
}
.btn--hover {
  opacity: 0.7;
}
.btn-primary {
  background: #d97706;
  color: #ffffff;
}
.btn-secondary {
  background: #f0ebe2;
  color: #5c503f;
}

.body {
  flex: 1;
  margin: 24rpx 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.editor {
  width: 100%;
  min-height: 600rpx;
  font-size: 30rpx;
  color: #1f1f1f;
  line-height: 1.6;
}
.editor-placeholder {
  color: #c8b9a2;
}

.viewer {
  min-height: 200rpx;
}
.viewer-text {
  font-size: 30rpx;
  color: #1f1f1f;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
.viewer-empty {
  font-size: 28rpx;
  color: #a89880;
}
</style>
