<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <h2>普通採購報價</h2>
    <br/>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">輸入報價內容</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step === 2">完成報價</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <h3>輸入價格(新台幣/令)/報價生效日期/報價失效日期</h3>
            <h4>價格為零的資料會被忽略, 不會建立報價資料.</h4>
            <p></p>
            <hot-table root="table" :settings="tblSettings" ref="table"></hot-table>
          </v-card>
          <v-btn color="primary" @click.native="completeQuotation">完成</v-btn>
          <v-btn flat @click.native="cancel">取消</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="2">
          <v-card class="mb-5">
            <h3>報價完成</h3>
            <p></p>
          </v-card>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <v-dialog
      v-model="showValidationMessage"
      width="400"
    >
      <v-card>
        <v-card-title>
          報價資料不合格
        </v-card-title>
        <v-card-text>
          <div v-html="validationMessage"></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="showValidationMessage = false"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
  import eventBus from '@/libs/event'
  import service from '@/libs/service'
  // import utility from '@/libs/utility'
  import HotTable from '@handsontable/vue'
  import 'handsontable/dist/handsontable.css'
  import HandsonTable from 'handsontable'

  export default {
    name: 'OrdinaryQuotation',
    metaInfo: {
      title: '普通採購報價'
    },
    data () {
      return {
        step: 0,
        autoComplete: null,
        loading: false,
        tblSettings: {
          data: null,
          colWidths: 80,
          height: 500,
          colHeaders: [],
          columns: []
        },
        showValidationMessage: false,
        validationMessage: null
      }
    },
    watch: {
      'step': function (step) {
        // watch for step
        switch (step) {
          case '1':
          case 1:
            this.populateTable()
            break
          case 2:
            break
        }
      }
    },
    methods: {
      async populateTable () {
        try {
          let result = await service.Get('Table/QuotationForPrintHouse')
          if (result.status === 200 && result.data) {
            this.tblSettings.data = result.data.data
            this.tblSettings.colHeaders = result.data.colHeaders
            this.tblSettings.columns = result.data.columns
            this.tblSettings.cells = this.cellProperty
            // this.tblSettings.afterChange = this.tableChanged
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
          if (col === 1) properties.numericFormat = { pattern: '0.0000000000' }
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
      validation () {
        let valid = true
        let message = ''
        this.tblSettings.data.forEach((row, index) => {
          console.log(JSON.stringify(row))
          let priceValid = true
          let price = row.Price
          if (price !== 0 && !price) {
            message += `第${index + 1}列價格請輸入數字.<br>`
            priceValid = false
          }
          if (priceValid && Number.isNaN(+price)) {
            message += `第${index + 1}列價格請輸入數字.<br>`
            priceValid = false
          }
          if (priceValid && +price < 0) {
            message += `第${index + 1}列價格請輸入大於零的數字.<br>`
            priceValid = false
          }
          let updateDateValid = true
          let date = row.UpdateTime
          if (!this.validateDate(date)) {
            message += `第${index + 1}列生效日期請輸入日期.<br>`
            updateDateValid = false
          }
          let expireDateValid = true
          date = row.ExpireDate
          if (!this.validateDate(date)) {
            message += `第${index + 1}列失效日期請輸入日期.<br>`
            expireDateValid = false
          }
          if (!priceValid || !updateDateValid || !expireDateValid) valid = false
        })
        console.log(message)
        if (!valid) {
          this.validationMessage = message
          this.showValidationMessage = true
        }
        return valid
      },
      validateDate (dateStr) {
        if (!dateStr) return false
        let result = dateStr.match(/^\d+\/\d+\/\d+$/g)
        if (!result) return false
        if (isNaN(Date.parse(dateStr))) return false
        return true
      },
      async completeQuotation () {
        let valid = this.validation()
        if (!valid) return
        this.tblSettings.data.forEach(row => { row.Price = row.Price / 500 })
        let failure = false
        try {
          let result = await service.Post('Table/AddQuotationForPrintHouse', this.tblSettings.data)
          if (result.status === 204) {
            this.step = 2
          } else {
            failure = true
          }
        } catch (e) {
          console.log(`add quotation failure: ${e.message}`)
          failure = true
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '新增報價失敗, 請再試一次.',
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
