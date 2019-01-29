<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <!--
    <div>
      <v-dialog v-model="dateDialog" persistent max-width="600">
        <v-btn flat slot="activator">更改篩選月數</v-btn>
        <v-card>
          <v-card-title class="headline">更改篩選月數</v-card-title>
          <v-card-text>
            <v-form v-model="dateForm.valid" ref="dateForm" lazy-validation>
              <v-text-field
                name="threshold"
                label="篩選月數"
                v-model="dateForm.threshold"
                :rules="dateForm.thresholdRules"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click.native="dateDialog = false">取消</v-btn>
            <v-btn
              flat
              primary
              :disabled="!dateForm.valid"
              @click.native="refreshTable"
            >完成</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="quotationDialog" persistent max-width="800">
        <v-btn flat slot="activator" @click="initCreateRFQ">建立詢價資料</v-btn>
        <v-card>
          <v-card-title class="headline">建立詢價資料</v-card-title>
          <v-card-text>
            <v-stepper v-model="step">
              <v-stepper-header>
                <v-stepper-step step="1" :complete="step > 1">輸入採購開始/結束月份, 到港時程</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="2" :complete="step === 2">選擇採購項目對應廠牌</v-stepper-step>
              </v-stepper-header>
              <v-stepper-items>
                <v-stepper-content :step="1">
                  <v-card class="mb-5">
                    <v-form v-model="quotationForm.valid" ref="quotationForm" lazy-validation>
                      <v-menu
                        lazy
                        :close-on-content-click="false"
                        v-model="quotationForm.menuBeginDate"
                        transition="scale-transition"
                        offset-y
                        full-width
                        :nudge-right="40"
                        max-width="290px"
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          label="採購開始月份"
                          v-model="quotationForm.purchaseBeginDate"
                          prepend-icon="event"
                          readonly
                        ></v-text-field>
                        <v-date-picker type="month" locale="zh-TW" v-model="quotationForm.purchaseBeginDate" no-title scrollable actions>
                          <template slot-scope="{ save, cancel }">
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn flat color="primary" @click="cancel">取消</v-btn>
                              <v-btn flat color="primary" @click="save">確定</v-btn>
                            </v-card-actions>
                          </template>
                        </v-date-picker>
                      </v-menu>
                      <v-menu
                        lazy
                        :close-on-content-click="false"
                        v-model="quotationForm.menuEndDate"
                        transition="scale-transition"
                        offset-y
                        full-width
                        :nudge-right="40"
                        max-width="290px"
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          label="採購結束月份"
                          v-model="quotationForm.purchaseEndDate"
                          prepend-icon="event"
                          readonly
                        ></v-text-field>
                        <v-date-picker type="month" locale="zh-TW" v-model="quotationForm.purchaseEndDate" no-title scrollable actions>
                          <template slot-scope="{ save, cancel }">
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn flat color="primary" @click="cancel">取消</v-btn>
                              <v-btn flat color="primary" @click="save">確定</v-btn>
                            </v-card-actions>
                          </template>
                        </v-date-picker>
                      </v-menu>
                      <v-select
                        v-bind:items="quotationForm.periodItems"
                        v-model="quotationForm.purchasePeriod"
                        label="選擇到港時程"
                        single-line
                        item-text="label"
                        item-value="value"
                        hint="選擇到港時程"
                      ></v-select>
                    </v-form>
                  </v-card>
                  <v-btn color="primary" :disabled="!quotationForm.valid" @click.native="step = 2">下一步</v-btn>
                  <v-btn flat @click.native="quotationDialog = false">取消</v-btn>
                </v-stepper-content>
                <v-stepper-content :step="2">
                  <v-card class="mb-5">
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
                          <td>{{ props.item.Brand }}</td>
                          <td>
                            <v-btn
                              flat
                              @click="initSelectBrand(props)"
                            >選擇廠牌</v-btn>
                          </td>
                        </tr>
                      </template>
                      <template slot="expand" slot-scope="props">
                        <v-card flat>
                          <v-card-text>
                            <v-select
                              v-bind:items="brandList"
                              v-model="brand"
                              label="選擇廠牌"
                              single-line
                            ></v-select>
                            <v-btn
                              flat
                              primary
                              :disabled="brand === null"
                              @click="selectBrand(props)">完成</v-btn>
                            <v-btn flat @click.native="props.expanded = false">取消</v-btn>
                          </v-card-text>
                        </v-card>
                      </template>
                    </v-data-table>
                  </v-card>
                  <v-btn color="primary" :disabled="purchaseItemList.findIndex(e => e.Brand === null) !== -1" @click.native="createRFQ">完成</v-btn>
                  <v-btn flat @click.native="cancel">取消</v-btn>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
    -->
    <hot-table root="table" :settings="tblSettings" ref="table"></hot-table>
  </div>
</template>
<script>
  import eventBus from '@/libs/event'
  import service from '@/libs/service'
  import HotTable from '@handsontable/vue'
  import 'handsontable/dist/handsontable.css'
  import HandsonTable from 'handsontable'

  export default {
    name: 'RollingForecast',
    metaInfo: {
      title: '庫存滾動預估'
    },
    created () {
      this.refreshTable()
    },
    data () {
      return {
        dateDialog: false,
        dateForm: {
          valid: false,
          thresholdRules: [
            (v) => !!v || '請輸入月數',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => +v > 0 || '必須大於0'
          ],
          threshold: 2
        },
        quotationDialog: false,
        step: null,
        quotationForm: {
          valid: false,
          menuBeginDate: false,
          purchaseBeginDate: null,
          menuEndDate: false,
          purchaseEndDate: null,
          periodItems: [
            { label: '上旬/中旬', value: 0 },
            { label: '上旬/下旬', value: 1 },
            { label: '中旬/下旬', value: 2 }
          ],
          purchasePeriod: null
        },
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        purchaseItemListHeaders: [
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '廠牌', align: 'left', value: 'Brand' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        purchaseItemList: [],
        brandList: [],
        brand: null,
        tblSettings: {
          data: null,
          colWidths: 90,
          height: 790,
          fixedColumnsLeft: 8,
          rowHeaders: true,
          readOnly: true,
          colHeaders: [],
          columns: []
        }
      }
    },
    props: {
    },
    methods: {
      async refreshTable () {
        try {
          eventBus.$emit('loading', true)
          let result = await service.Get(`RollingForecast`)
          eventBus.$emit('loading', false)
          if (result.status === 200 && result.data) {
            result.data.data.forEach(r => {
              if (r.Duration <= this.dateForm.threshold) r.Selected = true
            })
            this.tblSettings.data = result.data.data
            this.tblSettings.colHeaders = result.data.colHeaders
            this.tblSettings.columns = result.data.columns
            this.tblSettings.columns[0].width = 60
            this.tblSettings.columns[1].width = 60
            this.tblSettings.columns[2].width = 60
            this.tblSettings.columns[3].width = 60
            this.tblSettings.columns[4].width = 70
            this.tblSettings.columns[5].width = 80
            this.tblSettings.columns[6].width = 70
            this.tblSettings.columns[7].width = 70
            this.tblSettings.cells = this.cellProperty
          }
        } catch (e) {
          eventBus.$emit('loading', false)
          console.log(`populate rolling forecast table failure: ${e.message}`)
        }
        this.dateDialog = false
      },
      cellProperty (row, col, prop) {
        let data = this.tblSettings.data[row]
        let properties = {}
        if (col < 4) return properties
        if (col === 4 && (data.Stock1 <= data.C1)) {
          properties.renderer = this.notifyRenderer
        }
        if (col === 7) {
          properties.renderer = this.markRenderer
          /*
          if (data.Duration <= this.dateForm.threshold) {
            properties.renderer = this.notifyRenderer
          } else {
            properties.renderer = this.markRenderer
          }
          */
        }
        if (col > 7 && (col - 8) % 4 < 2) {
          if (this.tblSettings.data[row][prop] <= 0) {
            properties.renderer = this.notifyRenderer
          }
        }
        return properties
      },
      selectedRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        td.style.background = 'lightSkyBlue'
      },
      notifyRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        td.style.fontWeight = 'bold'
        td.style.background = 'lightPink'
      },
      markRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        td.style.background = 'lightYellow'
      },
      async initCreateRFQ () {
        let failure = false
        try {
          let result = await service.Get('List/Brand')
          if (result.status === 200 && result.data) {
            this.brandList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`retrieve brands failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
          this.quotationDialog = false
          return
        }
        this.purchaseItemList = []
        this.tblSettings.data.forEach(item => {
          if (item.Selected) {
            this.purchaseItemList.push({
              Subject: item.SubjectId,
              Type: item.Type,
              Weight: item.Weight,
              Length: item.Length,
              Width: item.Width,
              Brand: null,
              Price: 0,
              Quantity: 0,
              Ton: 0
            })
          }
        })
      },
      initSelectBrand (props) {
        this.brand = props.item.Brand
        props.expanded = true
      },
      selectBrand (props) {
        props.item.Brand = this.brand
        props.expanded = false
      },
      async createRFQ () {
        let failure = false
        let purchase = {
          QuotationDeadline: null,
          BeginDate: this.quotationForm.purchaseBeginDate,
          EndDate: this.quotationForm.purchaseEndDate,
          Period: this.quotationForm.purchasePeriod,
          Items: this.purchaseItemList
        }
        try {
          let result = await service.Post('Purchase', purchase)
          if (result.status === 200 && result.data) {
            // purchaseId = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`create purchase failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '建立詢價資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          this.quotationDialog = false
          this.$router.push('CreateRFQ')
        }
      }
    },
    components: {
      HotTable
    }
  }
</script>
<style scoped>
</style>
