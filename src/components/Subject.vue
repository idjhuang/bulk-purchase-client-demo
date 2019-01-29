<template xmlns:v-bind="">
  <div>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇/新增大量採購項目</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">設定大量採購項目對應紙張</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step === 3">完成設定</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-dialog v-model="removePaperDialog" persistent max-width="400">
              <v-btn :disabled="selectedSubject.length === 0" slot="activator">停用大量採購項目</v-btn>
              <v-card>
                <v-card-title class="headline">停用大量採購項目</v-card-title>
                <v-card-text>確定要停用選擇的大量採購項目?</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn flat @click.native="removePaperDialog = false">取消</v-btn>
                  <v-btn
                    flat
                    primary
                    @click.native="removePaper"
                  >確定</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="addPaperDialog" persistent max-width="600">
              <v-btn slot="activator">新增大量採購項目</v-btn>
              <v-card>
                <v-card-title class="headline">新增大量採購項目</v-card-title>
                <v-card-text>
                  <v-form v-model="paperDataForm.valid" ref="paperDataForm" lazy-validation>
                    <v-text-field
                      name="type"
                      label="紙種"
                      v-model="paperDataForm.Type"
                      :rules="paperDataForm.TypeRules"
                      required
                    ></v-text-field>
                    <v-text-field
                      name="Weight"
                      label="克重"
                      v-model="paperDataForm.Weight"
                      :rules="paperDataForm.WeightRules"
                      required
                    ></v-text-field>
                    <v-text-field
                      name="Length"
                      label="寬"
                      v-model="paperDataForm.Length"
                      :rules="paperDataForm.LengthRules"
                      required
                    ></v-text-field>
                    <v-text-field
                      name="Width"
                      label="高"
                      v-model="paperDataForm.Width"
                      :rules="paperDataForm.WidthRules"
                      required
                    ></v-text-field>
                    <v-text-field
                      name="TonPerContainer"
                      label="每櫃噸數"
                      v-model="paperDataForm.TonPerContainer"
                      :rules="paperDataForm.TonPerContainerRules"
                      required
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn flat @click.native="addPaperDialog = false">取消</v-btn>
                  <v-btn
                    flat
                    primary
                    :disabled="!paperDataForm.valid"
                    @click.native="addPaper"
                  >完成</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-data-table
              :pagination.sync="subjectListPagination"
              :headers="subjectListHeaders"
              :items="subjectList"
              v-model="selectedSubject"
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
                      @click="selectSubject(props, $event)"
                    ></v-checkbox>
                  </td>
                  <td>{{ props.item.Type }}</td>
                  <td class="text-xs-right">{{ props.item.Weight }}</td>
                  <td class="text-xs-right">{{ props.item.Length }}</td>
                  <td class="text-xs-right">{{ props.item.Width }}</td>
                  <td class="text-xs-right">{{ props.item.TonPerContainer }}</td>
                  <td class="text-xs-right">{{ props.item.ConsumptionPerDay }}</td>
                  <td class="text-xs-right">{{ props.item.RelatedItemCount }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="initTonPerContainerForm(props)"
                    >設定每櫃噸數</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-form v-model="tonPerContainerForm.valid" ref="tonPerContainerForm" lazy-validation v-on:submit="ignore">
                      <v-text-field
                        name="tonPerContainer"
                        label="每櫃噸數"
                        v-model="tonPerContainerForm.tonPerContainer"
                        :rules="tonPerContainerForm.tonPerContainerRules"
                        required
                      ></v-text-field>
                      <v-btn
                        flat
                        primary
                        :disabled="!tonPerContainerForm.valid"
                        @click="updateTonPerContainer(props)">完成</v-btn>
                      <v-btn flat @click.native="props.expanded = false">取消</v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" :disabled="selectedSubject.length === 0" @click.native="step = 2">下一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="2">
          <v-card class="mb-5">
            <v-dialog v-model="removeProductDialog" persistent max-width="400">
              <v-btn :disabled="selectedProducts.length === 0" slot="activator">刪除對應庫存紙張</v-btn>
              <v-card>
                <v-card-title class="headline">刪除對應庫存紙張</v-card-title>
                <v-card-text>確定要刪除選擇的對應庫存紙張?</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn flat @click.native="removeProductDialog = false">取消</v-btn>
                  <v-btn
                    flat
                    primary
                    @click.native="removeProducts"
                  >確定</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="addProductDialog" persistent max-width="600">
              <v-btn slot="activator" @click="showAddProductDialog">新增對應庫存紙張</v-btn>
              <v-card>
                <v-card-title class="headline">新增對應庫存紙張 {{subjectName}}</v-card-title>
                <v-card-text>
                  <v-form v-model="productForm.valid" ref="addProductForm" lazy-validation v-on:submit="ignore">
                    <v-select
                      v-bind:items="price25ItemList"
                      v-model="productForm.productNo"
                      label="選擇對應庫存紙張"
                      single-line
                      autocomplete
                    ></v-select>
                    <v-text-field
                      name="type"
                      label="紙種"
                      v-model="productForm.type"
                      :rules="productForm.typeRules"
                      required
                    ></v-text-field>
                    <v-text-field
                      name="weight"
                      label="克重"
                      v-model="productForm.weight"
                      :rules="productForm.weightRules"
                      required
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    flat
                    primary
                    :disabled="!productForm.valid"
                    @click="addProduct">完成</v-btn>
                  <v-btn flat @click.native="addProductDialog = false">取消</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-data-table
              :headers="productListHeaders"
              :items="productList"
              v-model="selectedProducts"
              item-key="ProductNo"
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
                    ></v-checkbox>
                  </td>
                  <td>{{ props.item.ProductNo }}</td>
                  <td>{{ props.item.Type }}</td>
                  <td class="text-xs-right">{{ props.item.Weight }}</td>
                  <td>
                    <v-btn
                      flat
                      @click="initProductForm(props)"
                    >設定紙種克重</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-form v-model="productForm.valid" ref="updateProductForm" lazy-validation v-on:submit="ignore">
                      <v-text-field
                        name="type"
                        label="紙種"
                        v-model="productForm.type"
                        :rules="productForm.typeRules"
                        required
                      ></v-text-field>
                      <v-text-field
                        name="weight"
                        label="克重"
                        v-model="productForm.weight"
                        :rules="productForm.weightRules"
                        required
                      ></v-text-field>
                      <v-btn
                        flat
                        primary
                        :disabled="!productForm.valid"
                        @click="updateProduct(props)">完成</v-btn>
                      <v-btn flat @click.native="props.expanded = false">取消</v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" @click.native="step = 3">完成</v-btn>
          <v-btn flat @click.native="step = 1">回上一步</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <h3>完成設定</h3>
            <p></p>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇其他的大量採購項目</v-btn>
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
    name: 'Subject',
    metaInfo: {
      title: '紙張資料維護'
    },
    data () {
      return {
        step: null,
        removePaperDialog: false,
        addPaperDialog: false,
        paperDataForm: {
          valid: false,
          TypeRules: [ (v) => !!v || '請輸入紙種' ],
          WeightRules: [
            (v) => !!v || '請輸入克重',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => +v > 0 || '必須大於零'
          ],
          LengthRules: [
            (v) => !!v || '請輸入寬度',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => +v > 0 || '必須大於零'
          ],
          WidthRules: [
            (v) => !!v || '請輸入高度',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => +v > 0 || '必須大於零'
          ],
          TonPerContainerRules: [
            (v) => !!v || '請輸入每櫃噸數',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => +v >= 5 || '必須大於等於5'
          ],
          Type: null,
          Weight: null,
          Length: null,
          Width: null,
          TonPerContainer: null
        },
        subjectListPagination: {
          sortBy: null,
          descending: false
        },
        subjectListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '每櫃噸數', value: 'TonPerContainer' },
          { text: '每日用量', value: 'ConsumptionPerDay' },
          { text: '對應產品數', value: 'RelatedItemCount' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        subjectList: [],
        selectedSubject: [],
        subjectId: null,
        rowsPerPageItems: [ 10, 25, 50, { text: 'All', value: -1 } ],
        tonPerContainerForm: {
          valid: false,
          tonPerContainer: null,
          tonPerContainerRules: [
            (v) => !!v || '請輸入每櫃噸數',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => +v >= 5 || '必須大於等於5'
          ]
        },
        removeProductDialog: false,
        addProductDialog: false,
        subjectName: null,
        price25ItemList: [],
        productForm: {
          valid: false,
          productNo: null,
          type: null,
          typeRules: [ (v) => !!v || '請輸入紙種' ],
          weight: null,
          weightRules: [
            (v) => !!v || '請輸入克重',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => +v > 0 || '必須大於零'
          ]
        },
        productListHeaders: [
          {
            text: '',
            align: 'left',
            sortable: false
          },
          { text: '紙張名稱', align: 'left', value: 'ProductNo' },
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          {
            text: '',
            align: 'left',
            sortable: false
          }
        ],
        productList: [],
        selectedProducts: [],
        paperMappingSearch: null,
        paperMapping: {
          currentProps: null,
          loading: false,
          items: [],
          select: []
        }
      }
    },
    props: {
    },
    watch: {
      'step': function (step) {
        // watch for step
        switch (step) {
          case '1':
          case 1:
            this.populateSubjectList()
            break
          case 2:
            this.populateProductList()
            break
          case 3:
            break
        }
      }
    },
    methods: {
      async removePaper () {
        let failure = false
        let subject = this.selectedSubject[0]
        subject.Active = false
        try {
          let result = await service.Put('Subject', subject)
          if (result.status !== 204) failure = true
        } catch (e) {
          failure = true
          console.log(`remove paper failure: ${e.message}`)
        }
        this.populateSubjectList()
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '停用採購紙張失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
        this.removePaperDialog = false
      },
      async addPaper () {
        let failure = false
        if (!this.$refs.paperDataForm.validate()) return
        let paper = {
          Active: true,
          Type: this.paperDataForm.Type,
          Weight: this.paperDataForm.Weight,
          Length: this.paperDataForm.Length,
          Width: this.paperDataForm.Width,
          TonPerContainer: this.paperDataForm.TonPerContainer
        }
        try {
          let result = await service.Post('Subject', paper)
          console.log(`result: ${result.status}`)
          if (result.status === 204) {
            this.populateSubjectList()
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`add subject failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '新增採購紙張失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          this.paperDataForm.valid = false
          this.paperDataForm.Type = null
          this.paperDataForm.Weight = null
          this.paperDataForm.Length = null
          this.paperDataForm.Width = null
          this.paperDataForm.TonPerContainer = null
          this.addPaperDialog = false
        }
      },
      async populateSubjectList () {
        let failure = false
        try {
          let result = await service.Get('Subject')
          if (result.status === 200 && result.data) {
            this.subjectList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate subject failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
        if (this.subjectList.length > 0) {
          this.selectedSubject = [ this.subjectList[0] ]
          this.subjectId = this.subjectList[0].Id
        }
      },
      selectSubject (props, e) {
        if (e) e.preventDefault()
        if (props.selected) return
        this.selectedSubject = [ props.item ]
        this.subjectId = props.item.Id
      },
      initTonPerContainerForm (props) {
        this.tonPerContainerForm.tonPerContainer = props.item.TonPerContainer
        props.expanded = true
      },
      async updateTonPerContainer (props) {
        let failure = false
        try {
          let subject = {
            Id: props.item.Id,
            Active: true,
            Type: props.item.Type,
            Weight: props.item.Weight,
            Length: props.item.Length,
            Width: props.item.Width,
            TonPerContainer: this.tonPerContainerForm.tonPerContainer,
            ConsumptionPerDay: props.item.ConsumptionPerDay
          }
          let result =
            await service.Put('Subject', subject)
          if (result.status !== 204) {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`update subject failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新每櫃噸數失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          props.item.TonPerContainer = this.tonPerContainerForm.tonPerContainer
          props.expanded = false
        }
      },
      async removeProducts () {
        let failure = false
        const promises = this.selectedProducts.map(async item => {
          try {
            let result = await service.Delete('SubjectRelationship', item)
            if (result.status !== 204) {
              failure = true
            }
          } catch (e) {
            failure = true
            console.log(`remove product failure: ${e.message}`)
          }
        })
        await Promise.all(promises)
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          this.removeProductDialog = false
        }
        this.populateProductList()
      },
      async showAddProductDialog () {
        let failure = false
        try {
          let result = await service.Get(`List/Product/${this.subjectId}`)
          if (result.status === 200 && result.data) {
            this.productForm.productNo = null
            this.productForm.type = null
            this.productForm.weight = null
            this.price25ItemList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`query price25 items failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          this.subjectName = `${this.selectedSubject[0].Weight}g${this.selectedSubject[0].Type}${this.selectedSubject[0].Length}x${this.selectedSubject[0].Width}`
          this.addProductDialog = true
        }
      },
      async addProduct () {
        let failure = false
        try {
          let product = {
            Subject: this.subjectId,
            ProductNo: this.productForm.productNo,
            Type: this.productForm.type,
            Weight: this.productForm.weight
          }
          let result = await service.Post('SubjectRelationship', product)
          if (result.status !== 204) {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`add product failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '新增資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          this.populateProductList()
          this.addProductDialog = false
        }
      },
      async populateProductList () {
        this.selectedProducts = []
        let failure = false
        try {
          let result =
            await service.Get(`SubjectRelationship/${this.subjectId}`)
          if (result.status === 200 && result.data) {
            this.productList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`retrieve product list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
      },
      initProductForm (props) {
        this.productForm.type = props.item.Type
        this.productForm.weight = props.item.Weight
        props.expanded = true
      },
      async updateProduct (props) {
        let failure = false
        try {
          let product = {
            Subject: this.subjectId,
            ProductNo: props.item.ProductNo,
            Type: this.productForm.type,
            Weight: this.productForm.weight
          }
          let result = await service.Put('SubjectRelationship', product)
          if (result.status !== 204) {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`add product failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        } else {
          props.item.Type = this.productForm.type
          props.item.Weight = this.productForm.weight
          props.expanded = false
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
