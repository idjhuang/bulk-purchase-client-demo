<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <h2>議價採購單報價</h2>
    <br/>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇議價採購單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">輸入報價內容</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step === 3">完成報價</v-stepper-step>
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
                  <td class="text-xs-right">{{props.item.Amount}}</td>
                  <td>{{props.item.Operator}}</td>
                  <td>{{props.item.Note}}</td>
                  <td>{{ formatDate(props.item.UpdateTime) }}</td>
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
            <h3>選擇計價方式, 輸入報價與有效期限</h3>
            <p>
              {{purchaseInfo}}
            </p>
            <v-form  v-model="priceForm.valid" ref="priceForm">
              <v-select
                v-bind:items="priceUnitList"
                v-model="priceUnit"
                label="選擇計價單位"
                single-line
                item-text="label"
                item-value="value"
                hint="選擇計價單位"
                required
              ></v-select>
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
            <h3>報價完成</h3>
            <p></p>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇其他的議價採購單</v-btn>
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
    name: 'Bidding',
    metaInfo: {
      title: '議價採購單報價'
    },
    data () {
      return {
        step: 0,
        autoComplete: null,
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
          { text: '採購數量(張)', value: 'Amount' },
          { text: '採購人員', align: 'left', value: 'Operator' },
          { text: '備註', align: 'left', value: 'Note' },
          { text: '採購日期', align: 'left', value: 'UpdateTime' }
        ],
        quotationList: [],
        selectedQuotation: [],
        purchaseInfo: null,
        priceUnitList: [
          { label: '新台幣/磅', value: 0 },
          { label: '新台幣/張', value: 1 }
        ],
        priceForm: {
          valid: false
        },
        priceUnit: null,
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
          eventBus.$emit('loading', true)
          let result = await service.Get('List/PurchaseForBidding')
          eventBus.$emit('loading', false)
          if (result.status === 200 && result.data) {
            this.quotationList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          eventBus.$emit('loading', false)
          failure = true
          console.log(`populate quotation list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
        if (this.quotationList.length > 0) {
          this.selectedQuotation.push(this.quotationList[0])
          this.purchaseId = this.quotationList[0].PurchaseId
        }
      },
      formatDate (date, itemNum) {
        return utility.formatDate(date, itemNum)
      },
      selectQuotation (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedQuotation = [ props.item ]
        this.purchaseId = props.item.PurchaseId
      },
      initBidding () {
        let quotation = this.selectedQuotation[0]
        let date = new Date()
        date.setDate(date.getDate() + 7)
        this.purchaseInfo =
          `採購單號: PO${quotation.PurchaseId}, 產品名稱: ${quotation.Product},` +
          ` 數量(張): ${quotation.Amount}, 採購人員: ${quotation.Operator},` +
          ` 備註: ${quotation.Note}, 採購日期: ${this.formatDate(quotation.UpdateTime)}`
        this.expireDate = this.formatDate(date, 3)
      },
      async completeQuotation () {
        let quotation = this.selectedQuotation[0]
        let product = quotation.Product
        if (this.priceUnit === 0) {
          product = product.match(/^\d+g\D+/gm)[0]
        }
        let biddingPrice = {
          Product: product,
          Price: this.price,
          Type: 20,
          UpdateTime: this.formatDate(new Date()),
          ExpireDate: this.expireDate,
          PurchaseId: quotation.PurchaseId
        }
        let failure = false
        try {
          let result = await service.Post('ProductPrice', biddingPrice)
          if (result.status === 204) {
            this.step = 3
          } else {
            failure = true
          }
        } catch (e) {
          console.log(`insert bidding price failure: ${e.message}`)
          failure = true
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '新增報價失敗, 請再試一次.',
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
