<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <h2>大量採購報價</h2>
    <br/>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇報價單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">輸入報價單內容</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step === 3">完成報價單</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
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
                  <td>{{ formatDate(props.item.PurchaseDate) }}</td>
                  <td>{{ formatDate(props.item.QuotationDeadline, 3) }}</td>
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
            <!--
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
                  <td class="text-xs-right">{{ props.item.Quantity }}</td>
                  <td class="text-xs-right">{{ props.item.Ton }}</td>
                  <td class="text-xs-right">{{ props.item.Price }}</td>
                  <td>{{ formatDate(props.item.UpdateDate) }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="initPriceForm(props)"
                    >輸入價格</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-form v-model="priceForm.valid" ref="priceForm" lazy-validation v-on:submit="ignore">
                      <v-text-field
                        name="Price"
                        label="價格(磅價)"
                        v-model="priceForm.price"
                        :rules="priceForm.priceRules"
                        required
                      ></v-text-field>
                      <v-btn
                        flat
                        primary
                        :disabled="!priceForm.valid"
                        @click="updatePrice(props)">完成</v-btn>
                      <v-btn flat @click.native="props.expanded = false">取消</v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
            -->
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
          <v-btn color="primary" :disabled="priceUnit === null" @click.native="completeQuotation">完成</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <h3>報價完成</h3>
            <p></p>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇其他的報價單</v-btn>
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
    name: 'Quotation',
    metaInfo: {
      title: '大量採購報價'
    },
    data () {
      return {
        step: 0,
        autoComplete: null,
        supplier: null,
        quotationId: null,
        suppliers: [],
        loading: false,
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        quotationListPagination: {
          sortBy: 'quotationDate',
          descending: true
        },
        quotationListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '採購日期', align: 'left', value: 'PurchaseDate' },
          { text: '報價截止日期', align: 'left', value: 'QuotationDeadline' },
          { text: '採購項目數', value: 'Items.length' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        quotationList: [],
        selectedQuotation: [],
        /*
        quotationItemListHeaders: [
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '紙張名稱', align: 'left', value: 'Price25Item' },
          { text: '令數', value: 'Quantity' },
          { text: '噸數', value: 'Ton' },
          { text: '價格(磅價)', value: 'Price' },
          { text: '更新日期', align: 'left', value: 'UpdateDate' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        quotationItemList: [],
        priceForm: {
          valid: false,
          price: null,
          priceRules: [
            (v) => !!v || '請輸入價格',
            (v) => !Number.isNaN(v) || '請輸入數值',
            (v) => +v > 0 || '必須大於零'
          ]
        }
        */
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
            this.retrieveQuotationList()
            break
          case 2:
            // this.retrieveQuotationItems()
            this.populateTable()
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
          let result = await service.Get('List/QuotationForSupplier/0')
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
          this.priceUnit = this.quotationList[0].PriceUnit
          this.note = this.quotationList[0].Note
        }
      },
      formatDate (date, itemNum) {
        return utility.formatDate(date, itemNum)
      },
      selectQuotation (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedQuotation = [ props.item ]
        this.quotationId = props.item.QuotationId
        this.priceUnit = props.item.PriceUnit
        this.note = props.item.Note
      },
      /*
      retrieveQuotationItems () {
        this.quotationItemList = this.selectedQuotation[0].Items
      },
      initPriceForm (props) {
        props.expanded = true
        this.priceForm.price = props.item.Price.toString()
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
      */
      async populateTable () {
        try {
          let result = await service.Get(`Table/QuotationForSupplier/${this.quotationId}`)
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
          console.log(`subject: ${subject}, quotation: ${this.quotationId}, value: ${value}`)
          if (!this.validateValue(value)) {
            this.populateTable()
            return
          }
          let failure = false
          let param = {
            quotationId: this.quotationId,
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
      async completeQuotation () {
        let quotation = this.selectedQuotation[0]
        let items = quotation.Items
        let valid = true
        this.tblSettings.data.forEach(i => {
          if (i.Price === 0) {
            valid = false
          } else {
            let item = items.find(m => m.Subject === i.SubjectId)
            if (item) item.Price = i.Price
          }
        })
        if (valid) {
          let failure = false
          quotation.Status = 1
          quotation.PriceUnit = this.priceUnit
          quotation.Note = this.note
          try {
            let result = await service.Put('Quotation', quotation)
            if (result.status === 204) {
              this.step = 3
            } else {
              failure = true
            }
          } catch (e) {
            console.log(`validate quotation plan failure: ${e.message}`)
            failure = true
          }
          if (failure) {
            eventBus.$emit('snackbar', {
              message: '更新報價單失敗, 請再試一次.',
              color: 'error',
              show: true
            })
          }
        } else {
          eventBus.$emit('snackbar', {
            message: '有些報價單項目價格為零, 報價單未完成, 請先完成報價單, 再試一次.',
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
