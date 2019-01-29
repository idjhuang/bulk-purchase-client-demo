<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <h2>查詢/下載採購單</h2>
    <br/>
    <v-card>
      <v-card-text>
        <v-data-table
          :pagination.sync="purchaseListPagination"
          :headers="purchaseListHeaders"
          :items="purchaseList"
          v-model="selectedPurchases"
          item-key="PurchaseId"
          select-all
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
              <td>
                <v-checkbox
                  primary
                  hide-details
                  v-model="props.selected"
                ></v-checkbox>
              </td>
              <td>{{ props.item.PurchaseNo }}</td>
              <td>{{ props.item.StatusStr }}</td>
              <td>{{ formatDate(props.item.UpdateDate, 3) }}</td>
              <td>{{ props.item.PaperCode }}</td>
              <td>{{ props.item.Product }}</td>
              <td>{{ props.item.Spec }}</td>
              <td class="text-xs-right">{{ props.item.Amount }}</td>
              <td>{{ props.item.Note }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-btn
          primary
          :disabled="selectedPurchases.length === 0"
          @click="downloadPurchases"
        >下載選取的採購單
        </v-btn>
        <v-btn @click.native="cancel">離開</v-btn>
      </v-card-text>
    </v-card>
    <v-dialog v-model="completePickupDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">完成拖櫃作業</v-card-title>
        <v-card-text>將選取的項目設為完成拖櫃?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="completePickupDialog = false">取消</v-btn>
          <v-btn
            flat
            primary
            @click.native="completePickup"
          >確定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
  import eventBus from '@/libs/event'
  import service from '@/libs/service'
  import utility from '@/libs/utility'

  export default {
    name: 'DownloadPurchase',
    metaInfo: {
      title: '查詢/下載採購單'
    },
    mounted () {
      this.retrievePurchaseList()
    },
    data () {
      return {
        step: 0,
        loading: false,
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        purchaseListPagination: {
          sortBy: 'UpdateDate',
          descending: false
        },
        purchaseListHeaders: [
          { text: '採購單號', align: 'left', value: 'PurchaseNo' },
          { text: '狀態', align: 'left', value: 'StatusStr' },
          { text: '採購日期', align: 'left', value: 'UpdateDate' },
          { text: '品名', align: 'left', value: 'PaperCode' },
          { text: '名稱', align: 'left', value: 'Product' },
          { text: '規格', align: 'left', value: 'Spec' },
          { text: '數量', value: 'Amount' },
          { text: '備註', align: 'left', value: 'Note' }
        ],
        purchaseList: [],
        selectedPurchases: [],
        completePickupDialog: false,
        purchase: null,
        confirmPurchaseDialog: false
      }
    },
    methods: {
      formatDate (date, itemNum) {
        if (!date) return ''
        return utility.formatDate(date, itemNum)
      },
      async retrievePurchaseList () {
        this.selectedPurchases = []
        let failure = false
        try {
          eventBus.$emit('loading', true)
          let result = await service.Get('List/PurchaseList')
          eventBus.$emit('loading', false)
          if (result.status === 200 && result.data) {
            this.purchaseList = result.data
            this.purchaseList.forEach(i => {
              i.StatusStr = i.Status === 1 ? '未下載' : ''
              i.PurchaseNo = `PO${i.PurchaseId}`
            })
          } else {
            failure = true
          }
        } catch (e) {
          eventBus.$emit('loading', false)
          failure = true
          console.log(`populate purchase list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
      },
      async downloadPurchases () {
        let purchaseList = []
        let filename = ''
        this.selectedPurchases.forEach(i => {
          purchaseList.push(i.PurchaseId)
          filename += `PO${i.PurchaseId}-`
        })
        filename += '採購單.pdf'
        let success = await service.Download1(
          `PurchasePdf`,
          purchaseList,
          'blob',
          'application/pdf',
          filename
        )
        if (!success) {
          eventBus.$emit('snackbar', {
            message: '下載失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          /*
          this.selectedPurchases.forEach(purchase => {
            if (purchase.Status === 1) {
              this.setPurchaseStatus(purchase.PurchaseId)
            }
          })
          */
          for (const purchase of this.selectedPurchases) {
            console.log(JSON.stringify(purchase))
            if (purchase.Status === 1) {
              await this.setPurchaseStatus(purchase.PurchaseId)
            }
          }
          this.retrievePurchaseList()
        }
      },
      async setPurchaseStatus (purchase) {
        let failure = false
        try {
          let result = await service.Put(`List/PrintPurchase/${purchase}`)
          if (result.status !== 204) failure = true
        } catch (e) {
          failure = true
          console.log(`set purchase status failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新狀態失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      async completePickup () {
        let failure = false
        try {
          let result = await service.Post('List/FinishPickup', this.selectedPickups)
          if (result.status !== 204) {
            failure = true
          } else {
            this.step = 3
            this.completePickupDialog = false
          }
        } catch (e) {
          console.log(`update arrival item failure: ${e.message}`)
          failure = true
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      cancel () {
        this.$router.push('/')
      },
      ignore (e) {
        console.log('ignore')
        if (e) e.preventDefault()
      }
    },
    components: {
    }
  }
</script>
<style scoped>
</style>
