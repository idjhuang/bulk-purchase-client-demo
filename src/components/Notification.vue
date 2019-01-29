<template>
  <div>
    <h3>待辦事項清單</h3>
    <p></p>
    <v-data-table
      :pagination.sync="notificationsPagination"
      :headers="notificationsHeaders"
      :items="notifications"
      item-key="id"
      no-data-text="沒有資料"
      no-results-text="沒有查到資料"
      rows-per-page-text="顯示列數:"
      :rows-per-page-items="rowsPerPageItems"
      class="elevation-1"
    >
      <template slot="headerCell" slot-scope="props">
        <v-tooltip bottom>
        <span slot="activator">
          {{ props.header.text }}
        </span>
          <span>
          {{ props.header.text }}
        </span>
        </v-tooltip>
      </template>
      <template slot="items" slot-scope="props">
        <tr>
          <td><v-icon color="red">{{ iconName(props.item.issueDate) }}</v-icon></td>
          <td>{{ props.item.category }}</td>
          <td>{{ props.item.title }}</td>
          <td>{{ props.item.description }}</td>
          <td>{{ formatDate(props.item.issueDate) }}</td>
          <td><router-link :to="props.item.url">連至處理頁面</router-link></td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import eventBus from '@/libs/event'
  // import service from '@/libs/service'
  import utility from '@/libs/utility'

  export default {
    name: 'Notification',
    metaInfo: {
      title: '待辦事項'
    },
    mounted () {
      eventBus.$emit('loading', true)
      eventBus.$emit('checkNotification', {})
      eventBus.$emit('loading', false)
    },
    beforeDestroy () {
      this.$store.dispatch('setLastViewDate', new Date())
    },
    data () {
      return {
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        notificationsPagination: {
          sortBy: 'issueDate',
          descending: false
        },
        notificationsHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '類別', align: 'left', value: 'category' },
          { text: '標題', align: 'left', value: 'title' },
          { text: '內容', align: 'left', value: 'description' },
          { text: '日期', align: 'left', value: 'issueDate' },
          { text: '連結', align: 'left', value: 'url' }
        ]
      }
    },
    computed: {
      ...mapGetters([
        'notifications',
        'lastViewDate'
      ]),
      disableNotification () {
        return this.notifications.length === 0
      }
    },
    methods: {
      iconName (d) {
        let issueDate = new Date(d)
        return (this.lastViewDate < issueDate) ? 'warning' : ''
      },
      formatDate (date, itemNum) {
        return utility.formatDate(date, itemNum)
      }
    },
    components: {
    }
  }
</script>
<style scoped>
</style>
