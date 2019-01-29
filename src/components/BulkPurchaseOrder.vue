<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <h2>大量採購訂單</h2>
    <br/>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇訂單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step === 2">檢視/下載分櫃表</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-data-table
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
                  <td>{{ formatDate(props.item.UpdateDate) }}</td>
                  <td>{{ formatDate(props.item.BeginDate, 2) }}</td>
                  <td>{{ formatDate(props.item.EndDate, 2) }}</td>
                  <td>{{ priceUnitLabel(props.item.Period) }}</td>
                  <td>{{ props.item.Note }}</td>
                  <td>{{ periodLabel(props.item.Period) }}</td>
                  <td class="text-xs-right">{{ props.item.Items.length }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="showPurchaseItems(props)"
                    >列出訂單項目</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-data-table
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
                          <td>{{ props.item.Type }}</td>
                          <td class="text-xs-right">{{ props.item.Weight }}</td>
                          <td class="text-xs-right">{{ props.item.Length }}</td>
                          <td class="text-xs-right">{{ props.item.Width }}</td>
                          <td class="text-xs-right">{{ props.item.Quantity }}</td>
                          <td class="text-xs-right">{{ props.item.Price }}</td>
                        </tr>
                      </template>
                    </v-data-table>
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
            <h3>分櫃表</h3>
            <v-btn @click="downloadContainerAllocation">下載分櫃表</v-btn>
            <hot-table root="table" :settings="tblSettings" ref="table"></hot-table>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇其他訂單</v-btn>
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
  import HotTable from '@handsontable/vue'
  import 'handsontable/dist/handsontable.css'
  import HandsonTable from 'handsontable'

  export default {
    name: 'BulkPurchaseOrder',
    metaInfo: {
      title: '大量採購訂單'
    },
    data () {
      return {
        step: 0,
        purchaseId: null,
        loading: false,
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        purchaseListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '訂單日期', align: 'left', value: 'UpdateDate' },
          { text: '開始採購日期', align: 'left', value: 'StartDate' },
          { text: '結束採購日期', align: 'left', value: 'EndDate' },
          { text: '計價單位', align: 'left', value: 'PriceUnit' },
          { text: '備註', align: 'left', value: 'Note' },
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
        purchaseItemListHeaders: [
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '數量(令數)', value: 'Quantity' },
          { text: '價格(磅價)', value: 'Price' }
        ],
        purchaseItemList: [],
        tblSettings: {
          data: null,
          colWidths: 80,
          height: 500,
          colHeaders: [],
          columns: [],
          mergeCells: []
        }
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
        }
      }
    },
    methods: {
      async retrievePurchaseList () {
        this.selectedPurchase = []
        let failure = false
        try {
          let result = await service.Get('List/OrderListForSupplier')
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
      priceUnitLabel (priceUnit) {
        switch (priceUnit) {
          case 0:
            return '美金/噸'
          case 1:
            return '台幣/磅'
          case 2:
            return '台幣/張'
        }
      },
      selectPurchase (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedPurchase = [ props.item ]
        this.purchaseId = props.item.Id
      },
      showPurchaseItems (props) {
        this.purchaseItemList = props.item.Items
        props.expanded = true
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
      async downloadContainerAllocation () {
        let purchaseDate = new Date(this.selectedPurchase[0].PurchaseDate)
        let filename =
          `分櫃表${purchaseDate.getFullYear()}-${purchaseDate.getMonth() + 1}-${purchaseDate.getDate()}.xlsx`
        let success = await service.Download(
          `ContainerAllocation/${this.purchaseId}?type=1`,
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
      cancel () {
        this.$router.push('/')
      },
      ignore (e) {
        console.log('ignore')
        if (e) e.preventDefault()
      }
    },
    components: {
      HotTable
    }
  }
</script>
<style scoped>
</style>
