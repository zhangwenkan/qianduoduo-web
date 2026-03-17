<template>
  <view class="page">
    <!-- 背景装饰 -->
    <view class="bg-grid"></view>
    <view class="bg-glow bg-glow-1"></view>
    <view class="bg-glow bg-glow-2"></view>
    <view class="bg-glow bg-glow-3"></view>

    <!-- 头部 -->
    <view class="header">
      <view class="header-left">
        <text class="header-title">钱多多</text>
        <text class="header-subtitle">让收益看得见</text>
      </view>
    </view>

    <!-- 统计卡片 Bento Grid -->
    <view class="bento-grid">
      <!-- 累计收益 -->
      <view class="bento-card bento-card-main span-2">
        <text class="card-label">累计收益</text>
        <text class="card-value large" :class="stats.totalProfit >= 0 ? 'red' : 'green'">
          {{ formatMoney(stats.totalProfit, true) }}
        </text>
        <view class="stat-pills">
          <view class="stat-pill" :class="stats.totalProfit >= 0 ? 'up' : 'down'">
            <text class="arrow">{{ stats.totalProfit >= 0 ? '↑' : '↓' }}</text>
            <text>{{ formatPercent(stats.totalRate) }}</text>
          </view>
          <view class="stat-pill">
            <text>{{ holdings.length }} 支基金</text>
          </view>
        </view>
      </view>

      <!-- 今日盈亏 -->
      <view class="bento-card">
        <text class="card-label">今日盈亏</text>
        <text class="card-value" :class="stats.todayProfit >= 0 ? 'red' : 'green'">
          {{ formatMoney(stats.todayProfit, true) }}
        </text>
        <view class="today-badge" :class="stats.todayProfit >= 0 ? 'up' : 'down'">
          <text class="arrow">{{ stats.todayProfit >= 0 ? '↑' : '↓' }}</text>
          <text>{{ formatPercent(stats.todayRate) }}</text>
        </view>
      </view>

      <!-- 持有金额 -->
      <view class="bento-card">
        <text class="card-label">持有金额</text>
        <text class="card-value">{{ formatMoney(stats.totalAmount) }}</text>
        <text class="card-sub">总资产</text>
      </view>
    </view>

    <!-- 持仓列表 -->
    <view class="section-header">
      <text class="section-title">我的持仓</text>
      <view class="sort-control">
        <picker mode="selector" :range="sortOptions" range-key="label" @change="onSortTypeChange">
          <view class="sort-picker">
            <text class="sort-label">{{ currentSortLabel }}</text>
            <text class="sort-arrow">▼</text>
          </view>
        </picker>
        <view class="sort-order-btn" @tap="toggleSortOrder">
          <image v-if="sortOrder === 'up'" class="sort-icon" src="data:image/svg+xml,%3Csvg viewBox='0 0 510.933 510.933' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon fill='%23fb5050' points='297.133,296.6 297.133,194.2 356.867,194.2 254.467,6.467 152.067,194.2 211.8,194.2 211.8,296.6'/%3E%3Cpath fill='%23fb5050' d='M280.067,347.8c0,9.387-7.68,17.067-17.067,17.067h-17.067c-9.387,0-17.067-7.68-17.067-17.067s7.68-17.067,17.067-17.067H263C272.387,330.733,280.067,338.413,280.067,347.8'/%3E%3Cpath fill='%23FFA800' d='M280.067,347.8c0,9.387-7.68,17.067-17.067,17.067h17.067c9.387,0,17.067-7.68,17.067-17.067s-7.68-17.067-17.067-17.067H263C272.387,330.733,280.067,338.413,280.067,347.8'/%3E%3Cpath fill='%23FFFFFF' d='M228.867,364.867h17.067c-9.387,0-17.067-7.68-17.067-17.067s7.68-17.067,17.067-17.067h-17.067c-9.387,0-17.067,7.68-17.067,17.067S219.48,364.867,228.867,364.867'/%3E%3Cpath fill='%23fb5050' d='M280.067,416.067c0,9.387-7.68,17.067-17.067,17.067h-17.067c-9.387,0-17.067-7.68-17.067-17.067s7.68-17.067,17.067-17.067H263C272.387,399,280.067,406.68,280.067,416.067'/%3E%3Cpath fill='%23FFA800' d='M280.067,416.067c0,9.387-7.68,17.067-17.067,17.067h17.067c9.387,0,17.067-7.68,17.067-17.067S289.453,399,280.067,399H263C272.387,399,280.067,406.68,280.067,416.067'/%3E%3Cpath fill='%23FFFFFF' d='M228.867,433.133h17.067c-9.387,0-17.067-7.68-17.067-17.067S236.547,399,245.933,399h-17.067c-9.387,0-17.067,7.68-17.067,17.067S219.48,433.133,228.867,433.133'/%3E%3Cpath fill='%23fb5050' d='M280.067,484.333c0,9.387-7.68,17.067-17.067,17.067h-17.067c-9.387,0-17.067-7.68-17.067-17.067s7.68-17.067,17.067-17.067H263C272.387,467.267,280.067,474.947,280.067,484.333'/%3E%3Cpath fill='%23FFA800' d='M280.067,484.333c0,9.387-7.68,17.067-17.067,17.067h17.067c9.387,0,17.067-7.68,17.067-17.067c0-9.387-7.68-17.067-17.067-17.067H263C272.387,467.267,280.067,474.947,280.067,484.333'/%3E%3Cpath fill='%23FFFFFF' d='M228.867,501.4h17.067c-9.387,0-17.067-7.68-17.067-17.067c0-9.387,7.68-17.067,17.067-17.067h-17.067c-9.387,0-17.067,7.68-17.067,17.067C211.8,493.72,219.48,501.4,228.867,501.4'/%3E%3Cpath fill='%23000000' d='M280.067,373.4h-51.2c-14.507,0-25.6-11.093-25.6-25.6s11.093-25.6,25.6-25.6h51.2c14.507,0,25.6,11.093,25.6,25.6S294.573,373.4,280.067,373.4z M228.867,339.267c-5.12,0-8.533,3.413-8.533,8.533s3.413,8.533,8.533,8.533h51.2c5.12,0,8.533-3.413,8.533-8.533s-3.413-8.533-8.533-8.533H228.867z'/%3E%3Cpath fill='%23000000' d='M280.067,441.667h-51.2c-14.507,0-25.6-11.093-25.6-25.6c0-14.507,11.093-25.6,25.6-25.6h51.2c14.507,0,25.6,11.093,25.6,25.6C305.667,430.573,294.573,441.667,280.067,441.667z M228.867,407.533c-5.12,0-8.533,3.413-8.533,8.533c0,5.12,3.413,8.533,8.533,8.533h51.2c5.12,0,8.533-3.413,8.533-8.533c0-5.12-3.413-8.533-8.533-8.533H228.867z'/%3E%3Cpath fill='%23000000' d='M280.067,509.933h-51.2c-14.507,0-25.6-11.093-25.6-25.6c0-14.507,11.093-25.6,25.6-25.6h51.2c14.507,0,25.6,11.093,25.6,25.6C305.667,498.84,294.573,509.933,280.067,509.933z M228.867,475.8c-5.12,0-8.533,3.413-8.533,8.533c0,5.12,3.413,8.533,8.533,8.533h51.2c5.12,0,8.533-3.413,8.533-8.533c0-5.12-3.413-8.533-8.533-8.533H228.867z'/%3E%3Cpath fill='%23000000' d='M297.133,305.133H211.8c-5.12,0-8.533-3.413-8.533-8.533v-93.867h-85.333c-3.413,0-5.973-1.707-7.68-4.267s-0.853-5.973,0.853-8.533L247.64,2.2c3.413-4.267,10.24-4.267,13.653,0l136.533,187.733c1.707,2.56,2.56,5.973,0.853,8.533c-1.707,2.56-4.267,4.267-7.68,4.267H305.667V296.6C305.667,301.72,302.253,305.133,297.133,305.133z M220.333,288.067H288.6V194.2c0-5.12,3.413-8.533,8.533-8.533h76.8L254.467,22.067L135,185.667h76.8c5.12,0,8.533,3.413,8.533,8.533V288.067z'/%3E%3C/svg%3E" mode="aspectFit" />
          <image v-else class="sort-icon" src="data:image/svg+xml,%3Csvg viewBox='0 0 510.933 510.933' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon fill='%2323d138' points='297.133,194.2 297.133,296.6 211.8,296.6 211.8,194.2 152.067,194.2 254.467,506.467 356.867,194.2'/%3E%3Cpath fill='%2323d138' d='M280.067,163.2c0-9.387-7.68-17.067-17.067-17.067h-17.067c-9.387,0-17.067,7.68-17.067,17.067s7.68,17.067,17.067,17.067H263C272.387,180.267,280.067,172.587,280.067,163.2'/%3E%3Cpath fill='%23FFA800' d='M280.067,163.2c0-9.387-7.68-17.067-17.067-17.067h17.067c9.387,0,17.067,7.68,17.067,17.067s-7.68,17.067-17.067,17.067H263C272.387,180.267,280.067,172.587,280.067,163.2'/%3E%3Cpath fill='%23FFFFFF' d='M228.867,146.133h17.067c-9.387,0-17.067,7.68-17.067,17.067s7.68,17.067,17.067,17.067h-17.067c-9.387,0-17.067-7.68-17.067-17.067S219.48,146.133,228.867,146.133'/%3E%3Cpath fill='%2323d138' d='M280.067,94.933c0-9.387-7.68-17.067-17.067-17.067h-17.067c-9.387,0-17.067,7.68-17.067,17.067s7.68,17.067,17.067,17.067H263C272.387,112,280.067,104.32,280.067,94.933'/%3E%3Cpath fill='%23FFA800' d='M280.067,94.933c0-9.387-7.68-17.067-17.067-17.067h17.067c9.387,0,17.067,7.68,17.067,17.067S289.453,112,280.067,112H263C272.387,112,280.067,104.32,280.067,94.933'/%3E%3Cpath fill='%23FFFFFF' d='M228.867,77.867h17.067c-9.387,0-17.067,7.68-17.067,17.067s7.68,17.067,17.067,17.067h-17.067c-9.387,0-17.067-7.68-17.067-17.067S219.48,77.867,228.867,77.867'/%3E%3Cpath fill='%2323d138' d='M280.067,26.667c0-9.387-7.68-17.067-17.067-17.067h-17.067c-9.387,0-17.067,7.68-17.067,17.067s7.68,17.067,17.067,17.067H263C272.387,43.733,280.067,36.053,280.067,26.667'/%3E%3Cpath fill='%23FFA800' d='M280.067,26.667c0-9.387-7.68-17.067-17.067-17.067h17.067c9.387,0,17.067,7.68,17.067,17.067c0,9.387-7.68,17.067-17.067,17.067H263C272.387,43.733,280.067,36.053,280.067,26.667'/%3E%3Cpath fill='%23FFFFFF' d='M228.867,9.6h17.067c-9.387,0-17.067,7.68-17.067,17.067c0,9.387,7.68,17.067,17.067,17.067h-17.067c-9.387,0-17.067-7.68-17.067-17.067C211.8,17.28,219.48,9.6,228.867,9.6'/%3E%3Cpath fill='%23000000' d='M280.067,137.6h-51.2c-14.507,0-25.6-11.093-25.6-25.6s11.093-25.6,25.6-25.6h51.2c14.507,0,25.6,11.093,25.6,25.6S294.573,137.6,280.067,137.6z M228.867,103.467c-5.12,0-8.533,3.413-8.533,8.533s3.413,8.533,8.533,8.533h51.2c5.12,0,8.533-3.413,8.533-8.533s-3.413-8.533-8.533-8.533H228.867z'/%3E%3Cpath fill='%23000000' d='M280.067,69.333h-51.2c-14.507,0-25.6-11.093-25.6-25.6c0-14.507,11.093-25.6,25.6-25.6h51.2c14.507,0,25.6,11.093,25.6,25.6C305.667,58.24,294.573,69.333,280.067,69.333z M228.867,35.2c-5.12,0-8.533,3.413-8.533,8.533c0,5.12,3.413,8.533,8.533,8.533h51.2c5.12,0,8.533-3.413,8.533-8.533c0-5.12-3.413-8.533-8.533-8.533H228.867z'/%3E%3Cpath fill='%23000000' d='M280.067,1.067h-51.2c-14.507,0-25.6-11.093-25.6-25.6c0-14.507,11.093-25.6,25.6-25.6h51.2c14.507,0,25.6,11.093,25.6,25.6C305.667-10.027,294.573,1.067,280.067,1.067z M228.867-33.067c-5.12,0-8.533,3.413-8.533,8.533c0,5.12,3.413,8.533,8.533,8.533h51.2c5.12,0,8.533-3.413,8.533-8.533c0-5.12-3.413-8.533-8.533-8.533H228.867z'/%3E%3Cpath fill='%23000000' d='M297.133,205.867H211.8c-5.12,0-8.533,3.413-8.533,8.533v93.867h-85.333c-3.413,0-5.973,1.707-7.68,4.267s-0.853,5.973,0.853,8.533L247.64,508.8c3.413,4.267,10.24,4.267,13.653,0l136.533-187.733c1.707-2.56,2.56-5.973,0.853-8.533c-1.707-2.56-4.267-4.267-7.68-4.267H305.667V214.4C305.667,209.28,302.253,205.867,297.133,205.867z M220.333,222.933H288.6v93.867c0,5.12,3.413,8.533,8.533,8.533h76.8L254.467,488.933L135,325.333h76.8c5.12,0,8.533-3.413,8.533-8.533V222.933z'/%3E%3C/svg%3E" mode="aspectFit" />
        </view>
      </view>
    </view>

    <view class="holding-list">
      <view 
        class="holding-card" 
        v-for="item in holdings" 
        :key="item.id"
      >
        <view class="holding-name-row">
          <text class="holding-name">{{ item.fundName || '未命名基金' }}</text>
        </view>
        <view class="holding-body">
          <view class="holding-info">
            <view class="holding-meta">
              <view class="code-sector-row">
                <text class="holding-code">{{ item.fundCode }}</text>
                <view class="sector-row" v-if="item.sectors && item.sectors.length > 0">
                  <text class="sector-tag" v-for="(sector, idx) in item.sectors" :key="idx">{{ sector }}</text>
                </view>
              </view>
              <text class="holding-amount">持有 {{ formatMoney(item.amount) }}</text>
            </view>
          </view>
          <view class="holding-stats">
            <view class="stat-row-main">
              <image class="stat-icon-moneybag" src="data:image/svg+xml,%3Csvg viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1{fill:%23e6d488;}.cls-2{fill:%23ffeb97;}.cls-3{fill:%23576065;}%3C/style%3E%3C/defs%3E%3Cg id='money-bag'%3E%3Cg id='money-bag-2' data-name='money-bag'%3E%3Cg id='fill'%3E%3Cpath class='cls-1' d='M35.88,17.18c-5.38-1.82-9-11.47-9-15.33,0,0,3.93,5.82,12.74,1.62l8.56,1.15,15-2.77c0,3.86-3.63,13.51-9,15.33Z'/%3E%3Cpath class='cls-2' d='M54.12,17.17c13.27,7.71,23,30.48,23,44.12C77.08,77.91,62.72,88.2,45,88.2S12.92,77.91,12.92,61.29c0-13.64,9.69-36.41,23-44.12'/%3E%3Cpath class='cls-3' d='M36,40 L43.5,50 V65 H46.5 V50 L54,40 H50 L45,46.5 L40,40 Z M35,52 H55 V55 H35 Z M35,58 H55 V61 H35 Z'/%3E%3C/g%3E%3Cg id='outline'%3E%3Cpath class='cls-3' d='M45,90C25.37,90,11.12,77.93,11.12,61.3c0-13.78,9.14-35,21.33-44-4.82-3.83-7.38-12.11-7.38-15.44A1.8,1.8,0,0,1,28.18.62c.06.06,5.78,6,12.61,6a1.8,1.8,0,1,1,0,3.6A20.34,20.34,0,0,1,29.68,6.49c1.31,3.7,3.77,8,6.77,9a1.8,1.8,0,0,1,.33,3.26C24.56,25.84,14.72,47.83,14.72,61.3c0,14.78,12.45,25.1,30.28,25.1S75.28,76.08,75.28,61.3c0-13.47-9.84-35.46-22.06-42.56a1.8,1.8,0,0,1,.33-3.26C58,14,61.33,5.13,61.33,1.85a1.8,1.8,0,0,1,3.6,0c0,3.33-2.57,11.61-7.38,15.44,12.19,9.05,21.33,30.23,21.33,44C78.88,77.93,64.63,90,45,90Z'/%3E%3Cpath class='cls-3' d='M49.3,11.78a1.8,1.8,0,0,1-1.72-1.28c-.75-2.5-2.13-5.6-4.4-6.13-2.55-.59-5.75,2.12-6.67,3.11A1.8,1.8,0,1,1,33.86,5c.2-.22,5-5.37,10.13-4.17,3.17.73,5.54,3.63,7,8.6a1.8,1.8,0,0,1-1.21,2.24A1.84,1.84,0,0,1,49.3,11.78Z'/%3E%3Cpath class='cls-3' d='M49.06,8a1.74,1.74,0,0,1-.64-.12,1.76,1.76,0,0,1-1.05-2.23C47.59,5,49.93-.59,63.21.05a1.8,1.8,0,0,1,1.71,1.88A1.82,1.82,0,0,1,63,3.65c-10.52-.52-12.29,3.24-12.3,3.28A1.86,1.86,0,0,1,49.06,8Z'/%3E%3Cpath class='cls-3' d='M56.27,19.1H36.63a1.8,1.8,0,1,1,0-3.6H56.27a1.8,1.8,0,1,1,0,3.6Z'/%3E%3Cpath class='cls-3' d='M69.7,26.68a1.8,1.8,0,0,1-1.76-1.42c-1.19-5.45-11.43-4.79-11.53-4.78a1.8,1.8,0,0,1-.29-3.59c.54,0,13.46-1,15.34,7.6a1.8,1.8,0,0,1-1.37,2.14A1.83,1.83,0,0,1,69.7,26.68Z'/%3E%3Cpath class='cls-3' d='M59.94,19.45a11,11,0,0,1-4.48-1,1.8,1.8,0,0,1,1.6-3.22h0a6.45,6.45,0,0,0,4.46.36,4.93,4.93,0,0,0,2.71-3A1.8,1.8,0,1,1,67.55,14a8.41,8.41,0,0,1-4.8,5A8.11,8.11,0,0,1,59.94,19.45Z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E" mode="aspectFit" />
              <text class="stat-value" :class="item.profit >= 0 ? 'red' : 'green'">
                {{ formatMoney(item.profit, true) }}
              </text>
              <text class="stat-rate" :class="item.profit >= 0 ? 'red' : 'green'">
                ({{ formatPercent(item.profit / item.amount * 100) }})
              </text>
            </view>
            <view class="stat-row">
              <image class="stat-icon-svg" src="data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 4 10 V 20 H 20 V 10 L 12 14 Z' fill='%23ef4444'/%3E%3Cpath d='M 4 10 L 12 4 L 20 10' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='12' cy='8' r='5' fill='%23fbbf24' stroke='%23d97706' stroke-width='1'/%3E%3Ctext x='12' y='10.5' font-size='6' font-weight='900' fill='%23d97706' text-anchor='middle'%3E¥%3C/text%3E%3Ctext x='12' y='18' font-size='6' font-weight='bold' fill='%23fff' text-anchor='middle'%3E今日%3C/text%3E%3C/svg%3E" mode="aspectFit" />
              <text class="stat-value" :class="item.todayProfit >= 0 ? 'red' : 'green'">
                {{ formatTodayProfit(item.todayProfit) }}
              </text>
              <text class="stat-rate" :class="item.todayProfit >= 0 ? 'red' : 'green'">
                ({{ formatTodayRate(item.todayRate) }})
              </text>
              <text class="estimate-time" v-if="item.estimateTimeDesc">
                {{ item.estimateTimeDesc }}
              </text>
            </view>
            <!-- 心跳节奏 - AI估值 -->
            <view class="heartbeat-row" v-if="getHeartbeat(item.id)">
              <text class="heartbeat-icon">💓</text>
              <text class="heartbeat-value" :class="getHeartbeat(item.id).rate >= 0 ? 'red' : 'green'">
                {{ formatHeartbeatProfit(getHeartbeat(item.id).todayProfit) }}
              </text>
              <text class="heartbeat-rate" :class="getHeartbeat(item.id).rate >= 0 ? 'red' : 'green'">
                ({{ getHeartbeat(item.id).rate >= 0 ? '+' : '' }}{{ getHeartbeat(item.id).rate }}%)
              </text>
            </view>
          </view>
        </view>
        <view class="holding-actions">
          <view class="action-btn action-detail" @tap.stop="goDetail(item)">
            <image class="action-icon" src="data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23FFD782' d='M297.646,297.89l-83.538-83.538L13.812,414.65l-3.654,65.995c-0.663,11.971,9.226,21.86,21.197,21.197l65.994-3.655l31.896-31.896v-32.649h32.649l36.391-36.391v-32.649h32.649L297.646,297.89z'/%3E%3Cpath fill='%23000000' fill-opacity='0.1' d='M201.105,310.894c14.301,14.301,30.011,26.666,46.64,36.898l49.901-49.901l-83.538-83.538l-49.956,49.956C174.386,280.885,186.763,296.552,201.105,310.894z'/%3E%3Cpath fill='%23FF6465' d='M229.729,282.271c-70.682-70.682-79.294-172.804-19.608-232.491S371.93-1.293,442.612,69.388s79.295,172.804,19.608,232.491S300.411,352.953,229.729,282.271z'/%3E%3Cpath fill='%23E65A5B' d='M258.352,253.648c-54.632-54.632-63.244-131.609-19.608-175.245s120.614-35.024,175.245,19.608s63.244,131.609,19.608,175.245S312.983,308.28,258.352,253.648z'/%3E%3Cpath fill='%23000000' fill-opacity='0.1' d='M265.73,105.389c39.97-39.97,107.902-36.073,161.022,6.845c-3.937-4.872-8.173-9.633-12.763-14.223C359.357,43.379,282.38,34.767,238.744,78.403s-35.024,120.614,19.608,175.245c4.59,4.59,9.349,8.827,14.223,12.763C229.656,213.291,225.759,145.359,265.73,105.389z'/%3E%3Cpolygon fill='%23FFFFFF' points='392.003,119.998 374.909,170.403 406.743,213.059 353.522,212.379 322.79,255.836 306.991,205.009 256.164,189.21 299.621,158.478 298.941,105.258 341.598,137.091'/%3E%3Cpath fill='%23000000' d='M326.787,41.767c-37.259-5.127-71.067,5.346-95.206,29.485c-47.648,47.649-39.035,130.913,19.608,189.556c33.202,33.202,74.288,50.367,112.341,50.364c29.16-0.001,56.544-10.085,77.218-30.756c47.648-47.649,39.035-130.913-19.609-189.557c-15.432-15.431-32.791-27.666-51.59-36.364c-5.076-2.348-11.087-0.136-13.434,4.936c-2.346,5.073-0.138,11.087,4.934,13.434c16.634,7.695,32.036,18.565,45.779,32.306c50.62,50.62,59.231,121.31,19.609,160.935c-39.623,39.622-110.314,31.011-160.933-19.608s-59.234-121.31-19.611-160.933c19.553-19.554,47.309-27.987,78.134-23.746c5.547,0.765,10.643-3.109,11.404-8.646C336.193,47.634,332.323,42.528,326.787,41.767z'/%3E%3Cpath fill='%23000000' d='M399.152,112.845c-2.726-2.723-6.76-3.666-10.406-2.429l-45.369,15.385l-38.393-28.65c-3.087-2.303-7.212-2.655-10.647-0.907c-3.431,1.749-5.574,5.295-5.524,9.147l0.613,47.901l-39.112,27.661c-3.145,2.224-4.755,6.041-4.152,9.846c0.602,3.805,3.313,6.937,6.991,8.081l45.747,14.22l14.219,45.745c1.144,3.68,4.276,6.389,8.081,6.992c0.529,0.084,1.058,0.124,1.584,0.124c3.252,0,6.346-1.569,8.26-4.276l27.661-39.112l47.901,0.613c3.831,0.078,7.397-2.093,9.146-5.525c1.749-3.431,1.397-7.56-0.907-10.646l-28.65-38.394l15.383-45.367C402.817,119.604,401.876,115.569,399.152,112.845z M386.362,202.683l-32.718-0.418c-3.302-0.07-6.47,1.556-8.391,4.276l-18.893,26.715l-9.712-31.246c-0.988-3.18-3.48-5.671-6.66-6.66l-31.246-9.712l26.715-18.893c2.72-1.923,4.319-5.061,4.276-8.393l-0.418-32.718l26.224,19.569c2.669,1.992,6.145,2.545,9.302,1.473l30.988-10.508l-10.507,30.987c-1.07,3.155-0.52,6.633,1.473,9.302L386.362,202.683z'/%3E%3Cpath fill='%23000000' d='M449.76,62.237C413.888,26.365,368.901,4.48,323.085,0.617C276.643-3.304,233.969,11.62,202.958,42.63c-31.01,31.01-45.93,73.672-42.013,120.128c2.024,23.996,9,47.762,20.331,70.115L87.94,326.209c-3.952,3.952-3.952,10.36,0,14.311c3.953,3.952,10.36,3.952,14.312,0c0,0,89.425-89.425,89.429-89.43c-2.131,2.187,19.188,25.796,21.892,28.824c0.352,0.394,0.708,0.784,1.062,1.175c0.31,0.343,0.618,0.688,0.931,1.03L54.159,443.527c-3.952,3.952-3.952,10.36,0,14.311c1.977,1.977,4.566,2.964,7.157,2.964c2.589,0,5.18-0.988,7.157-2.964l161.403-161.403c0.425,0.391,0.858,0.769,1.286,1.156c0.297,0.269,0.595,0.537,0.893,0.803c9.168,8.21,18.808,15.555,28.818,21.958l-34.137,34.136h-28.458c-5.59,0-10.12,4.531-10.12,10.12v28.457l-30.462,30.462h-28.457c-5.59,0-10.12,4.531-10.12,10.12v28.457L92.922,488.3l-62.134,3.441c-2.871,0.167-5.583-0.874-7.619-2.912c-2.039-2.037-3.072-4.744-2.913-7.621l3.441-62.134l49.935-49.935c3.952-3.952,3.952-10.36,0-14.311c-3.953-3.952-10.36-3.952-14.312,0l-52.671,52.67c-1.761,1.761-2.811,4.11-2.948,6.597l-3.654,65.995c-0.476,8.576,2.735,16.978,8.808,23.051c5.681,5.679,13.396,8.855,21.386,8.855c0.555,0,1.109-0.015,1.666-0.046l65.994-3.654c2.487-0.138,4.835-1.187,6.597-2.948l31.896-31.896c1.897-1.898,2.963-4.472,2.963-7.155V443.77h22.528c2.684,0,5.257-1.066,7.157-2.964l36.391-36.391c1.897-1.897,2.963-4.472,2.963-7.155V374.73h22.529c2.684,0,5.257-1.066,7.157-2.964l41.004-41.002c24.71,12.542,51.115,19.693,77.767,20.756c0.138,0.005,0.274,0.008,0.41,0.008c5.404,0,9.888-4.269,10.105-9.716c0.223-5.585-4.125-10.292-9.708-10.515c-25.554-1.019-50.933-8.363-74.528-21.269c-0.309-0.22-0.629-0.424-0.965-0.61c-24.965-13.813-46.984-33.244-64.197-55.969c-20.26-26.757-34.02-58.782-36.853-92.39c-3.408-40.417,9.432-77.392,36.157-104.116c26.724-26.724,63.704-39.567,104.116-36.156c41.058,3.462,81.565,23.266,114.061,55.764c66.67,66.67,75.283,162.505,19.608,218.18c-16.915,16.915-37.537,28.167-61.296,33.44c-5.457,1.21-8.899,6.616-7.687,12.072c1.21,5.457,6.621,8.901,12.072,7.687c27.188-6.035,51.817-19.481,71.223-38.887C533.067,245.341,524.454,136.931,449.76,62.237z'/%3E%3C/svg%3E" mode="aspectFit" />
          </view>
          <view class="action-btn action-edit" @tap.stop="editHolding(item)">
            <image class="action-icon" src="data:image/svg+xml,%3Csvg height='200px' width='200px' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512.001 512.001' xml:space='preserve'%3E%3Cpath style='fill:%23C7CFE2;' d='M217.396,82.638L144.703,9.945H97.812c-12.239,0-18.367,14.797-9.713,23.451l35.266,35.266c14.904,14.904,15.816,39.186,1.327,54.492c-15.033,15.88-40.099,16.14-55.46,0.78L33.395,88.098c-8.654-8.653-23.451-2.524-23.451,9.715v46.891l72.693,72.693h72.633l139.334,139.334v72.633l72.693,72.693h46.891c12.239,0,18.367-14.797,9.713-23.451l-35.266-35.266c-14.904-14.904-15.816-39.186-1.327-54.492c15.034-15.88,40.1-16.14,55.462-0.778l35.835,35.835c8.654,8.654,23.451,2.524,23.451-9.713v-46.891l-72.693-72.693H356.73L217.396,155.271V82.638z'%3E%3C/path%3E%3Cpath d='M414.19,512.001h-46.891c-2.637,0-5.166-1.047-7.032-2.912l-72.693-72.693c-1.864-1.866-2.912-4.394-2.912-7.032v-68.515l-24.172-24.171c-3.884-3.885-3.884-10.18,0-14.064c3.885-3.882,10.18-3.882,14.064,0l27.085,27.085c1.864,1.866,2.912,4.394,2.912,7.032v68.515l66.868,66.868h42.773c2.205,0,3.142-1.466,3.506-2.343c0.361-0.874,0.737-2.574-0.823-4.133l-35.266-35.266c-18.759-18.757-19.44-49.425-1.519-68.361c9.115-9.629,21.425-15.03,34.663-15.212c13.252-0.17,25.69,4.874,35.054,14.236l35.835,35.836c1.558,1.558,3.259,1.185,4.134,0.821c0.874-0.362,2.341-1.298,2.341-3.504v-42.773l-66.868-66.868h-68.515c-2.637,0-5.166-1.047-7.032-2.912l-85.973-85.973c-3.884-3.885-3.884-10.18,0-14.064c3.885-3.882,10.18-3.882,14.064,0l83.06,83.061h68.515c2.637,0,5.166,1.047,7.032,2.912l72.693,72.693c1.864,1.866,2.912,4.394,2.912,7.032v46.891c0,9.611-5.737,18.2-14.618,21.878c-8.882,3.678-19.011,1.663-25.808-5.132l-35.835-35.836c-5.534-5.532-12.925-8.48-20.717-8.414c-7.823,0.107-15.1,3.303-20.491,8.997c-10.586,11.186-10.077,29.411,1.138,40.625l35.267,35.266c6.796,6.798,8.812,16.929,5.133,25.808C432.389,506.262,423.802,512.001,414.19,512.001z'%3E%3C/path%3E%3Cpath d='M239.395,311.464c-2.544,0-5.09-0.971-7.032-2.912l-81.21-81.212H82.637c-2.637,0-5.166-1.047-7.032-2.912L2.912,151.735C1.047,149.869,0,147.341,0,144.703V97.812c0-9.611,5.737-18.2,14.618-21.878c8.882-3.675,19.01-1.663,25.808,5.132l35.835,35.836c5.533,5.532,12.877,8.585,20.718,8.413c7.821-0.107,15.098-3.301,20.489-8.997c10.588-11.185,10.079-29.409-1.136-40.624L81.067,40.428c-6.798-6.799-8.812-16.93-5.134-25.81C79.611,5.738,88.199,0.001,97.812,0.001h46.892c2.637,0,5.166,1.047,7.032,2.912l72.691,72.693c1.864,1.866,2.912,4.394,2.912,7.032v68.515l22.324,22.323c3.884,3.885,3.884,10.18,0,14.064c-3.885,3.882-10.18,3.882-14.064,0l-25.236-25.236c-1.864-1.866-2.912-4.394-2.912-7.032V86.757l-66.868-66.868H97.812c-2.205,0-3.141,1.466-3.504,2.342c-0.362,0.875-0.739,2.575,0.822,4.135l35.266,35.264c18.76,18.76,19.441,49.426,1.517,68.361c-9.113,9.627-21.421,15.029-34.66,15.212c-0.229,0.003-0.461,0.005-0.689,0.005c-12.986,0-25.164-5.042-34.364-14.241L26.364,95.129c-1.558-1.558-3.26-1.184-4.134-0.821c-0.874,0.363-2.342,1.298-2.342,3.504v42.773l66.868,66.868h68.515c2.637,0,5.166,1.047,7.032,2.912l84.123,84.123c3.883,3.885,3.883,10.18,0,14.064C244.485,310.493,241.939,311.464,239.395,311.464z'%3E%3C/path%3E%3C/svg%3E" mode="aspectFit" />
          </view>
          <view class="action-btn action-delete" @tap.stop="handleDeleteHolding(item)">
            <image class="action-icon" src="data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23FF6465' d='M256.002,503.671c136.785,0,247.671-110.886,247.671-247.672S392.786,8.329,256.002,8.329S8.33,119.215,8.33,256.001S119.216,503.671,256.002,503.671z'/%3E%3Cpath fill='%23000000' fill-opacity='0.1' d='M74.962,256.001c0-125.485,93.327-229.158,214.355-245.434c-10.899-1.466-22.016-2.238-33.316-2.238C119.216,8.329,8.33,119.215,8.33,256.001s110.886,247.672,247.671,247.672c11.3,0,22.417-0.772,33.316-2.238C168.289,485.159,74.962,381.486,74.962,256.001z'/%3E%3Cpath fill='%23FFFFFF' d='M311.525,256.001l65.206-65.206c4.74-4.74,4.74-12.425,0-17.163l-38.36-38.36c-4.74-4.74-12.425-4.74-17.164,0l-65.206,65.206l-65.206-65.206c-4.74-4.74-12.425-4.74-17.163,0l-38.36,38.36c-4.74,4.74-4.74,12.425,0,17.163l65.206,65.206l-65.206,65.206c-4.74,4.74-4.74,12.425,0,17.164l38.36,38.36c4.74,4.74,12.425,4.74,17.163,0l65.206-65.206l65.206,65.206c4.74,4.74,12.425,4.74,17.164,0l38.36-38.36c4.74-4.74,4.74-12.425,0-17.164L311.525,256.001z'/%3E%3Cpath fill='%23000000' d='M388.614,182.213c0-5.467-2.129-10.607-5.995-14.471l-38.36-38.36c-3.865-3.865-9.004-5.994-14.471-5.994s-10.605,2.129-14.471,5.994l-59.316,59.316l-59.316-59.316c-3.865-3.865-9.004-5.994-14.471-5.994c-5.467,0-10.606,2.129-14.471,5.994l-38.36,38.36c-7.979,7.979-7.979,20.962,0,28.943l59.316,59.316l-59.316,59.316c-7.979,7.979-7.979,20.962,0,28.943l38.36,38.36c3.865,3.865,9.004,5.993,14.471,5.993c5.467,0,10.606-2.129,14.471-5.993l59.316-59.316l59.316,59.316c3.865,3.865,9.004,5.993,14.471,5.993s10.605-2.129,14.471-5.993l38.36-38.36c3.866-3.865,5.995-9.004,5.995-14.471c0-5.467-2.129-10.607-5.995-14.471l-59.315-59.316l59.315-59.315C386.485,192.818,388.614,187.68,388.614,182.213z M370.84,184.905l-65.204,65.206c-3.253,3.253-3.253,8.527,0,11.778l65.204,65.207c0.971,0.971,1.115,2.103,1.115,2.692c0,0.589-0.144,1.721-1.115,2.692l-38.36,38.36c-0.971,0.971-2.103,1.115-2.692,1.115c-0.589,0-1.722-0.144-2.692-1.115l-65.206-65.206c-1.626-1.626-3.758-2.44-5.889-2.44c-2.131,0-4.263,0.813-5.889,2.44l-65.206,65.206c-0.971,0.971-2.103,1.115-2.692,1.115c-0.59,0-1.722-0.144-2.693-1.115l-38.36-38.36c-1.484-1.485-1.484-3.9,0-5.385l65.206-65.206c3.253-3.253,3.253-8.527,0-11.778l-65.206-65.206c-1.484-1.485-1.484-3.9,0-5.385l38.359-38.36c0.971-0.971,2.104-1.115,2.693-1.115s1.722,0.144,2.692,1.115l65.206,65.206c3.253,3.253,8.527,3.253,11.778,0l65.206-65.206c0.971-0.971,2.103-1.115,2.692-1.115c0.589,0,1.722,0.144,2.692,1.115l38.36,38.36c0.971,0.971,1.115,2.103,1.115,2.692S371.811,183.934,370.84,184.905z'/%3E%3Cpath fill='%23000000' d='M423.9,73.756c-3.229,3.276-3.191,8.55,0.086,11.778c46.016,45.349,71.358,105.89,71.358,170.466c0,63.931-24.896,124.035-70.102,169.241s-105.31,70.102-169.241,70.102c-35.385,0-69.471-7.555-101.311-22.455c-4.166-1.95-9.124-0.153-11.074,4.013c-1.95,4.166-0.153,9.124,4.013,11.074C181.695,503.917,218.156,512,255.999,512c68.381,0,132.668-26.629,181.019-74.982c48.352-48.352,74.98-112.64,74.98-181.019c0-69.072-27.106-133.825-76.323-182.331C432.401,70.44,427.128,70.478,423.9,73.756z'/%3E%3Cpath fill='%23000000' d='M116.34,470.563c1.405,0.916,2.982,1.354,4.542,1.354c2.72,0,5.387-1.332,6.984-3.78c2.513-3.852,1.427-9.013-2.426-11.526c-68.115-44.424-108.78-119.419-108.78-200.611c0-63.931,24.896-124.035,70.102-169.24c45.206-45.206,105.31-70.102,169.241-70.102c52.234,0,101.864,16.528,143.525,47.796c3.679,2.761,8.9,2.017,11.66-1.662c2.761-3.679,2.017-8.9-1.662-11.661C364.958,17.681,311.87,0,256.002,0c-68.38,0-132.668,26.629-181.019,74.98C26.63,123.333,0.001,187.62,0.001,255.999C0.001,342.841,43.493,423.051,116.34,470.563z'/%3E%3C/svg%3E" mode="aspectFit" />
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="holdings.length === 0">
        <view class="empty-icon">📊</view>
        <text class="empty-text">还没有持仓记录</text>
        <text class="empty-hint">点击右下角按钮添加第一支基金</text>
      </view>
    </view>

    <!-- 添加按钮 FAB -->
    <view class="fab" @tap="goAdd">
      <image class="fab-icon-svg" src="data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M526.507431 109.121602c-231.868047 0-419.788888 187.920841-419.788887 419.788888s187.920841 419.788888 419.788887 419.788888 419.788888-187.920841 419.788888-419.788888S758.375478 109.121602 526.507431 109.121602zM778.381173 545.702209H543.29915v233.967012h-33.583438V545.702209H275.7487v-33.583438h233.967012V277.036748h33.583438v235.082023H778.381173v33.583438z' fill='%2398C4D8'/%3E%3Cpath d='M492.923993 75.538164c-231.868047 0-419.788888 187.920841-419.788888 419.788887s187.920841 419.788888 419.788888 419.788888 419.788888-187.920841 419.788887-419.788888S724.792039 75.538164 492.923993 75.538164zM744.797735 512.118771H509.715712v233.967011h-33.583439V512.118771H242.166285v-33.583439h233.967012V243.453309h33.583439v235.082023H744.797735v33.583439z' fill='%23EFD9A0'/%3E%3Cpath d='M268.480057 288.159806a30.213832 64.203753 55.515 1 0 105.843026-72.703105 30.213832 64.203753 55.515 1 0-105.843026 72.703105Z' fill='%23FEFEFE'/%3E%3Cpath d='M203.600369 393.818901a20.142896 35.2493 55.515 1 0 58.110194-39.915635 20.142896 35.2493 55.515 1 0-58.110194 39.915635Z' fill='%23FEFEFE'/%3E%3C/svg%3E" mode="aspectFit" />
    </view>

    <!-- 底部导航占位 -->
    <!-- <view class="nav-placeholder"></view> -->
    
    <!-- 自定义删除确认弹窗 -->
    <view class="modal-mask" v-if="showDeleteModal" @tap="cancelDelete">
      <view class="modal-container" @tap.stop>
        <view class="modal-icon">
          <image class="modal-icon-svg" src="data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23FFBC00' d='M750.1 879.2l16.6-16.7v-77.1l-93.8 93.8zM751.7 384.8H272.3c-8.3 0-15 6.7-15 15v464.4c0 8.3 6.7 15 15 15h238.6l255.8-255.8V399.8c0-8.3-6.7-15-15-15zM333.1 501.2c-23.2 0-42-18.8-42-42s18.8-42 42-42 42 18.8 42 42-18.8 42-42 42zM630.5 879.2l136.2-136.3v-77.1L553.3 879.2z'/%3E%3Cpath fill='%2346287C' d='M751.7 354.8H272.3c-24.8 0-45 20.2-45 45v464.4c0 24.8 20.2 45 45 45h479.5c24.8 0 45-20.2 45-45V399.8c-0.1-24.8-20.3-45-45.1-45z m15 507.7l-16.6 16.6h-77.2l93.8-93.8v77.2z m0-119.6L630.5 879.2h-77.2l213.4-213.4v77.1z m0-119.6L510.9 879.2H272.3c-8.3 0-15-6.7-15-15V399.8c0-8.3 6.7-15 15-15h479.5c8.3 0 15 6.7 15 15v223.5z'/%3E%3Cpath fill='%23FFBC00' d='M287.7 287.2h446.6c11.3 0 20.6-9.2 20.6-20.6v-32.4c0-11.3-9.2-20.6-20.6-20.6H287.7c-11.3 0-20.6 9.2-20.6 20.6v32.4c0 11.4 9.3 20.6 20.6 20.6z'/%3E%3Cpath fill='%2346287C' d='M287.7 317.2h446.6c27.9 0 50.6-22.7 50.6-50.6v-32.4c0-27.9-22.7-50.6-50.6-50.6H585.4v-24.4c0-14.9-12.1-27-27-27h-92.7c-14.9 0-27 12.1-27 27v24.4h-151c-27.9 0-50.6 22.7-50.6 50.6v32.4c0 27.9 22.7 50.6 50.6 50.6z m-20.6-83c0-11.3 9.2-20.6 20.6-20.6h446.5c11.3 0 20.6 9.2 20.6 20.6v32.4c0 11.3-9.2 20.6-20.6 20.6H287.7c-11.3 0-20.6-9.2-20.6-20.6v-32.4z m288.3-71.9v21.4h-86.7v-21.4h86.7z'/%3E%3Cpath fill='%23FFBC00' d='M468.6 162.3h86.7v21.4h-86.7z'/%3E%3Ccircle fill='%23FFFFFF' cx='333.1' cy='459.2' r='42'/%3E%3C/svg%3E" mode="aspectFit" />
        </view>
        <text class="modal-title">确认删除</text>
        <text class="modal-content">确定要删除「{{ deleteTarget?.fundName || '未命名基金' }}」吗？</text>
        <text class="modal-hint">删除后数据将无法恢复</text>
        <view class="modal-actions">
          <view class="modal-btn modal-btn-cancel" @tap="cancelDelete">
            <text class="modal-btn-text cancel">取消</text>
          </view>
          <view class="modal-btn modal-btn-confirm" @tap="confirmDeleteAction">
            <text class="modal-btn-text confirm">确认删除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getHoldings, calculateStats, formatMoney, formatPercent, deleteHolding } from '@/utils/storage.js'
import { getFundEstimates, getFundSectorsBatch } from '@/utils/api.js'
import { generateDailyReport, generateProfitAlert, getNotificationSettings } from '@/utils/notification.js'
import { calculateAllHeartbeats } from '@/utils/heartbeat.js'

export default {
  data() {
    return {
      holdings: [],
      stats: {
        totalAmount: 0,
        totalProfit: 0,
        totalRate: 0,
        todayProfit: 0,
        todayRate: 0
      },
      heartbeats: {},
      heartbeatLoading: false,
      showDeleteModal: false,
      deleteTarget: null,
      sortOrder: 'down',
      sortType: 'total',
      sortOptions: [
        { value: 'total', label: '总涨跌幅' },
        { value: 'today', label: '今日涨跌幅' }
      ]
    }
  },
  computed: {
    formatMoney() {
      return formatMoney
    },
    formatPercent() {
      return formatPercent
    },
    currentSortLabel() {
      const option = this.sortOptions.find(o => o.value === this.sortType)
      return option ? option.label : '总涨跌幅'
    }
  },
  onShow() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.refreshAll()
  },
  methods: {
    async loadData() {
      this.holdings = getHoldings()
      this.calculateTotalStats()
      
      if (this.holdings.length > 0) {
        await this.refreshAll()
      }
    },
    
    calculateTotalStats() {
      this.stats = calculateStats(this.holdings)
    },
    
    async refreshAll() {
      await Promise.all([
        this.refreshEstimates(),
        this.refreshHeartbeats(),
        this.refreshFundSectors()
      ])
      uni.stopPullDownRefresh()
    },

    async refreshFundSectors() {
      try {
        const codes = this.holdings.map(h => h.fundCode)
        console.log('[refreshFundSectors] 获取板块信息, codes:', codes)
        const fundInfos = await getFundSectorsBatch(codes)
        console.log('[refreshFundSectors] 返回结果:', fundInfos)

        const sectorsMap = {}
        fundInfos.forEach(info => {
          if (info && info.code) {
            sectorsMap[info.code] = info.sectors || []
          }
        })

        this.holdings.forEach(holding => {
          holding.sectors = sectorsMap[holding.fundCode] || ['混合']
        })
      } catch (e) {
        console.error('刷新基金板块失败:', e)
      }
    },
    
    async refreshEstimates() {
      try {
        const codes = this.holdings.map(h => h.fundCode)
        const estimates = await getFundEstimates(codes)
        
        const settings = getNotificationSettings()
        
        estimates.forEach((est, index) => {
          if (est && this.holdings[index]) {
            const rate = parseFloat(est.estimatedPercent) || 0
            const amount = parseFloat(this.holdings[index].amount) || 0
            this.holdings[index].todayProfit = (amount * rate / 100).toFixed(2)
            this.holdings[index].todayRate = rate
            this.holdings[index].estimateTimeDesc = est.timeDesc || ''

            if (settings.enabled && settings.profitAlert) {
              generateProfitAlert(this.holdings[index], rate)
            }
          }
        })
        
        this.calculateTotalStats()
        
        if (settings.enabled && settings.dailyReport) {
          generateDailyReport(this.stats)
        }
      } catch (e) {
        console.error('刷新估值失败:', e)
      }
    },
    
    async refreshHeartbeats() {
      this.heartbeatLoading = true
      
      // 准备基金列表
      const fundList = this.holdings.map(h => ({
        id: h.id,
        fundCode: h.fundCode,
        fundName: h.fundName,
        amount: parseFloat(h.amount) || 0
      }))
      
      // 批量计算所有心跳（只请求一次股票接口）
      const results = await calculateAllHeartbeats(fundList)
      
      // 更新心跳数据
      this.heartbeats = results
      
      this.heartbeatLoading = false
    },
    
    getHeartbeat(id) {
      return this.heartbeats[id] || null
    },
    
    goAdd() {
      uni.navigateTo({
        url: '/pages/add/add'
      })
    },
    
    editHolding(item) {
      uni.navigateTo({
        url: `/pages/add/add?id=${item.id}`
      })
    },
    
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/detail/detail?code=${item.fundCode}&name=${encodeURIComponent(item.fundName || '未命名基金')}`
      })
    },
    
    onSortTypeChange(e) {
      const index = e.detail.value
      this.sortType = this.sortOptions[index].value
      this.sortHoldings()
    },
    
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'up' ? 'down' : 'up'
      this.sortHoldings()
    },
    
    sortHoldings() {
      const multiplier = this.sortOrder === 'up' ? 1 : -1
      this.holdings.sort((a, b) => {
        if (this.sortType === 'today') {
          const rateA = parseFloat(a.todayRate) || 0
          const rateB = parseFloat(b.todayRate) || 0
          return (rateA - rateB) * multiplier
        } else {
          const rateA = a.amount > 0 ? (a.profit / a.amount) : 0
          const rateB = b.amount > 0 ? (b.profit / b.amount) : 0
          return (rateA - rateB) * multiplier
        }
      })
    },
    
    handleDeleteHolding(item) {
      this.deleteTarget = item
      this.showDeleteModal = true
    },
    
    cancelDelete() {
      this.showDeleteModal = false
      this.deleteTarget = null
    },
    
    async confirmDeleteAction() {
      if (!this.deleteTarget) return
      
      this.showDeleteModal = false
      uni.showLoading({ title: '删除中...' })
      try {
        await deleteHolding(this.deleteTarget.id)
        uni.hideLoading()
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
        this.deleteTarget = null
        this.loadData()
      } catch (e) {
        uni.hideLoading()
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
        console.error('删除失败:', e)
      }
    },
    
    formatTodayProfit(value) {
      if (value === null || value === undefined || isNaN(value)) return '--'
      const num = parseFloat(value)
      const formatted = Math.abs(num).toFixed(2)
      if (num >= 0) {
        return `+¥${formatted}`
      } else {
        return `-¥${formatted}`
      }
    },
    
    formatTodayRate(value) {
      if (value === null || value === undefined || isNaN(value)) return '--'
      const num = parseFloat(value)
      return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
    },
    
    formatHeartbeatProfit(value) {
      if (value === null || value === undefined || isNaN(value)) return '--'
      const num = parseFloat(value)
      const formatted = Math.abs(num).toFixed(2)
      if (num >= 0) {
        return `+¥${formatted}`
      } else {
        return `-¥${formatted}`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  // padding-bottom: 200rpx;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
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

.bg-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(200rpx);
  pointer-events: none;
  z-index: 0;
  
  &.bg-glow-1 {
    width: 700rpx;
    height: 700rpx;
    background: radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, transparent 70%);
    top: -240rpx;
    right: -160rpx;
  }
  
  &.bg-glow-2 {
    width: 560rpx;
    height: 560rpx;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
    bottom: 300rpx;
    left: -200rpx;
  }
  
  &.bg-glow-3 {
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, rgba(194, 65, 12, 0.1) 0%, transparent 70%);
    top: 50%;
    right: -100rpx;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.header-title {
  font-size: 48rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -1rpx;
}

.header-subtitle {
  font-size: 24rpx;
  color: $text-tertiary;
  font-weight: 500;
}

.icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-sm;
  background: $glass-bg;
  border: 1px solid $border-card;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-sm;
  
  &:active {
    transform: scale(0.95);
  }
}

.bento-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 10;
}

.bento-card {
  background: $glass-bg;
  border: 1px solid $border-card;
  border-radius: $radius-lg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  padding: 28rpx;
  box-shadow: $shadow-sm;
  box-sizing: border-box;
  overflow: hidden;
  
  &.span-2 {
    grid-column: span 2;
    padding: 32rpx;
    background: linear-gradient(135deg, 
      rgba(254, 243, 199, 0.7) 0%, 
      rgba(253, 230, 138, 0.5) 50%,
      rgba(252, 211, 77, 0.3) 100%);
    border: 1px solid rgba(217, 119, 6, 0.15);
  }
}

.card-label {
  font-size: 22rpx;
  color: $text-tertiary;
  margin-bottom: 16rpx;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  display: block;
}

.card-value {
  font-size: 48rpx;
  font-weight: 800;
  letter-spacing: -2rpx;
  line-height: 1.1;
  display: block;
  word-break: break-all;
  
  &.large {
    font-size: 64rpx;
    color: $accent-terracotta;
  }
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.card-sub {
  font-size: 24rpx;
  color: $text-secondary;
  margin-top: 16rpx;
  display: block;
}

.stat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: $text-secondary;
  border: 1px solid $border-card;
  
  &.up {
    background: rgba(220, 38, 38, 0.1);
    color: $accent-red;
    border-color: rgba(220, 38, 38, 0.2);
  }
  
  &.down {
    background: rgba(5, 150, 105, 0.1);
    color: $accent-green;
    border-color: rgba(5, 150, 105, 0.2);
  }
  
  .arrow {
    font-size: 22rpx;
  }
}

.today-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 20rpx;
  border-radius: 40rpx;
  font-size: 22rpx;
  font-weight: 700;
  margin-top: 16rpx;
  white-space: nowrap;
  
  &.up {
    background: rgba(220, 38, 38, 0.12);
    color: $accent-red;
  }
  
  &.down {
    background: rgba(5, 150, 105, 0.12);
    color: $accent-green;
  }
  
  .arrow {
    font-size: 18rpx;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 10;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.sort-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 24rpx;
  border: 1px solid rgba(180, 130, 70, 0.2);
}

.sort-label {
  font-size: 24rpx;
  color: $text-secondary;
}

.sort-arrow {
  font-size: 18rpx;
  color: $text-tertiary;
}

.sort-order-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
  border: 1px solid rgba(180, 130, 70, 0.2);
  
  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.sort-icon {
  width: 32rpx;
  height: 32rpx;
}

.section-action {
  font-size: 26rpx;
  color: $text-tertiary;
}

.holding-list {
  position: relative;
  z-index: 10;
}

.holding-card {
  background: $glass-bg;
  border: 1px solid $border-card;
  border-radius: $radius-lg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
  box-sizing: border-box;
}

.holding-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px solid rgba(180, 130, 70, 0.1);
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.action-text {
  font-size: 24rpx;
  font-weight: 600;
}

.action-detail {
  background: rgba(217, 119, 6, 0.1);
  border: 1px solid rgba(217, 119, 6, 0.3);
  
  .action-text {
    color: $accent-terracotta;
  }
}

.action-edit {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  
  .action-text {
    color: #3b82f6;
  }
}

.action-icon {
  width: 40rpx;
  height: 40rpx;
}

.action-delete {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  
  .action-text {
    color: #dc2626;
  }
}

.holding-name-row {
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 1px solid rgba(180, 130, 70, 0.1);
}

.holding-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.holding-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.holding-name {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.holding-meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex-wrap: wrap;
}

.code-sector-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

.holding-code {
  font-size: 20rpx;
  color: $text-tertiary;
  background: rgba(180, 130, 70, 0.08);
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
}

.holding-amount {
  font-size: 24rpx;
  color: $text-secondary;
}

.sector-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.sector-tag {
  font-size: 20rpx;
  color: $accent-terracotta;
  background: rgba(217, 119, 6, 0.1);
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.detailed-sector-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-top: 6rpx;
}

.detailed-sector-tag {
  font-size: 22rpx;
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  border: 1px solid rgba(5, 150, 105, 0.2);
  font-weight: 500;
}

.holding-stats {
  text-align: right;
  flex-shrink: 0;
  margin-left: 20rpx;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  margin-bottom: 8rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.stat-row-main {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.stat-icon {
  font-size: 22rpx;
  width: 32rpx;
  text-align: center;
}

.stat-icon-svg {
  width: 36rpx;
  height: 36rpx;
}

.stat-icon-moneybag {
  width: 40rpx;
  height: 30rpx;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 700;
  min-width: 100rpx;
  text-align: right;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.stat-rate {
  font-size: 22rpx;
  font-weight: 600;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.heartbeat-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  margin-top: 8rpx;
  padding-top: 8rpx;
  border-top: 1px dashed rgba(180, 130, 70, 0.2);
}

.heartbeat-icon {
  font-size: 20rpx;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.heartbeat-value {
  font-size: 24rpx;
  font-weight: 700;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.heartbeat-rate {
  font-size: 20rpx;
  font-weight: 600;
  
  &.green { color: $accent-green; }
  &.red { color: $accent-red; }
}

.heartbeat-time {
  font-size: 18rpx;
  color: $text-tertiary;
  margin-left: 8rpx;
}

.estimate-time {
  font-size: 18rpx;
  color: $text-tertiary;
  margin-left: 8rpx;
  padding: 2rpx 8rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $text-secondary;
  display: block;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: $text-tertiary;
}

.fab {
  position: fixed;
  bottom: 180rpx;
  right: 32rpx;
  width: 100rpx;
  height: 100rpx;
  z-index: 100;
  
  &:active {
    transform: scale(0.9);
  }
}

.fab-icon-svg {
  width: 100rpx;
  height: 100rpx;
}

.nav-placeholder {
  height: 120rpx;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  width: 580rpx;
  background: linear-gradient(145deg, 
    rgba(255, 251, 240, 0.98) 0%, 
    rgba(254, 243, 199, 0.95) 100%);
  border-radius: 32rpx;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 
    0 20rpx 60rpx rgba(180, 130, 70, 0.3),
    0 8rpx 24rpx rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(217, 119, 6, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(40rpx) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-icon {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, 
    rgba(251, 191, 36, 0.2) 0%, 
    rgba(245, 158, 11, 0.15) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  border: 1px solid rgba(217, 119, 6, 0.3);
}

.icon-warning {
  font-size: 48rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.modal-content {
  font-size: 28rpx;
  color: $text-secondary;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 12rpx;
  padding: 0 20rpx;
}

.modal-hint {
  font-size: 24rpx;
  color: $text-tertiary;
  margin-bottom: 36rpx;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
  width: 100%;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.96);
  }
}

.modal-btn-cancel {
  background: rgba(180, 130, 70, 0.08);
  border: 2px solid rgba(180, 130, 70, 0.2);
}

.modal-btn-confirm {
  background: linear-gradient(135deg, 
    rgba(217, 119, 6, 0.9) 0%, 
    rgba(180, 83, 9, 0.9) 100%);
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(217, 119, 6, 0.3);
}

.modal-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  
  &.cancel {
    color: $text-secondary;
  }
  
  &.confirm {
    color: #ffffff;
  }
}
</style>