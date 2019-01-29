<template xmlns:v-on="">
  <div>
    <v-dialog v-model="dateDialog" persistent max-width="600">
      <v-btn slot="activator">更改起始年月</v-btn>
      <v-card>
        <v-card-title class="headline">更改起始年月</v-card-title>
        <v-card-text>
          <v-form v-model="dateForm.valid" ref="dateForm" lazy-validation>
            <v-text-field
              name="year"
              label="起始年度"
              v-model="dateForm.year"
              :rules="dateForm.yearRules"
              required
            ></v-text-field>
            <v-text-field
              name="month"
              label="起始月份"
              v-model="dateForm.month"
              :rules="dateForm.monthRules"
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
    name: 'Consumption',
    metaInfo: {
      title: '紙張消耗/預估'
    },
    created () {
      let now = new Date()
      this.dateForm.year = now.getFullYear()
      this.dateForm.month = now.getMonth() + 1
      this.refreshTable()
    },
    data () {
      return {
        dateDialog: false,
        dateForm: {
          valid: false,
          yearRules: [
            (v) => !!v || '請輸入年度',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => +v > 2016 || '必須大於2016'
          ],
          monthRules: [
            (v) => !!v || '請輸入月份',
            (v) => Number.isInteger(+v) || '請輸入整數',
            (v) => (+v > 0 && +v < 13) || '必須大於零且小於13'
          ],
          year: null,
          month: null
        },
        tblSettings: {
          data: null,
          colWidths: 80,
          height: 780,
          fixedRowsTop: 2,
          fixedColumnsLeft: 4,
          rowHeaders: true,
          colHeaders: [],
          columns: []
        },
        overrideList: []
      }
    },
    props: {
    },
    methods: {
      async refreshTable () {
        try {
          eventBus.$emit('loading', true)
          let result = await service.Get(`Consumption?year=${this.dateForm.year}&month=${this.dateForm.month}`)
          eventBus.$emit('loading', false)
          if (result.status === 200 && result.data) {
            this.tblSettings.data = result.data.data
            this.tblSettings.colHeaders = result.data.colHeaders
            this.tblSettings.columns = result.data.columns
            this.overrideList = result.data.overrideList
            this.tblSettings.cells = this.cellProperty
            this.tblSettings.afterChange = this.tableChanged
          }
        } catch (e) {
          eventBus.$emit('loading', false)
          console.log(`populate consumption table failure: ${e.message}`)
        }
        this.dateDialog = false
      },
      cellProperty (row, col, prop) {
        let properties = {}
        if (row <= 1) {
          if (col >= 4 && col % 2 !== 0) {
            properties.numericFormat = { pattern: '0.00' }
            if (this.tblSettings.columns[col].readOnly) {
              properties.renderer = this.forecastRenderer
            } else {
              properties.renderer = this.editableRenderer
            }
          }
          return properties
        }
        properties.readOnly = true
        if (col < 4) return properties
        if (col % 2 === 0) return properties
        properties.renderer = this.forecastRenderer
        if (!this.tblSettings.columns[col].readOnly) {
          properties.readOnly = false
          properties.renderer = this.editableRenderer
          let data = this.tblSettings.data[row]
          let column = this.tblSettings.columns[col]
          if (this.overrideList.findIndex(e => e.SubjectId === data.SubjectId && e.Year === column.year && e.Month === column.month) >= 0) {
            properties.renderer = this.overrideRenderer
          }
          /*
          if (this.tblSettings.data[row][prop] === 0) {
            properties.readOnly = false
            properties.renderer = this.editableRenderer
          } else {
            let data = this.tblSettings.data[row]
            let column = this.tblSettings.columns[col]
            if (this.overrideList.findIndex(e => e.SubjectId === data.SubjectId && e.Year === column.year && e.Month === column.month) >= 0) {
              properties.readOnly = false
              properties.renderer = this.editableRenderer
            }
          }
          */
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
      overrideRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        td.style.fontWeight = 'bold'
        td.style.background = 'lightpink'
      },
      async tableChanged (changes, source) {
        // console.log(JSON.stringify(changes))
        if (changes && (changes[0][2] !== changes[0][3])) {
          let row = changes[0][0]
          let data = changes[0][1]
          let value = changes[0][3]
          let col = this.tblSettings.columns.findIndex(e => e.data === data)
          let subject = this.tblSettings.data[row].SubjectId
          let year = this.tblSettings.columns[col].year
          let month = this.tblSettings.columns[col].month
          console.log(`subject: ${subject}, year: ${year}, month: ${month}, value: ${value}`)
          if (!this.validateValue(value)) {
            this.refreshTable()
            return
          }
          let failure = false
          let param
          switch (row) {
            case 0:
              param = {
                subjectId: 0,
                year: year,
                month: month,
                yearForecastFactor: value,
                monthForecastFactor: 0,
                forecast: 0
              }
              break
            case 1:
              param = {
                subjectId: 0,
                year: year,
                month: month,
                yearForecastFactor: 0,
                monthForecastFactor: value,
                forecast: 0
              }
              break
            default:
              param = {
                subjectId: subject,
                year: year,
                month: month,
                yearForecastFactor: 0,
                monthForecastFactor: 0,
                forecast: value
              }
              let index = this.overrideList.findIndex(e => e.SubjectId === subject && e.Year === year && e.Month === month)
              if (index >= 0) {
                if (value === 0) {
                  this.overrideList.splice(index, 1)
                } else {
                  this.overrideList[index].forecast = value
                }
              } else {
                this.overrideList.push({
                  SubjectId: subject,
                  Year: year,
                  Month: month,
                  Forecast: value
                })
              }
              break
          }
          try {
            let result = await service.Put('Consumption', param)
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
          this.refreshTable()
        }
      },
      validateValue (value) {
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
        if (valid && +value < 0) {
          message = '請輸入大於零的數字'
          valid = false
        }
        if (!valid) {
          eventBus.$emit('snackbar', {
            message: message,
            color: 'error',
            show: true
          })
        }
        return valid
      }
    },
    components: {
      HotTable
    }
  }
</script>
<style scoped>
  .tbl-container {
    border: solid 1px;
    height: 600px;
    overflow-y: scroll;
  }
</style>
