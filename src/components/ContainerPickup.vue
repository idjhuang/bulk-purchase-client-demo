<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇貨櫃清單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">對照比較分櫃表</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step > 3">輸入拖櫃資料</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="4" :complete="step === 4">完成拖櫃作業</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-data-table
              :headers="arrivalListHeaders"
              :items="arrivalList"
              v-model="selectedArrival"
              item-key="ArrivalId"
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
                      @click="selectArrival(props, $event)"
                    ></v-checkbox>
                  </td>
                  <td>{{ props.item.ShipName }}</td>
                  <td>{{ props.item.Voyage }}</td>
                  <td>{{ formatDate(props.item.ArrivalDate, 3) }}</td>
                  <td class="text-xs-right">{{ containerNum(props.item.Items) }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="showContainerList(props)"
                    >列出貨櫃</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-data-table
                      :pagination.sync="containerListPagination"
                      :headers="containerListHeaders"
                      :items="containerList"
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
                          <td class="text-xs-right">{{ props.item.year }}</td>
                          <td class="text-xs-right">{{ props.item.month }}</td>
                          <td>{{ periodStr(props.item.period) }}</td>
                          <td class="text-xs-right">{{ props.item.containerId }}</td>
                          <td>{{ props.item.containerNo }}</td>
                          <td>{{ formatDate(props.item.pickupDate, 3) }}</td>
                          <td>{{ props.item.warehouse }}</td>
                        </tr>
                      </template>
                    </v-data-table>
                    <v-btn flat @click.native="props.expanded = false">關閉</v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" :disabled="selectedArrival.length === 0" @click.native="step = 2">下一步</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="2">
          <v-card class="mb-5">
            <h3>對照比較分櫃表</h3>
            <v-layout row wrap>
              <v-flex key="col1" xs2>
                <v-card>
                  <v-card-text>
                    <div>請選擇對照比較的分櫃表項目</div>
                    <v-select
                      v-model="selectedBatch"
                      :items="batchList"
                      item-text="Label"
                      label="選擇分櫃表項目"
                      persistent-hint
                      return-object
                      single-line
                    ></v-select>
                    <v-btn @click="populateVerifyTable">更新對照表</v-btn>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex key="col2" xs10>
                <v-card>
                  <v-card-text>
                    <hot-table root="table" :settings="verifyTblSettings" ref="table"></hot-table>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
          <v-btn @click.native="step = 1">回上一步, 選擇貨櫃清單</v-btn>
          <v-btn color="primary" @click.native="step = 3">下一步</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <v-layout row wrap>
              <v-flex key="col1" xs5>
                <v-card>
                  <v-card-text>
                    <v-data-table
                      :pagination.sync="pickupListPagination"
                      :headers="pickupListHeaders"
                      :items="pickupList"
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
                          <td class="text-xs-right">{{ props.item.containerId }}</td>
                          <td>{{ props.item.containerNo }}</td>
                          <td>{{ formatDate(props.item.pickupDate, 3) }}</td>
                          <td>{{ props.item.warehouse }}</td>
                          <td><v-btn @click="props.expanded = true">設定拖櫃資料</v-btn></td>
                        </tr>
                      </template>
                      <template slot="expand" slot-scope="props">
                        <v-card flat>
                          <v-card-text>
                            <v-menu
                              lazy
                              :close-on-content-click="false"
                              v-model="menuPickupDate"
                              transition="scale-transition"
                              offset-y
                              full-width
                              :nudge-right="40"
                              max-width="290px"
                              min-width="290px"
                            >
                              <v-text-field
                                slot="activator"
                                label="拖櫃日期"
                                v-model="pickupDate"
                                :rules="pickupDateRules"
                                required
                                prepend-icon="event"
                                readonly
                              ></v-text-field>
                              <v-date-picker locale="zh-TW" v-model="pickupDate" no-title scrollable actions>
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
                              v-model="selectedWarehouse"
                              :items="warehouseList"
                              item-text="WarehouseCode"
                              label="選擇倉庫"
                              persistent-hint
                              return-object
                              single-line
                            ></v-select>
                            <v-btn flat @click.native="clearPickupData(props)">清除資料</v-btn>
                            <v-btn flat :disabled="pickupDate === null || selectedWarehouse === null" @click.native="setupPickupData(props)">完成</v-btn>
                          </v-card-text>
                        </v-card>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex key="col2" xs7>
                <v-card>
                  <v-card-text>
                    <hot-table root="table" :settings="tblSettings" ref="table"></hot-table>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
          <v-btn flat @click.native="step = 2">回上一步</v-btn>
          <v-btn color="primary" @click.native="completePickupDialog = true">完成拖櫃作業</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="4">
          <v-card class="mb-5">
            <h3>建立貨櫃清單完成</h3>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇貨櫃清單</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <v-dialog v-model="completePickupDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">完成拖櫃作業</v-card-title>
        <v-card-text>確定要完成拖櫃作業?</v-card-text>
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
    <v-dialog v-model="confirmPurchaseDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">確認採購完成</v-card-title>
        <v-card-text>確認採購的項目已經全部完成?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="confirmPurchaseDialog = false">取消</v-btn>
          <v-btn
            flat
            primary
            @click.native="confirmPurchase"
          >確定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>  </div>
</template>
<script>
  import eventBus from '@/libs/event'
  import service from '@/libs/service'
  import utility from '@/libs/utility'
  import HotTable from '@handsontable/vue'
  import 'handsontable/dist/handsontable.css'
  import HandsonTable from 'handsontable'

  export default {
    name: 'ContainerPickup',
    metaInfo: {
      title: '拖櫃作業'
    },
    data () {
      return {
        step: 0,
        purchaseId: null,
        loading: false,
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        arrivalId: null,
        arrivalListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '船名', align: 'left', value: 'UpdateDate' },
          { text: '航次', align: 'left', value: 'StartDate' },
          { text: '到港日期', align: 'left', value: 'EndDate' },
          { text: '貨櫃數量', value: 'Items.length' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        arrivalList: [],
        selectedArrival: [],
        containerListPagination: {
          sortBy: 'id',
          descending: false
        },
        containerListHeaders: [
          { text: '年', value: 'year' },
          { text: '月', value: 'month' },
          { text: '批次', align: 'left', value: 'period' },
          { text: '貨櫃序號', value: 'containerId' },
          { text: '櫃號', align: 'left', value: 'containerNo' },
          { text: '拖櫃日期', align: 'left', value: 'pickupDate' },
          { text: '倉庫', align: 'left', value: 'warehouse' }
        ],
        containerList: [],
        batchList: [],
        selectedBatch: null,
        verifyTblSettings: {
          data: null,
          colWidths: 80,
          height: 500,
          colHeaders: [],
          columns: []
        },
        pickupListPagination: {
          sortBy: 'id',
          descending: false
        },
        pickupListHeaders: [
          { text: '貨櫃序號', value: 'containerId' },
          { text: '櫃號', align: 'left', value: 'containerNo' },
          { text: '拖櫃日期', align: 'left', value: 'pickupDate' },
          { text: '倉庫', align: 'left', value: 'warehouse' },
          {
            text: '輸入拖櫃資料',
            align: 'left',
            sortable: false
          }
        ],
        pickupList: [],
        menuPickupDate: false,
        pickupDate: null,
        pickupDateRules: [ (v) => !!v || '請輸入拖櫃日期' ],
        warehouseList: [],
        selectedWarehouse: null,
        tblSettings: {
          data: null,
          colWidths: 80,
          height: 600,
          colHeaders: [],
          columns: [],
          mergeCells: []
        },
        completePickupDialog: false,
        purchase: null,
        confirmPurchaseDialog: false
      }
    },
    watch: {
      'step': function (step) {
        // watch for step
        switch (step) {
          case '1':
          case 1:
            this.retrieveArrivalList()
            break
          case 2:
            this.retrieveBatchList()
            break
          case 3:
            this.retrieveWarehouseList()
            this.showPickupList()
            this.populateTable()
            break
          case 4:
            this.checkPurchaseFinish()
            break
        }
      }
    },
    methods: {
      formatDate (date, itemNum) {
        if (!date) return ''
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
      async retrieveArrivalList () {
        this.selectedArrival = []
        let failure = false
        try {
          let result = await service.Get('Arrival')
          if (result.status === 200 && result.data) {
            this.arrivalList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate arrival list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
        if (this.arrivalList.length > 0) {
          this.selectedArrival.push(this.arrivalList[0])
          this.arrivalId = this.arrivalList[0].ArrivalId
          this.purchaseId = this.arrivalList[0].Purchase
          this.supplierId = this.arrivalList[0].Supplier
        }
      },
      periodStr (period) {
        switch (period) {
          case 1:
            return '上旬'
          case 2:
            return '中旬'
          case 3:
            return '下旬'
        }
      },
      containerNum (items) {
        let containerList = []
        items.forEach(i => {
          if (containerList.findIndex(e => e.year === i.Year && e.month === i.Month && e.period === i.Period && e.containerId === i.ContainerId) === -1) {
            containerList.push({
              year: i.Year,
              month: i.Month,
              period: i.Period,
              containerId: i.ContainerId
            })
          }
        })
        return containerList.length
      },
      selectArrival (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedArrival = [ props.item ]
        this.arrivalId = props.item.ArrivalId
        this.purchaseId = props.item.Purchase
        this.supplierId = props.item.Supplier
      },
      showContainerList (props) {
        this.containerList = []
        let id = 0
        props.item.Items.forEach(i => {
          if (this.containerList.findIndex(e => e.year === i.Year && e.month === i.Month && e.period === i.Period && e.containerId === i.ContainerId) === -1) {
            this.containerList.push({
              id: id,
              year: i.Year,
              month: i.Month,
              period: i.Period,
              containerId: i.ContainerId,
              containerNo: i.ContainerNo,
              pickupDate: i.PickupDate,
              warehouse: i.WarehouseCode
            })
            id++
          }
        })
        props.expanded = true
      },
      async retrieveBatchList () {
        this.selectedBatch = null
        let failure = false
        try {
          let result = await service.Get(`List/BatchShipmentList/${this.purchaseId}`)
          if (result.status === 200 && result.data) {
            this.batchList = result.data
            let batch = this.selectedArrival[0].Batch
            this.selectedBatch = this.batchList.find(i => `${i.Year}-${i.Month}-${i.Period}` === batch)
            if (!this.selectedBatch) this.selectedBatch = this.batchList[0]
            this.populateVerifyTable()
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate batch shipment list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      async populateVerifyTable () {
        try {
          let result = await service.Get(`Table/ArrivalItemQuantityVerification/${this.arrivalId}?status=1&year=${this.selectedBatch.Year}&month=${this.selectedBatch.Month}&period=${this.selectedBatch.Period}`)
          if (result.status === 200 && result.data) {
            this.verifyTblSettings.data = result.data.data
            this.verifyTblSettings.colHeaders = result.data.colHeaders
            this.verifyTblSettings.columns = result.data.columns
            this.verifyTblSettings.cells = this.verifyCellProperty
          }
        } catch (e) {
          console.log(`populate table failure: ${e.message}`)
        }
      },
      verifyCellProperty (row, col, prop) {
        let properties = {}
        if (col === 6 || col === 8 || col === 10) {
          properties.numericFormat = { pattern: '0.0' }
        }
        let rowData = this.verifyTblSettings.data[row]
        if (rowData.DiffQuantity > 0) properties.renderer = this.overRenderer
        if (rowData.DiffQuantity < 0) properties.renderer = this.underRenderer
        return properties
      },
      overRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        td.style.fontWeight = 'bold'
        td.style.background = 'lightcyan'
      },
      underRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        td.style.fontWeight = 'bold'
        td.style.background = 'lightpink'
      },
      async retrieveWarehouseList () {
        try {
          let result = await service.Get(`List/WarehouseList/${this.supplierId}`)
          if (result.status === 200 && result.data) {
            this.warehouseList = result.data
          }
        } catch (e) {
          console.log(`populate table failure: ${e.message}`)
        }
      },
      showPickupList () {
        this.pickupList = []
        let id = 0
        this.selectedArrival[0].Items.forEach(i => {
          if (i.Status === 1 &&
            this.pickupList.findIndex(e => e.year === i.Year && e.month === i.Month && e.period === i.Period && e.containerId === i.ContainerId) === -1) {
            this.pickupList.push({
              id: id,
              year: i.Year,
              month: i.Month,
              period: i.Period,
              containerId: i.ContainerId,
              containerNo: i.ContainerNo,
              pickupDate: i.PickupDate,
              warehouse: i.WarehouseCode
            })
            id++
          }
        })
      },
      clearPickupData (props) {
        // reset data
        let year = props.item.year
        let month = props.item.month
        let period = props.item.period
        let containerId = props.item.containerId
        this.tblSettings.data.forEach(row => {
          if (row.Year === year && row.Month === month && row.Period === period && row.ContainerId === containerId) {
            row.PickupDate = null
            row.WarehouseId = null
          }
        })
        props.item.pickupDate = null
        props.item.warehouse = ''
        props.expanded = false
      },
      setupPickupData (props) {
        // console.log(`selected data: ${JSON.stringify(props.item)}`)
        props.item.warehouse = this.selectedWarehouse.WarehouseCode
        props.item.pickupDate = this.pickupDate
        // set data
        let year = props.item.year
        let month = props.item.month
        let period = props.item.period
        let containerId = props.item.containerId
        this.tblSettings.data.forEach(row => {
          // console.log(`data: ${JSON.stringify(row)}`)
          if (row.Year === year && row.Month === month && row.Period === period && row.ContainerId === containerId) {
            row.PickupDate = this.pickupDate
            row.WarehouseId = this.selectedWarehouse.WarehouseId
          }
        })
        props.expanded = false
      },
      async populateTable () {
        try {
          let result = await service.Get(`Table/ContainerPickup/${this.arrivalId}`)
          if (result.status === 200 && result.data) {
            result.data.data.forEach(r => {
              r.Ton = r.Quantity / r.ReamPerTon
            })
            this.tblSettings.data = result.data.data
            this.tblSettings.colHeaders = result.data.colHeaders
            this.tblSettings.columns = result.data.columns
            this.tblSettings.mergeCells = result.data.mergeCells
            this.tblSettings.cells = this.cellProperty
          }
        } catch (e) {
          console.log(`populate table failure: ${e.message}`)
        }
      },
      cellProperty (row, col, prop) {
        let properties = {}
        if (col === 13) {
          properties.numericFormat = { pattern: '0.00' }
        }
        if (col === 14) {
          properties.numericFormat = { pattern: '0.0' }
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
      async completePickup () {
        let failure = false
        try {
          let items = []
          this.tblSettings.data.forEach(i => {
            if (i.PickupDate && i.WarehouseId) {
              i.Status = 10
              items.push(i)
            }
          })
          let result = await service.Post('List/CompletePickup', items)
          if (result.status !== 204) {
            failure = true
          } else {
            this.step = 4
            this.completePickupDialog = false
            let filename =
              `拖櫃項目.xlsx`
            let success = await service.Download(
              `PickupNotification/${this.arrivalId}`,
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
      async checkPurchaseFinish () {
        let failure = false
        if (this.tblSettings.data.findIndex(i => i.Status === 1) === -1) {
          try {
            let result = await service.Get(`Purchase/${this.purchaseId}`)
            if (result.status === 200 && result.data) {
              this.purchase = result.data
            } else {
              failure = true
            }
          } catch (e) {
            failure = true
          }
          if (failure) {
            eventBus.$emit('snackbar', {
              message: '讀取資料失敗, 請再試一次.',
              color: 'error',
              show: true
            })
          } else {
            if (this.purchase.EndDate >= new Date()) {
              this.confirmPurchaseDialog = true
            }
          }
        }
      },
      async confirmPurchase () {
        let failure = false
        try {
          this.purchase.Status = 100
          this.purchase.Items = null
          let result = await service.Put('Purchase', this.purchase)
          if (result.status !== 204) {
            failure = true
          } else {
            this.confirmPurchaseDialog = false
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
