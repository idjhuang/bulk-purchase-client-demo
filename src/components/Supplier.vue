<template xmlns:v-bind="">
  <div>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇/新增供應商</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">選擇大量採購項目對應紙張</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step === 3">完成設定</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-dialog v-model="addSupplierDialog" persistent max-width="600">
              <v-btn slot="activator" @click="showAddSupplierDialog">新增供應商</v-btn>
              <v-card>
                <v-card-title class="headline">新增供應商</v-card-title>
                <v-card-text>
                  <v-select
                    v-bind:items="printHouseList"
                    v-model="printHouse"
                    label="選擇紙商"
                    single-line
                    item-text="Name"
                    item-value="Id"
                    autocomplete
                  ></v-select>
                  <v-text-field
                    name="supplierName"
                    label="供應商名稱"
                    v-model="supplierName"
                    :rules="supplierNameRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    name="TonPerContainer"
                    label="供應商每櫃噸數"
                    v-model="tonPerContainer"
                    :rules="tonPerContainerRules"
                    required
                  ></v-text-field>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn flat @click.native="addSupplierDialog = false">取消</v-btn>
                  <v-btn
                    flat
                    primary
                    :disabled="!(printHouse && supplierName && tonPerContainer)"
                    @click.native="addSupplier"
                  >完成</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-data-table
              :headers="supplierListHeaders"
              :items="supplierList"
              v-model="selectedSupplier"
              item-key="SupplierId"
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
                      @click="selectSupplier(props, $event)"
                    ></v-checkbox>
                  </td>
                  <td>{{ props.item.SupplierName }}</td>
                  <td>{{ props.item.PrintHouseName }}</td>
                  <td class="text-xs-right">{{ props.item.TonPerContainer}}</td>
                </tr>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" :disabled="selectedSupplier.length === 0" @click.native="step = 2">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="2">
          <v-card class="mb-5">
            <v-data-table
              :headers="subjectListHeaders"
              :items="subjectList"
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
                  <td>{{ props.item.Type }}</td>
                  <td class="text-xs-right">{{ props.item.Weight }}</td>
                  <td class="text-xs-right">{{ props.item.Length }}</td>
                  <td class="text-xs-right">{{ props.item.Width }}</td>
                  <td>{{ props.item.ProductNo }}</td>
                  <td>{{ props.item.Site }}</td>
                  <td>{{ props.item.Brand }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="initSelectItem(props)"
                    >選擇紙張</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-select
                      v-bind:items="price25ItemList"
                      v-model="price25Item"
                      label="選擇紙張"
                      single-line
                      item-text="ProductNo"
                      item-value="ProductNo"
                      autocomplete
                    ></v-select>
                    <v-text-field
                      name="site"
                      label="產地"
                      v-model="site"
                      required
                    ></v-text-field>
                    <v-text-field
                      name="brand"
                      label="品牌"
                      v-model="brand"
                      required
                    ></v-text-field>
                    <v-btn
                      flat
                      primary
                      @click="selectItem(props)">完成</v-btn>
                    <v-btn flat @click.native="props.expanded = false">取消</v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" @click.native="step = 3">完成</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <h3>完成設定</h3>
            <p></p>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇其他的供應商</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>
<script>
  import eventBus from '@/libs/event'
  import service from '@/libs/service'

  export default {
    name: 'Supplier',
    metaInfo: {
      title: '廠商資料維護'
    },
    data () {
      return {
        step: null,
        addSupplierDialog: false,
        printHouseList: [],
        printHouse: null,
        supplierName: null,
        supplierNameRules: [ (v) => !!v || '請輸入供應商名稱' ],
        tonPerContainer: null,
        tonPerContainerRule: [
          (v) => !!v || '請輸入每櫃噸數',
          (v) => Number.isInteger(+v) || '請輸入整數',
          (v) => +v > 0 || '必須大於零'
        ],
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        supplierListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '供應商', align: 'left', value: 'SupplierName' },
          { text: '紙商', align: 'left', value: 'PrintHouseName' },
          { text: '每櫃噸數', value: 'TonPerContainer' }
        ],
        supplierList: [],
        selectedSupplier: [],
        supplierId: null,
        subjectListHeaders: [
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '紙張名稱', align: 'left', value: 'ProductNo' },
          { text: '產地', align: 'left', value: 'Site' },
          { text: '品牌', align: 'left', value: 'Brand' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        subjectList: [],
        price25ItemList: [],
        price25Item: null,
        site: null,
        brand: null
      }
    },
    watch: {
      'step': function (step) {
        // watch for step
        switch (step) {
          case '1':
          case 1:
            this.retrieveSupplierList()
            break
          case 2:
            this.retrieveSubjectList()
            break
          case 3:
            break
        }
      }
    },
    methods: {
      async showAddSupplierDialog () {
        this.printHouse = null
        this.supplierName = null
        let failure = false
        try {
          let result = await service.Get('Account/List')
          if (result.status === 200 && result.data) {
            this.printHouseList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate printHouse list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
          this.addSupplierDialog = false
        }
      },
      async addSupplier () {
        let failure = false
        try {
          let result = await service.Post('List/Supplier', {
            PrintHouseId: this.printHouse,
            SupplierName: this.supplierName,
            TonPerContainer: this.tonPerContainer
          })
          if (result.status === 200 && result.data) {
            this.selectedSupplier = [ result.data ]
            this.supplierId = result.data.SupplierId
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate printHouse list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '新增資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          this.addSupplierDialog = false
          this.step = 2
        }
      },
      async retrieveSupplierList () {
        this.selectedSupplier = []
        let failure = false
        try {
          let result = await service.Get('List/SupplierAll')
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
        if (this.supplierList.length > 0) {
          this.selectedSupplier.push(this.supplierList[0])
          this.supplierId = this.supplierList[0].SupplierId
        }
      },
      selectSupplier (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedSupplier = [ props.item ]
        this.supplierId = props.item.SupplierId
      },
      async retrieveSubjectList () {
        let failure = false
        let productList = []
        try {
          let result = await service.Get(`SupplierRelationship/${this.supplierId}`)
          if (result.status === 200 && result.data) {
            productList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate subject list failure: ${e.message}`)
        }
        try {
          let result = await service.Get('Subject')
          if (result.status === 200 && result.data) {
            this.subjectList = result.data
            this.subjectList.forEach(s => {
              s.ProductNo = null
            })
            productList.forEach(r => {
              let s = this.subjectList.find(e => e.Id === r.Subject)
              if (s) {
                s.ProductNo = r.ProductNo
                s.Site = r.Site
                s.Brand = r.Brand
              }
            })
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate subject list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
      },
      async initSelectItem (props) {
        let subject = props.item.Id
        let failure = false
        try {
          let result = await service.Get(`SubjectRelationship/${subject}`)
          if (result.status === 200 && result.data) {
            this.price25ItemList = [ { ProductNo: '' } ].concat(result.data)
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate price25Item list failure: ${e.message}`)
        }
        this.price25Item = props.item.ProductNo
        this.site = props.item.Site
        this.brand = props.item.Brand
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
          props.expanded = false
        } else {
          props.expanded = true
        }
      },
      async selectItem (props) {
        let failure = false
        try {
          if (props.item.ProductNo) {
            let result = await service.Delete(`SupplierRelationship/${this.supplierId}`, {
              ProductNo: props.item.ProductNo })
            if (result.status !== 204) {
              failure = true
            } else {
              props.item.ProductNo = null
            }
          }
          if (this.price25Item !== '') {
            let result = await service.Post(`SupplierRelationship/${this.supplierId}`, {
              ProductNo: this.price25Item,
              Site: this.site,
              Brand: this.brand
            })
            if (result.status !== 204) {
              failure = true
            } else {
              props.item.ProductNo = this.price25Item
              props.item.Site = this.site
              props.item.Brand = this.brand
            }
          }
        } catch (e) {
          failure = true
          console.log(`update supplier relationship failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
          return
        }
        props.expanded = false
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
