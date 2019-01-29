<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇採購單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">檢查/比較報價單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step > 3">選擇報價單/廠商或上傳採購計畫</v-stepper-step>
        <v-divider></v-divider>
        <!--
        <v-stepper-step step="4" :complete="step > 4">選擇採購項目</v-stepper-step>
        <v-divider></v-divider>
        -->
        <v-stepper-step step="5" :complete="step === 5">確認採購</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-data-table
              :headers="purchaseListHeaders"
              :items="purchaseList"
              v-model="selectedPurchase"
              item-key="purchaseId"
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
                      @click="selectPurchase(props, $event)"
                    ></v-checkbox>
                  </td>
                  <td class="text-xs-right">{{ props.item.purchaseId }}</td>
                  <td>{{ formatDate(props.item.purchaseDate) }}</td>
                  <td>{{ formatDate(props.item.quotationDeadline, 3) }}</td>
                  <td class="text-xs-right">{{ props.item.total }}</td>
                  <td class="text-xs-right">{{ props.item.completed }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="props.expanded = true"
                    >列出已報價廠商</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-chip v-for="supplier in props.item.completedList" v-bind:key="supplier">
                      {{supplier}}
                    </v-chip>
                    <v-btn flat @click.native="props.expanded = false">關閉</v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" :disabled="selectedPurchase.length === 0" @click.native="step = 2">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="2">
          <v-card class="mb-5">
            <v-layout row wrap>
              <v-flex key="col1" xs6>
                <v-card>
                  <v-card-text>
                    <v-data-table
                      :headers="supplierListHeaders"
                      :items="supplierList"
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
                          <td>{{ props.item.Name }}</td>
                          <td>{{ props.item.PriceUnit }}</td>
                          <td>{{ props.item.Note }}</td>
                        </tr>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex key="col2" xs6>
                <v-card>
                  <v-card-text>
                    <hot-table root="table" :settings="tblSettings" ref="table"></hot-table>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
          <v-btn color="primary" @click.native="step = 3">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <v-card-text>
              <h3>選擇報價單/廠商</h3>
              <v-data-table
                :pagination.sync="quotationListPagination"
                :headers="quotationListHeaders"
                :items="quotationList"
                v-model="selectedQuotation"
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
                    <td>
                      <v-checkbox
                        primary
                        hide-details
                        v-model="props.selected"
                        @click="selectQuotation(props, $event)"
                      ></v-checkbox>
                    </td>
                    <td>{{ props.item.SupplierName }}</td>
                    <td>
                      <v-btn
                        flat
                        @click="showQuotationItems(props)"
                      >列出報價項目</v-btn>
                    </td>
                  </tr>
                </template>
                <template slot="expand" slot-scope="props">
                  <v-card flat>
                    <v-card-text>
                      <v-data-table
                        :headers="quotationItemListHeaders"
                        :items="quotationItemList"
                        item-key="Subject"
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
                            <td>{{ props.item.Type }}</td>
                            <td class="text-xs-right">{{ props.item.Weight }}</td>
                            <td class="text-xs-right">{{ props.item.Length }}</td>
                            <td class="text-xs-right">{{ props.item.Width }}</td>
                            <td>{{ props.item.Price25Item }}</td>
                            <td class="text-xs-right">{{ props.item.Price }}</td>
                          </tr>
                        </template>
                      </v-data-table>
                      <v-btn flat @click.native="props.expanded = false">關閉</v-btn>
                    </v-card-text>
                  </v-card>
                </template>
              </v-data-table>
              <v-btn color="primary" @click.native="confirmPurchase(0)">選取供應商採購全部的項目</v-btn>
            </v-card-text>
          </v-card>
          <v-card class="mb-5">
            <v-card-text>
              <h3>上傳採購計畫直接產生採購</h3>
              <form v-on:submit="ignore">
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
                  上傳採購計畫直接產生採購
                  <v-icon right dark>cloud_upload</v-icon>
                </v-btn>
              </form>
            </v-card-text>
          </v-card>
          <!--
          <v-btn color="primary" @click.native="confirmPurchase(0)">選取供應商採購全部的項目</v-btn>
          <v-btn @click.native="step = 4">向選取供應商採購部分的項目</v-btn>
          -->
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
        <!--
        <v-stepper-content :step="4">
          <v-card class="mb-5">
            <v-data-table
              v-model="selectedPurchaseItems"
              :headers="purchaseItemListHeaders"
              :items="purchaseItemList"
              item-key="Subject"
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
                      v-model="props.selected"
                      primary
                      hide-details
                    ></v-checkbox>
                  </td>
                  <td>{{ props.item.Type }}</td>
                  <td class="text-xs-right">{{ props.item.Weight }}</td>
                  <td class="text-xs-right">{{ props.item.Length }}</td>
                  <td class="text-xs-right">{{ props.item.Width }}</td>
                  <td class="text-xs-right">{{ props.item.Price }}</td>
                  <td class="text-xs-right">{{ props.item.Quantity }}</td>
                  <td class="text-xs-right">{{ props.item.Ton }}</td>
                </tr>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" :disabled="selectedPurchaseItems.length === 0" @click.native="confirmPurchase(1)">確認採購</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        -->
        <v-stepper-content :step="5">
          <v-card class="mb-5">
            <h3>確認採購完成</h3>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇其他的採購單</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <v-dialog v-model="confirmPurchaseDialog" persistent max-width="600">
      <v-card>
        <v-card-title class="headline">確認採購</v-card-title>
        <v-card-text>
          <div v-if="uncompletedQuotationAlert">
            有廠商尚未完成報價
          </div>
          <div>
            確定要向選擇的報價單/廠商採購嗎?
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="confirmPurchaseDialog = false">取消</v-btn>
          <v-btn
            flat
            primary
            @click.native="updateQuotationAndPurchase"
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
  import HotTable from '@handsontable/vue'
  import 'handsontable/dist/handsontable.css'
  import HandsonTable from 'handsontable'
  import FileInput from './FileInput.vue'

  export default {
    name: 'ConfirmQuotation',
    metaInfo: {
      title: '確認報價/採購'
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
        purchaseListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '採購序號', value: 'purchaseId' },
          { text: '採購日期', align: 'left', value: 'purchaseDate' },
          { text: '報價截止日期', align: 'left', value: 'quotationDeadline' },
          { text: '詢價廠商家數', value: 'total' },
          { text: '已報價廠商家數', value: 'completed' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        purchaseList: [],
        selectedPurchase: [],
        tblSettings: {
          data: null,
          colWidths: 80,
          height: 600,
          fixedColumnsLeft: 4,
          colHeaders: [],
          columns: []
        },
        supplierListHeaders: [
          { text: '廠商名稱', align: 'left', value: 'Name' },
          { text: '計價單位', align: 'left', value: 'PriceUnit' },
          { text: '備註', align: 'left', value: 'Note' }
        ],
        supplierList: [],
        selectedSupplier: [],
        quotationListPagination: {
          sortBy: 'SupplierId',
          descending: false
        },
        quotationListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '廠商名稱', align: 'left', value: 'SupplierName' }
        ],
        quotationList: [],
        selectedQuotation: [],
        quotationItemListHeaders: [
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '紙張名稱', align: 'left', value: 'Price25Item' },
          { text: '價格(磅價)', value: 'Price' }
        ],
        quotationItemList: [],
        fileInputKey: 0,
        uploadFormData: null,
        selectedPurchaseItems: [],
        purchaseItemListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '價格', value: 'Price' },
          { text: '數量', value: 'Quantity' },
          { text: '噸', value: 'Ton' }
        ],
        purchaseItemList: [],
        confirmPurchaseDialog: false,
        uncompletedQuotationAlert: false,
        purchaseType: null
      }
    },
    watch: {
      'step': function (step) {
        // watch for step
        switch (step) {
          case '1':
          case 1:
            this.retrievePurchaseList()
            break
          case 2:
            this.populateTable()
            break
          case 3:
            this.retrieveQuotationList()
            break
          case 4:
            this.retrieveItemList()
            break
          case 5:
            break
        }
      }
    },
    methods: {
      async retrievePurchaseList () {
        this.selectedPurchase = []
        let failure = false
        try {
          let result = await service.Get('List/PurchaseListForConfirmation')
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
          this.purchaseId = this.purchaseList[0].purchaseId
        }
      },
      formatDate (date, itemNum) {
        return utility.formatDate(date, itemNum)
      },
      selectPurchase (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedPurchase = [ props.item ]
        this.purchaseId = props.item.purchaseId
      },
      async populateTable () {
        try {
          let result = await service.Get(`Table/Quotation/${this.purchaseId}`)
          if (result.status === 200 && result.data) {
            this.tblSettings.data = result.data.data
            this.tblSettings.colHeaders = result.data.colHeaders
            this.tblSettings.columns = result.data.columns
            this.tblSettings.cells = this.cellProperty
            this.tblSettings.afterChange = this.tableChanged
            this.supplierList = result.data.supplierList
          }
        } catch (e) {
          console.log(`populate table failure: ${e.message}`)
        }
      },
      cellProperty (row, col, prop) {
        let properties = {}
        if (col >= 4) {
          properties.numericFormat = { pattern: '0.0000000000' }
        }
        if (this.tblSettings.columns[col].readOnly) {
          properties.renderer = this.forecastRenderer
        } else {
          properties.renderer = this.editableRenderer
        }
        return properties
      },
      forecastRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        td.style.fontWeight = 'bold'
      },
      editableRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        td.style.fontWeight = 'bold'
        td.style.background = 'lightyellow'
      },
      async tableChanged (changes, source) {
        // console.log('changes: ' + JSON.stringify(changes))
        if (changes && (changes[0][2] !== changes[0][3])) {
          let row = changes[0][0]
          let data = changes[0][1]
          let value = changes[0][3]
          let col = this.tblSettings.columns.findIndex(e => e.data === data)
          let subject = this.tblSettings.data[row].SubjectId
          let quotation = this.tblSettings.columns[col].quotation
          console.log(`subject: ${subject}, quotation: ${quotation}, value: ${value}`)
          if (!this.validateValue(value)) {
            this.populateTable()
            return
          }
          let failure = false
          let param = {
            quotationId: quotation,
            subjectId: subject,
            price: value
          }
          try {
            let result = await service.Put('Table/UpdateQuotationItemPrice', param)
            if (result.status !== 204) failure = true
          } catch (e) {
            failure = true
            console.log(`update forecast failure: ${e.message}`)
          }
          if (failure) {
            eventBus.$emit('snackbar', {
              message: '更新資料失敗, 請再試一次.',
              color: 'error',
              show: true
            })
          }
          this.populateTable()
        }
      },
      validateValue (value) {
        console.log(`check: ${value}, ${Number.isNaN(+value)}, ${+value}`)
        let valid = true
        let message = ''
        if (value !== 0 && !value) {
          message = '請輸入數字'
          valid = false
        }
        if (valid && Number.isNaN(+value)) {
          message = '請輸入數字'
          valid = false
        }
        if (valid && +value <= 0) {
          message = '請輸入大於零的數字'
          valid = false
        }
        if (!valid) {
          console.log(`Not valid: ${message}`)
          eventBus.$emit('snackbar', {
            message: message,
            color: 'error',
            show: true
          })
        }
        return valid
      },
      async updatePrice (props) {
        props.item.Price = Number(this.priceForm.price)
        props.item.UpdateDate = new Date()
        let failure = false
        try {
          let result = await service.Put('Quotation', this.selectedQuotation[0])
          if (result.status !== 204) failure = true
        } catch (e) {
          failure = true
          console.log(`update quotation failure: ${e.message}`)
        }
        if (failure) {
          this.$store.dispatch('setSnackbar', {
            message: '更新價格失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
        props.expanded = false
      },
      async retrieveQuotationList () {
        this.selectedQuotation = []
        let failure = false
        try {
          let result = await service.Get(`List/Quotation/${this.purchaseId}`)
          if (result.status === 200 && result.data) {
            this.quotationList = result.data
          } else {
            failure = true
          }
        } catch (e) {
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
          this.quotationId = this.quotationList[0].QuotationId
          this.quotationItemList = this.selectedQuotation[0].Items
        }
      },
      selectQuotation (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedQuotation = [ props.item ]
        this.quotationId = props.item.QuotationId
        this.quotationItemList = props.item.Items
      },
      showQuotationItems (props) {
        this.quotationItemList = props.item.Items
        props.expanded = true
      },
      setUploadFormData (data) {
        this.uploadFormData = data
      },
      async uploadPlan () {
        this.loading = true
        this.uploadFormData.append('OrigPurchase', this.purchaseId)
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
            this.step = 5
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
      async retrieveItemList () {
        /*
        let failure = false
        try {
          let result = await service.Get(`List/SupplierItemList/${this.purchaseId}`)
          if (result.status === 200 && result.data) {
            this.purchaseItemList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate supplier item list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
        */
        this.purchaseItemList = this.selectedQuotation[0].Items
      },
      showSeelectBrand (props) {
        this.brand = props.item.Brand === '' ? null : props.item.Brand
        props.expanded = true
      },
      setBrand (props) {
        if (this.brand) props.item.Brand = this.brand
        props.expanded = false
      },
      confirmPurchase (purchaseType) {
        this.purchaseType = purchaseType
        // check uncompleted quotations
        this.quotationList.forEach(q => {
          if (q.Status !== 1) this.uncompletedQuotationAlert = true
        })
        // validate selected quotation
        let quotation = this.selectedQuotation[0]
        if (quotation.Status !== 1) {
          eventBus.$emit('snackbar', {
            message: '選取的報價單尚未完成報價, 請選擇已完成報價的報價單.',
            color: 'error',
            show: true
          })
          return
        }
        let valid = true
        quotation.Items.forEach(i => {
          if (i.Price <= 0) valid = false
        })
        if (!valid) {
          eventBus.$emit('snackbar', {
            message: '選取的報價單中有價格為零的項目, 請選擇別的報價單.',
            color: 'error',
            show: true
          })
          return
        }
        this.confirmPurchaseDialog = true
      },
      async updateQuotationAndPurchase () {
        let failure = false
        let result
        try {
          switch (this.purchaseType) {
            case 1:
              result = await service.Put('Table/CreatePurchaseFromPartialQuotation', {
                quotation: this.quotationId,
                items: this.selectedPurchaseItems
              })
              break
            default:
              result = await service.Put('Table/ConfirmQuotation', {
                purchase: this.purchaseId,
                quotation: this.quotationId
              })
              break
          }
          if (result.status === 204) {
            this.step = 5
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
        this.confirmPurchaseDialog = false
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
      HotTable,
      FileInput
    }
  }
</script>
<style scoped>
</style>
