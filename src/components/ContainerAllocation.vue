<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇採購單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">建立分櫃表</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step > 3">檢查分櫃表</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="4" :complete="step === 4">完成分櫃表</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-data-table
              :pagination.sync="purchaseListPagination"
              :headers="purchaseListHeaders"
              :items="purchaseList"
              v-model="selectedPurchase"
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
                  <td>
                    <v-checkbox
                      primary
                      hide-details
                      v-model="props.selected"
                      @click="selectPurchase(props, $event)"
                    ></v-checkbox>
                  </td>
                  <td>{{ formatDate(props.item.PurchaseDate) }}</td>
                  <td>{{ formatDate(props.item.BeginDate, 2) }}</td>
                  <td>{{ formatDate(props.item.EndDate, 2) }}</td>
                  <td>{{ periodLabel(props.item.Period) }}</td>
                  <td class="text-xs-right">{{ props.item.Items.length }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="props.expanded = true"
                    >列出採購項目</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-chip v-for="item in props.item.Items" v-bind:key="item.Subject">
                      {{item.Type}} 克重{{item.Weight}} 寬{{item.Length}} 高{{item.Width}}
                    </v-chip>
                    <v-btn flat @click.native="props.expanded = false">關閉</v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" :disabled="purchaseId === null" @click.native="step = 2">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="2">
          <v-card class="mb-5">
            <h3>設定到港時程, 下載空白分櫃表, 完成之後再上傳分櫃表</h3>
            <v-select
              v-bind:items="periodItems"
              v-model="purchasePeriod"
              label="選擇到港時程"
              single-line
              item-text="label"
              item-value="value"
              hint="選擇到港時程"
            ></v-select>
            <v-btn @click="setPurchasePeriod">設定到港時程</v-btn>
            <v-divider></v-divider>
            <br/>
            <v-btn @click="downloadTemplate">下載空白分櫃表</v-btn>
            <br/>
            <v-divider></v-divider>
            <form v-on:submit="ignore">
              <file-input
                :key="fileInputKey"
                accept="*.xls"
                label="選擇上傳的分櫃表檔案"
                ref="fileInput"
                v-on:formData="setUploadFormData"
              ></file-input>
              <v-btn
                :loading="loading"
                @click.native="uploadContainerAllocation"
                :disabled="loading || !uploadFormData"
                color="blue-grey"
                class="white--text"
              >
                上傳分櫃表
                <v-icon right dark>cloud_upload</v-icon>
              </v-btn>
            </form>
          </v-card>
          <v-btn color="primary" @click.native="step = 3">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <h3>分櫃表</h3>
            <p></p>
            <hot-table root="table" :settings="tblSettings" ref="table"></hot-table>
          </v-card>
          <v-btn color="primary" @click.native="confirmPurchase">完成</v-btn>
          <v-btn flat @click.native="step = 2">回上一步</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="4">
          <v-card class="mb-5">
            <h3>建立分櫃表完成</h3>
            <p></p>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇其他的採購單</v-btn>
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
  import HotTable from '@handsontable/vue'
  import 'handsontable/dist/handsontable.css'
  import HandsonTable from 'handsontable'

  export default {
    name: 'ContainerAllocation',
    metaInfo: {
      title: '建立分櫃表'
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
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '建立日期', align: 'left', value: 'PurchaseDate' },
          { text: '開始採購日期', align: 'left', value: 'StartDate' },
          { text: '結束採購日期', align: 'left', value: 'EndDate' },
          { text: '到港期間', align: 'left', value: 'Period' },
          { text: '採購項目數', value: 'Items.length' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        purchaseList: [],
        selectedPurchase: [],
        periodItems: [
          { label: '上旬/中旬', value: 0 },
          { label: '上旬/下旬', value: 1 },
          { label: '中旬/下旬', value: 2 }
        ],
        purchasePeriod: null,
        fileInputKey: 0,
        uploadFormData: null,
        uploadSuccessed: false,
        tblSettings: {
          data: null,
          colWidths: 80,
          height: 600,
          colHeaders: [],
          columns: []
        },
        validPurchasePlan: false,
        supplierListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '供應商', align: 'left', value: 'Name' }
        ],
        supplierList: [],
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
            this.retrievePurchaseList()
            break
          case 2:
            this.clearTable()
            break
          case 3:
            this.populateTable()
            // let today = new Date()
            break
        }
      }
    },
    methods: {
      async retrievePurchaseList () {
        this.selectedPurchase = []
        this.purchaseId = null
        let failure = false
        try {
          let result = await service.Get('List/Purchase/-1')
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
          this.purchasePeriod = this.purchaseList[0].Period
        }
      },
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
        this.purchasePeriod = props.Period
      },
      async setPurchasePeriod () {
        let failure = false
        let purchase = {
          Id: this.selectedPurchase[0].Id,
          QuotationDeadline: this.selectedPurchase[0].QuotationDeadline,
          BeginDate: this.selectedPurchase[0].BeginDate,
          EndDate: this.selectedPurchase[0].EndDate,
          Period: this.purchasePeriod,
          Status: this.selectedPurchase[0].Status,
          Items: null
        }
        try {
          let result = await service.Put('Purchase', purchase)
          if (result.status === 204) {
            this.selectedPurchase[0].Period = this.purchasePeriod
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`update purchase failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      async downloadTemplate () {
        let purchaseDate = new Date(this.selectedPurchase[0].PurchaseDate)
        let filename =
          `分櫃表${purchaseDate.getFullYear()}-${purchaseDate.getMonth() + 1}-${purchaseDate.getDate()}.xlsx`
        let success = await service.Download(
          `ContainerAllocation/${this.purchaseId}`,
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
      async uploadContainerAllocation () {
        this.loading = true
        this.uploadSuccessed = false
        let result = await service.Upload(`ContainerAllocation/${this.purchaseId}`, this.uploadFormData)
        if (result.status === 201) {
          eventBus.$emit('snackbar', {
            message: '上傳完成.',
            color: 'success',
            show: true
          })
          this.fileInputKey++
          this.uploadFormData = null
          this.uploadSuccessed = true
        } else {
          eventBus.$emit('snackbar', {
            message: '上傳失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
        this.loading = false
      },
      clearTable () {
        this.tblSettings = {
          data: null,
          colWidths: 80,
          height: 600,
          colHeaders: [],
          columns: [],
          mergeCells: []
        }
      },
      async populateTable () {
        try {
          let result = await service.Get(`Table/ContainerAllocation/${this.purchaseId}`)
          if (result.status === 200 && result.data) {
            this.tblSettings.data = result.data.data
            this.tblSettings.colHeaders = result.data.colHeaders
            this.tblSettings.columns = result.data.columns
            this.tblSettings.mergeCells = result.data.mergeCells
            // this.tblSettings.cells = this.cellProperty
          }
        } catch (e) {
          console.log(`populate table failure: ${e.message}`)
        }
      },
      cellProperty (row, col, prop) {
        let properties = {}
        if (col === 5 || col >= 6) {
          properties.numericFormat = { pattern: '0.00' }
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
      async confirmPurchase () {
        let failure = false
        try {
          let result = await service.Put(`ContainerAllocation/${this.purchaseId}`, {})
          if (result.status === 204) {
            this.step = 4
          } else {
            failure = true
          }
        } catch (e) {
          console.log(`update purchase status failure: ${e.message}`)
          failure = true
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新採購狀態失敗, 請再試一次.',
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
      cancel () {
        this.$router.push('/')
      },
      ignore (e) {
        console.log('ignore')
        if (e) e.preventDefault()
      }
    },
    components: {
      FileInput,
      HotTable
    }
  }
</script>
<style scoped>
</style>
