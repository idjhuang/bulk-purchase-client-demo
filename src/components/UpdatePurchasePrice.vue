<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <h2>確認大量採購付款方式與價格</h2>
    <br/>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇採購單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">確認採購單計價方式/金額</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step === 3">完成</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-data-table
              :pagination.sync="purchaseListPagination"
              :headers="purchaseListHeaders"
              :items="purchaseList"
              v-model="selectedPurchase"
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
                      @click="selectPurchase(props, $event)"
                    ></v-checkbox>
                  </td>
                  <td>{{ formatDate(props.item.PurchaseDate) }}</td>
                  <td>{{ formatDate(props.item.QuotationDeadline, 3) }}</td>
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
                      {{item.Type}} 克重{{item.Weight}} 寬{{item.Length}} 高{{item.Width}} 令數{{item.Quantity}} 噸數{{item.Ton}}
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
            <h3>選擇計價方式, 輸入備註/價格</h3>
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
              name="Note"
              label="備註"
              v-model="note"
              multi-line
              rows="4"
            ></v-text-field>
            <hot-table root="table" :settings="tblSettings" ref="table"></hot-table>
          </v-card>
          <v-btn color="primary" :disabled="priceUnit === null" @click.native="completePurchase">完成</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <h3>確認採購單完成</h3>
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
  import HotTable from '@handsontable/vue'
  import 'handsontable/dist/handsontable.css'
  import HandsonTable from 'handsontable'

  export default {
    name: 'UpdatePurchase',
    metaInfo: {
      title: '確認大量採購付款方式與價格'
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
          sortBy: 'purchaseDate',
          descending: true
        },
        purchaseListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '採購日期', align: 'left', value: 'PurchaseDate' },
          { text: '報價截止日期', align: 'left', value: 'PurchaseDeadline' },
          { text: '採購項目數', value: 'Items.length' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        purchaseList: [],
        selectedPurchase: [],
        priceUnitList: [
          { label: '美金/噸', value: 0 },
          { label: '新台幣/磅', value: 1 },
          { label: '新台幣/張', value: 2 }
        ],
        priceUnit: null,
        tblSettings: {
          data: null,
          colWidths: 80,
          height: 400,
          colHeaders: [],
          columns: []
        },
        note: null
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
            // this.retrievePurchaseItems()
            this.populateTable()
            break
          case 3:
            break
        }
      }
    },
    methods: {
      async retrievePurchaseList () {
        this.selectedPurchase = []
        let failure = false
        try {
          let result = await service.Get('List/PurchaseForSupplier/-1')
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
          this.priceUnit = this.purchaseList[0].PriceUnit
          this.note = this.purchaseList[0].Note
        }
      },
      formatDate (date, itemNum) {
        return utility.formatDate(date, itemNum)
      },
      selectPurchase (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedPurchase = [ props.item ]
        this.purchaseId = props.item.Id
        this.priceUnit = props.item.PriceUnit
        this.note = props.item.Note
      },
      async populateTable () {
        try {
          let result = await service.Get(`Table/PurchaseForSupplier/${this.purchaseId}`)
          if (result.status === 200 && result.data) {
            this.tblSettings.data = result.data.data
            this.tblSettings.colHeaders = result.data.colHeaders
            this.tblSettings.columns = result.data.columns
            this.tblSettings.cells = this.cellProperty
            this.tblSettings.afterChange = this.tableChanged
          }
        } catch (e) {
          console.log(`populate table failure: ${e.message}`)
        }
      },
      cellProperty (row, col, prop) {
        let properties = {}
        if (this.tblSettings.columns[col].readOnly) {
          properties.renderer = this.boldRenderer
        } else {
          properties.numericFormat = { pattern: '0.0000000000' }
          properties.renderer = this.editableRenderer
        }
        return properties
      },
      boldRenderer (instance, td, row, col, prop, value, cellProperties) {
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
          let value = changes[0][3]
          let subject = this.tblSettings.data[row].SubjectId
          console.log(`subject: ${subject}, purchase: ${this.purchaseId}, value: ${value}`)
          if (!this.validateValue(value)) {
            this.populateTable()
            return
          }
          let failure = false
          let param = {
            purchaseId: this.purchaseId,
            subjectId: subject,
            price: value
          }
          try {
            let result = await service.Put('Table/UpdatePurchaseItemPrice', param)
            if (result.status === 204) {
              let items = this.selectedPurchase[0]
              let item = items.find(i => i.Subject === subject)
              item.Price = value
            } else {
              failure = true
            }
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
      async completePurchase () {
        let purchase = this.selectedPurchase[0]
        if (purchase.PriceUnit === 0) {
          eventBus.$emit('snackbar', {
            message: '簽訂採購合約時, 計價方式只能為新台幣/磅, 或是新台幣/張.\n請更改計價方式以及相對金額.',
            color: 'error',
            show: true
          })
          return
        }
        let valid = true
        purchase.Items.forEach(i => {
          if (i.Price === 0) valid = false
        })
        if (valid) {
          let failure = false
          let param = {
            purchaseId: this.purchaseId,
            priceUnit: this.priceUnit,
            note: this.note
          }
          console.log(`param: ${JSON.stringify(param)}`)
          try {
            let result = await service.Put('Table/ConfirmPurchase', param)
            if (result.status === 204) {
              this.step = 3
            } else {
              failure = true
            }
          } catch (e) {
            console.log(`validate purchase plan failure: ${e.message}`)
            failure = true
          }
          if (failure) {
            eventBus.$emit('snackbar', {
              message: '更新採購單失敗, 請再試一次.',
              color: 'error',
              show: true
            })
          }
        } else {
          eventBus.$emit('snackbar', {
            message: '有些採購單項目價格為零, 請先更新價格, 再試一次.',
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
