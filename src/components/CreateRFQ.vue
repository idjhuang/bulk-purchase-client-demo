<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">下載採購計畫草稿</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">上傳採購計畫(分月表)</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step === 3">完成建立詢價資料</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <h3>下載採購計畫草稿, 完成之後再上傳採購計畫</h3>
            <v-btn @click="downloadDraft">下載採購計畫草稿</v-btn>
          </v-card>
          <v-btn color="primary" @click.native="step = 2">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="2">
          <v-card class="mb-5">
            <h3>上傳採購計畫</h3>
            <form v-on:submit="ignore">
              <v-menu
                lazy
                :close-on-content-click="false"
                v-model="menuQuotationEndDate"
                transition="scale-transition"
                offset-y
                full-width
                :nudge-right="40"
                max-width="290px"
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  label="報價截止日期"
                  v-model="quotationEndDate"
                  prepend-icon="event"
                  readonly
                ></v-text-field>
                <v-date-picker locale="zh-TW" v-model="quotationEndDate" no-title scrollable actions>
                  <template slot-scope="{ save, cancel }">
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn flat color="primary" @click="cancel">取消</v-btn>
                      <v-btn flat color="primary" @click="save">確定</v-btn>
                    </v-card-actions>
                  </template>
                </v-date-picker>
              </v-menu>
              <file-input
                :key="fileInputKey"
                accept="*.xls"
                label="選擇上傳的採購計畫檔案"
                ref="fileInput"
                v-on:formData="setUploadFormData"
              ></file-input>
              <v-btn
                :loading="loading"
                @click.native="uploadPlan"
                :disabled="loading || !uploadFormData"
                color="blue-grey"
                class="white--text"
              >
                上傳採購計畫
                <v-icon right dark>cloud_upload</v-icon>
              </v-btn>
            </form>
          </v-card>
          <v-btn color="primary" @click.native="step = 3">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <h3>建立採購計畫完成</h3>
            <v-data-table
              :pagination.sync="purchaseListPagination"
              :headers="purchaseListHeaders"
              :items="purchaseList"
              item-key="Id"
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
                  <td>{{ formatDate(props.item.PurchaseDate) }}</td>
                  <td>{{ formatDate(props.item.QuotationDeadline, 3) }}</td>
                  <td class="text-xs-right">{{ props.item.Quotations.length }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="showQuotations(props)"
                    >列出報價單</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-data-table
                      :headers="quotationListHeaders"
                      :items="quotationList"
                      item-key="QuotationId"
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
                          <td>{{ props.item.SupplierName }}</td>
                          <td class="text-xs-right">{{ props.item.Items.length }}</td>
                          <td>
                            <v-btn
                              flat
                              @click="props.expanded = true"
                            >列出報價項目</v-btn>
                          </td>
                        </tr>
                      </template>
                      <template slot="expand" slot-scope="props">
                        <v-card flat>
                          <v-card-text>
                            <v-chip v-for="item in props.item.Items" v-bind:key="item.Subject">
                              {{item.Price25Item}} 令數: {{item.Quantity}} 噸數: {{item.Ton}}
                            </v-chip>
                            <v-btn flat @click.native="props.expanded = false">關閉</v-btn>
                          </v-card-text>
                        </v-card>
                      </template>
                    </v-data-table>
                    <v-btn flat @click.native="props.expanded = false">關閉</v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
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
  import FileInput from './FileInput.vue'

  export default {
    name: 'CreateRFQ',
    metaInfo: {
      title: '建立詢價資料'
    },
    data () {
      return {
        step: 0,
        autoComplete: null,
        supplier: null,
        purchaseId: null,
        suppliers: [],
        loading: false,
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        purchaseListPagination: {
          sortBy: 'PurchaseDate',
          descending: true
        },
        purchaseListHeaders: [
          { text: '建立日期', align: 'left', value: 'PurchaseDate' },
          { text: '報價結束日期', align: 'left', value: 'QuotationDeadline' },
          { text: '報價單數', value: 'Quotations.length' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        purchaseList: [],
        selectedPurchase: [],
        fileInputKey: 0,
        uploadFormData: null,
        validPurchasePlan: false,
        quotationListHeaders: [
          { text: '供應商', align: 'left', value: 'SupplierName' },
          { text: '項目數', value: 'Items.length' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        quotationList: [],
        selectedSuppliers: [],
        menuQuotationEndDate: false,
        quotationEndDate: null,
        formData: null,
        message: ''
      }
    },
    watch: {
      'step': function (step) {
        // watch for step
        switch (step) {
          case '1':
          case 1:
            break
          case 2:
            break
          case 3:
            this.retrievePurchaseList()
            break
        }
      }
    },
    methods: {
      formatDate (date, itemNum) {
        return utility.formatDate(date, itemNum)
      },
      periodLabel (period) {
        switch (period) {
          case 0:
            return '上旬/中旬'
          case 1:
            return '上旬/下旬'
          case 2:
            return '中旬/下旬'
        }
      },
      selectPurchase (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedPurchase = [ props.item ]
        this.purchaseId = props.item.Id
      },
      async downloadDraft () {
        let purchaseDate = new Date()
        let filename =
          `採購計畫草稿${purchaseDate.getFullYear()}-${purchaseDate.getMonth() + 1}-${purchaseDate.getDate()}.xlsx`
        let success = await service.Download(
          `RequestForQuotation`,
          'blob',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename
        )
        if (!success) {
          eventBus.$emit('snackbar', {
            message: '下載失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      async downloadPlan () {
        let purchaseDate = new Date(this.selectedPurchase[0].PurchaseDate)
        let filename =
          `採購計畫${purchaseDate.getFullYear()}-${purchaseDate.getMonth() + 1}-${purchaseDate.getDate()}.xlsx`
        let success = await service.Download(
          `PurchasePlan/${this.purchaseId}`,
          'blob',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename
        )
        if (!success) {
          eventBus.$emit('snackbar', {
            message: '下載失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      setUploadFormData (data) {
        this.uploadFormData = data
      },
      async uploadPlan () {
        this.loading = true
        this.uploadFormData.append('Deadline', this.quotationEndDate)
        try {
          let result = await service.Upload(`RequestForQuotation`, this.uploadFormData)
          if (result.status !== 201) {
            eventBus.$emit('snackbar', {
              message: '上傳失敗, 請再試一次.',
              color: 'error',
              show: true
            })
          } else {
            eventBus.$emit('snackbar', {
              message: '上傳完成.',
              color: 'success',
              show: true
            })
            this.fileInputKey++
            this.uploadFormData = null
            /*
            // retrieve updated purchase
            result = await service.Get(`Purchase/${this.purchaseId}`)
            if (result.status === 200 && result.data) {
              this.selectedPurchase[0] = result.data
            }
            */
          }
        } catch (e) {
          eventBus.$emit('snackbar', {
            message: '上傳失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
        this.loading = false
      },
      async retrievePurchaseList () {
        this.selectedPurchase = []
        let failure = false
        try {
          let result = await service.Get('List/Purchase/1')
          if (result.status === 200 && result.data) {
            this.purchaseList = result.data
          } else {
            failure = true
          }
        } catch (e) {
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
        if (this.purchaseList.length > 0) {
          this.selectedPurchase.push(this.purchaseList[0])
          this.purchaseId = this.purchaseList[0].Id
        }
      },
      showQuotations (props) {
        this.quotationList = props.item.Quotations
        props.expanded = true
      },
      /*
      async checkPurchasePlan () {
        try {
          let result = await service.Put(`PurchasePlan/${this.purchaseId}`, {})
          if (result.status === 200) {
            this.step = 3
          } else {
            eventBus.$emit('snackbar', {
              message: '採購計畫未完成, 請先完成採購計畫, 再試一次.',
              color: 'error',
              show: true
            })
          }
        } catch (e) {
          console.log(`validate purchase plan failure: ${e.message}`)
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      async retrieveSuppliers () {
        let failure = false
        try {
          let result = await service.Get(`List/Supplier/${this.purchaseId}`)
          if (result.status === 200 && result.data) {
            this.supplierList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate suppliers failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
      },
      async createQuotations () {
        let failure = false
        let purchase = this.selectedPurchase[0]
        purchase.QuotationDeadline = this.quotationEndDate
        purchase.Status = 1
        // update purchase
        let result = await service.Put(`Purchase`, purchase)
        if (result.status !== 204) failure = true
        if (!failure) {
          // create quotations
          this.selectedSuppliers.forEach(async s => {
            let quotation = {
              PurchaseId: this.purchaseId,
              SupplierId: s.Id,
              Items: []
            }
            // populate quotation items
            purchase.Items.forEach(i => {
              quotation.Items.push({
                QuotationId: 0,
                Subject: i.Subject,
                Price: 0
              })
            })
            result = await service.Post('Quotation', quotation)
            if (result.status === 200 && result.data) {
              this.step = 4
            } else {
              failure = true
            }
          })
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '建立詢價資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      */
      cancel () {
        this.$router.push('/')
      },
      ignore (e) {
        console.log('ignore')
        if (e) e.preventDefault()
      }
    },
    components: {
      FileInput
    }
  }
</script>
<style scoped>
</style>
