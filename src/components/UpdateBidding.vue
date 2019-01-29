<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <h2>議價採購單報價更新</h2>
    <br/>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇議價採購單報價</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">更新報價</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step === 3">完成報價更新</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-data-table
              :pagination.sync="quotationListPagination"
              :headers="quotationListHeaders"
              :items="quotationList"
              v-model="selectedQuotation"
              item-key="PurchaseId"
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
                      @click="selectQuotation(props, $event)"
                    ></v-checkbox>
                  </td>
                  <td>PO{{props.item.PurchaseId}}</td>
                  <td>{{props.item.Product}}</td>
                  <td class="text-xs-right">{{props.item.Price}}</td>
                  <td>{{ formatDate(props.item.UpdateTime) }}</td>
                  <td>{{ formatDate(props.item.ExpireDate, 3) }}</td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-chip v-for="item in props.item.Items" v-bind:key="item.Subject">
                      {{item.Type}} 克重{{item.Weight}} 寬{{item.Length}} 高{{item.Width}} 令數{{item.Quantity}} 噸數{{item.Ton}}
                    </v-chip>
                    <v-btn flat @click.native="props.expanded = false">關閉</v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" :disabled="selectedQuotation.length === 0" @click.native="step = 2">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="2">
          <v-card class="mb-5">
            <h3>更新報價與有效期限</h3>
            <p>
              {{purchaseInfo}}
            </p>
            <v-form  v-model="priceForm.valid" ref="priceForm">
              <v-text-field
                name="Price"
                label="報價"
                v-model="price"
                :rules="priceRules"
                required
              ></v-text-field>
              <v-menu
                lazy
                :close-on-content-click="false"
                v-model="menuExpireDate"
                transition="scale-transition"
                offset-y
                full-width
                :nudge-right="40"
                max-width="290px"
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  label="報價有效日期"
                  v-model="expireDate"
                  prepend-icon="event"
                  readonly
                ></v-text-field>
                <v-date-picker locale="zh-TW" v-model="expireDate" no-title scrollable actions>
                  <template slot-scope="{ save, cancel }">
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn flat color="primary" @click="cancel">取消</v-btn>
                      <v-btn flat color="primary" @click="save">確定</v-btn>
                    </v-card-actions>
                  </template>
                </v-date-picker>
              </v-menu>
            </v-form>
          </v-card>
          <v-btn color="primary" :disabled="!priceForm.valid" @click.native="completeQuotation">完成</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <h3>報價更新完成</h3>
            <p></p>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇其他的議價採購單報價</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>
<script>
  import eventBus from '@/libs/event'
  import service from '@/libs/service'
  import utility from '@/libs/utility'

  export default {
    name: 'UpdateBidding',
    metaInfo: {
      title: '議價採購單報價更新'
    },
    data () {
      return {
        step: 0,
        autoComplete: null,
        biddingId: null,
        purchaseId: null,
        loading: false,
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        quotationListPagination: {
          sortBy: 'UpdateTime'
        },
        quotationListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '採購單號', align: 'left', value: 'PurchaseId' },
          { text: '產品名稱', align: 'left', value: 'Product' },
          { text: '金額', value: 'Price' },
          { text: '報價日期', align: 'left', value: 'UpdateTime' },
          { text: '有效日期', align: 'left', value: 'ExpireDate' }
        ],
        quotationList: [],
        selectedQuotation: [],
        purchaseInfo: null,
        priceForm: {
          valid: false
        },
        price: null,
        priceRules: [
          (v) => !!v || '請輸入報價',
          (v) => !Number.isNaN(+v) || '請輸入數字',
          (v) => +v > 0 || '必須大於零'
        ],
        menuExpireDate: false,
        expireDate: null
      }
    },
    watch: {
      'step': function (step) {
        // watch for step
        switch (step) {
          case '1':
          case 1:
            this.retrieveQuotationList()
            break
          case 2:
            this.initBidding()
            break
          case 3:
            break
        }
      }
    },
    methods: {
      async retrieveQuotationList () {
        this.selectedQuotation = []
        let failure = false
        try {
          let result = await service.Get('List/ProductBiddingPrice')
          if (result.status === 200 && result.data) {
            this.quotationList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate bidding list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
        if (this.quotationList.length > 0) {
          let quotation = this.quotationList[0]
          this.selectedQuotation.push(quotation)
          this.biddingId = quotation.Id
          this.purchaseId = quotation.PurchaseId
          this.price = quotation.Price
          this.expireDate = this.formatDate(quotation.ExpireDate, 3)
        }
      },
      formatDate (date, itemNum) {
        return utility.formatDate(date, itemNum)
      },
      selectQuotation (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedQuotation = [ props.item ]
        this.biddingId = props.item.Id
        this.purchaseId = props.item.PurchaseId
        this.price = props.item.Price
        this.expireDate = this.formatDate(props.item.ExpireDate, 3)
      },
      initBidding () {
        let quotation = this.selectedQuotation[0]
        this.purchaseInfo =
          `採購單號: PO${quotation.PurchaseId}, 產品名稱: ${quotation.Product},` +
          ` 報價日期: ${this.formatDate(quotation.UpdateTime)}`
      },
      async completeQuotation () {
        let quotation = this.selectedQuotation[0]
        let biddingPrice = {
          Id: quotation.Id,
          Price: this.price,
          ExpireDate: this.expireDate
        }
        let failure = false
        try {
          let result = await service.Put('ProductPrice', biddingPrice)
          if (result.status === 204) {
            this.step = 3
          } else {
            failure = true
          }
        } catch (e) {
          console.log(`update bidding price failure: ${e.message}`)
          failure = true
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新報價失敗, 請再試一次.',
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
