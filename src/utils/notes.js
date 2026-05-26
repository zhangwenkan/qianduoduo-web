const STORAGE_KEY = 'qdd_notes'

const readAll = () => {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.error('读取笔记失败:', e)
    return []
  }
}

const writeAll = (list) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('保存笔记失败:', e)
  }
}

export const getNotes = () => {
  return readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export const getNoteById = (id) => {
  return readAll().find(n => n.id === id) || null
}

export const addNote = (content) => {
  const list = readAll()
  const now = Date.now()
  const note = {
    id: now.toString(),
    content: content || '',
    createdAt: now,
    updatedAt: now
  }
  list.push(note)
  writeAll(list)
  return note
}

export const updateNote = (id, content) => {
  const list = readAll()
  const index = list.findIndex(n => n.id === id)
  if (index === -1) return null
  list[index] = {
    ...list[index],
    content: content || '',
    updatedAt: Date.now()
  }
  writeAll(list)
  return list[index]
}

export const deleteNote = (id) => {
  const list = readAll().filter(n => n.id !== id)
  writeAll(list)
  return true
}

export const formatNoteTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const pad = (n) => n < 10 ? '0' + n : '' + n
  if (sameDay) {
    return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const sameYear = d.getFullYear() === now.getFullYear()
  if (sameYear) {
    return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const getNotePreview = (content, max = 40) => {
  if (!content) return '（空笔记）'
  const oneLine = content.replace(/\s+/g, ' ').trim()
  if (!oneLine) return '（空笔记）'
  return oneLine.length > max ? oneLine.slice(0, max) + '…' : oneLine
}
