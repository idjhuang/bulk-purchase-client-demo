<template>
  <v-app>
    <!--
    <v-navigation-drawer
      fixed
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in items"
          :key="i"
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    -->
    <v-toolbar fixed app :clipped-left="clipped">
      <!--
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>web</v-icon>
      </v-btn>
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>remove</v-icon>
      </v-btn>
      -->
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <template v-if="authorized && userRole === 'operator'">
        <v-btn flat @click="subject" :class="{ active: $route.name === 'Subject' }">紙張資料維護</v-btn>
        <v-btn flat @click="supplier" :class="{ active: $route.name === 'Supplier' }">廠商資料維護</v-btn>
        <v-btn flat @click="containerPickup" :class="{ active: $route.name === 'ContainerPickup' }">拖櫃作業</v-btn>
      </template>
      <template v-if="authorized && userRole === 'manager'">
        <v-btn flat @click="subject" :class="{ active: $route.name === 'Subject' }">紙張資料維護</v-btn>
        <v-btn flat @click="supplier" :class="{ active: $route.name === 'Supplier' }">廠商資料維護</v-btn>
        <v-btn flat @click="consumption" :class="{ active: $route.name === 'Consumption' }">紙張消耗/預估</v-btn>
        <v-btn flat @click="rollingForecast" :class="{ active: $route.name === 'RollingForecast' }">庫存滾動預估</v-btn>
        <v-btn flat @click="createRFQ" :class="{ active: $route.name === 'CreateRFQ' }">建立詢價資料</v-btn>
        <v-btn flat @click="confirmQuotation" :class="{ active: $route.name === 'ConfirmQuotation' }">確認報價/採購</v-btn>
        <v-btn flat @click="containerAllocation" :class="{ active: $route.name === 'ContainerAllocation' }">分櫃表</v-btn>
        <v-btn flat @click="containerPickup" :class="{ active: $route.name === 'ContainerPickup' }">拖櫃作業</v-btn>
      </template>
      <template v-if="authorized && userRole === 'supplier'">
        <!--
        <v-btn flat @click="quotation" :class="{ active: $route.name === 'Quotation' }">大量採購報價</v-btn>
        <v-btn flat @click="updateQuotation" :class="{ active: $route.name === 'UpdateQuotation' }">大量採購更改報價</v-btn>
        <v-btn flat @click="order" :class="{ active: $route.name === 'BulkPurchaseOrder' }">大量採購訂單</v-btn>
        <v-btn flat @click="arrival" :class="{ active: $route.name === 'ContainerArrival' }">貨櫃清單</v-btn>
        -->
        <v-menu :nudge-width="240">
          <v-btn flat slot="activator">
            <span>紙張大量採購</span>
            <v-icon>arrow_drop_down</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile
              router
              :to="item.to"
              value="true"
              v-for="(item, i) in supplierItems"
              :key="i"
              exact
            >
              <v-list-tile-content>
                <v-list-tile-title v-text="item.label"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
        <v-btn flat @click="downloadPurchase" :class="{ active: $route.name === 'DownloadPurchase' }">下載採購單</v-btn>
        <v-btn flat @click="bidding" :class="{ active: $route.name === 'Bidding' }">議價採購單報價</v-btn>
        <v-btn flat @click="updateBidding" :class="{ active: $route.name === 'UpdateBidding' }">更新議價採購單報價</v-btn>
        <v-btn flat @click="ordinaryQuotation" :class="{ active: $route.name === 'OrdinaryQuotation' }">普通採購報價</v-btn>
      </template>
      <template v-if="authorized && userRole === 'printhouse'">
        <v-btn flat @click="downloadPurchase" :class="{ active: $route.name === 'DownloadPurchase' }">下載採購單</v-btn>
        <v-btn flat @click="bidding" :class="{ active: $route.name === 'Bidding' }">議價採購單報價</v-btn>
        <v-btn flat @click="updateBidding" :class="{ active: $route.name === 'UpdateBidding' }">更新議價採購單報價</v-btn>
        <v-btn flat @click="ordinaryQuotation" :class="{ active: $route.name === 'OrdinaryQuotation' }">普通採購報價</v-btn>
      </template>
      <v-spacer></v-spacer>
      <!--v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>menu</v-icon>
      </v-btn-->
      <template v-if="authorized">
        <v-btn flat @click="demoDescription" :class="{ active: $route.name === 'DemoDescription' }">展示說明</v-btn>
        <v-btn flat :disabled="disableNotification" @click="showNotifications" :class="{ active: $route.name === 'Notification' }">
          <v-badge v-model="showNotificationCount" right overlay>
            <span slot="badge">{{notificationCount}}</span>
            <span>待辦事項</span>
          </v-badge>
        </v-btn>
        <div>使用者: {{userName}}</div>
        <v-btn flat @click="logout">登出</v-btn>
      </template>
      <template v-else>
        <v-btn flat @click="login">登入</v-btn>
      </template>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
    <!--v-navigation-drawer
      temporary
      :right="right"
      v-model="rightDrawer"
      fixed
    >
      <v-list>
        <v-list-tile @click.native="right = !right">
          <v-list-tile-action>
            <v-icon>compare_arrows</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer-->
    <v-footer :fixed="fixed" app>
      <span>&copy; 2017</span>
    </v-footer>
    <v-snackbar
      :timeout="snackbarTimeout"
      :color="snackbarColor"
      :multi-line="snackbarMultiLine"
      v-model="showSnackbar"
    >
      {{ snackbarMessage }}
      <v-btn flat color="black" @click.native="hideSnackbar">關閉</v-btn>
    </v-snackbar>
    <v-dialog
      v-model="loading"
      hide-overlay
      persistent
      width="200"
    >
      <v-card>
        <v-card-text>
          <div class="center">資料讀取中</div>
          <div class="center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<script>
  import { mapGetters } from 'vuex'
  import eventBus from '@/libs/event'
  import service from '@/libs/service'

  export default {
    name: 'App',
    metaInfo: {
      title: '首頁',
      titleTemplate: '紙張大量採購 - %s'
    },
    created () {
      eventBus.$on('snackbar', payload => {
        this.snackbarMessage = payload.message
        this.snackbarTimeout = payload.timeout || 10000
        this.snackbarColor = payload.color || 'info'
        this.snackbarMultiLine = payload.multiLine
        this.showSnackbar = payload.show
      })
      eventBus.$on('loading', payload => {
        this.loading = payload
      })
      eventBus.$on('checkNotification', payload => {
        console.log('on notification')
        this.checkNotification()
      })
      this.checkNotification()
      this.notificationTimer = window.setInterval(this.checkNotification, 600000)
    },
    mounted () {
      this.checkAuthorization()
    },
    beforeDestroy () {
      window.clearInterval(this.notificationTimer)
    },
    data () {
      return {
        clipped: false,
        drawer: true,
        fixed: false,
        items: [{
          icon: 'bubble_chart',
          title: 'Inspire'
        }],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: '紙張大量採購',
        // supplier menu items
        supplierItems: [
          { label: '大量採購報價', to: '/quotation' },
          { label: '大量採購更改報價', to: '/updateQuotation' },
          { label: '確認大量採購付款方式與價格', to: '/updatePurchasePrice' },
          { label: '大量採購訂單', to: '/bulkPurchaseOrder' },
          { label: '貨櫃清單', to: '/containerArrival' },
          { label: '拖櫃通知', to: '/pickupNotification' }
        ],
        // notification data
        notificationTimer: null,
        notificationCount: 0,
        // snackbar data
        snackbarMessage: null,
        snackbarTimeout: 4000,
        snackbarColor: 'info',
        snackbarMultiLine: false,
        showSnackbar: false,
        // loading dialog
        loading: false
      }
    },
    computed: {
      ...mapGetters([
        'authorized',
        'userId',
        'userAccount',
        'userName',
        'userRole',
        'notifications',
        'lastViewDate'
      ]),
      disableNotification () {
        return this.notifications.length === 0
      },
      showNotificationCount () {
        return this.notificationCount > 0
      }
    },
    watch: {
      '$route': function (route) {
        // watch for route change
        // check for authorization
        this.checkAuthorization()
        this.checkNotification()
      }
    },
    methods: {
      async checkAuthorization () {
        this.$store.dispatch('setAuthorized', service.RetrieveAuthorizationToken() !== '')
        if (!this.authorized) {
          this.$router.push('/login')
        } else {
          // retrieve user data
          let result = await service.Get('account')
          if (result.status === 200 && result.data) {
            let userData = {
              id: result.data.sid,
              account: result.data.name,
              name: result.data.givenname,
              role: result.data.role
            }
            this.$store.dispatch('setUser', userData)
            // console.log('get user ok')
          }
        }
      },
      async checkNotification () {
        console.log('retrieve notification')
        try {
          let result = await service.Get('Notification')
          if (result.status === 200 && result.data) {
            this.$store.dispatch('setNotifications', result.data)
            let count = 0
            result.data.forEach(notification => {
              let issueDate = new Date(notification.issueDate)
              if (issueDate > this.lastViewDate) {
                count++
              }
            })
            this.notificationCount = count
          }
        } catch (e) {
        }
      },
      hideSnackbar () {
        this.showSnackbar = false
      },
      showNotifications () {
        this.checkNotification()
        this.notificationCount = 0
        this.$router.push('/')
      },
      login () {
        this.$router.push('Login')
      },
      logout () {
        service.StoreAuthorizationToken('')
        this.$store.dispatch('setAuthorized', false)
        this.$router.push('Login')
      },
      subject () {
        this.$router.push('Subject')
      },
      supplier () {
        this.$router.push('Supplier')
      },
      consumption () {
        this.$router.push('Consumption')
      },
      rollingForecast () {
        this.$router.push('RollingForecast')
      },
      createRFQ () {
        this.$router.push('CreateRFQ')
      },
      confirmQuotation () {
        this.$router.push('ConfirmQuotation')
      },
      containerAllocation () {
        this.$router.push('ContainerAllocation')
      },
      containerPickup () {
        this.$router.push('ContainerPickup')
      },
      quotation () {
        this.$router.push('Quotation')
      },
      updateQuotation () {
        this.$router.push('UpdateQuotation')
      },
      order () {
        this.$router.push('BulkPurchaseOrder')
      },
      arrival () {
        this.$router.push('ContainerArrival')
      },
      downloadPurchase () {
        this.$router.push('DownloadPurchase')
      },
      bidding () {
        this.$router.push('Bidding')
      },
      updateBidding () {
        this.$router.push('UpdateBidding')
      },
      ordinaryQuotation () {
        this.$router.push('OrdinaryQuotation')
      },
      demoDescription () {
        this.$router.push('DemoDescription')
      }
    }
  }
</script>
<style scoped>
  .active {
    text-decoration: underline;
  }
  .center {
    text-align: center;
  }
</style>
