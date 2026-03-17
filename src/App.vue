<script>
import { isLoggedIn, getLocalUser } from '@/utils/user.js'

export default {
  onLaunch() {
    console.log('App Launch')
    this.initApp()
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  methods: {
    async initApp() {
      // #ifdef MP-WEIXIN
      // 初始化云开发
      if (wx.cloud) {
        wx.cloud.init({
          env: 'your-env-id', // 替换为你的云开发环境ID
          traceUser: true
        })
      }
      // #endif
      
      // 检查登录状态
      const loggedIn = isLoggedIn()
      console.log('登录状态:', loggedIn)
    }
  }
}
</script>

<style lang="scss">
/* 全局样式 */
@import './uni.scss';

page {
  background-color: $bg-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif;
  color: $text-primary;
  min-height: 100vh;
}

/* 隐藏tabBar */
.uni-tabbar-bottom, .uni-tabbar {
  display: none !important;
}

/* 清除默认样式 */
view, text {
  box-sizing: border-box;
}

/* 安全区域适配 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>