<template xmlns:v-on="" xmlns:v-bind="">
  <div>
    <h2>貨櫃清單</h2>
    <br/>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1">選擇/新增貨櫃清單</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2">選取對應分櫃表的貨櫃</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step > 3">輸入貨櫃清單項目內容</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="4" :complete="step > 4">對照比較分櫃表</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="5" :complete="step === 5">完成貨櫃清單</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content :step="1">
          <v-card class="mb-5">
            <v-dialog v-model="addArrivalDialog" persistent max-width="1000">
              <v-btn slot="activator" @click="showAddArrivalDialog">新增貨櫃清單</v-btn>
              <v-card v-if="addArrivalStep === 1">
                <v-card-title class="headline">新增貨櫃清單</v-card-title>
                <v-card-text>
                  <h3>選擇訂單</h3>
                  <p></p>
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
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn flat @click.native="addArrivalDialog = false">取消</v-btn>
                  <v-btn
                    flat
                    primary
                    :disabled="selectedPurchase.length === 0"
                    @click.native="addArrivalStep = 2"
                  >下一步</v-btn>
                </v-card-actions>
              </v-card>
              <v-card v-if="addArrivalStep === 2">
                <v-card-title class="headline">新增貨櫃清單</v-card-title>
                <v-card-text>
                  <h3>輸入資料並選擇對應分櫃表的項目</h3>
                  <p></p>
                  <v-form v-model="arrivalForm.valid" ref="arrivalForm" lazy-validation>
                    <v-text-field
                      name="shipName"
                      label="船名"
                      v-model="arrivalForm.shipName"
                      :rules="arrivalForm.shipNameRules"
                      required
                    ></v-text-field>
                    <v-text-field
                      name="voyage"
                      label="航次"
                      v-model="arrivalForm.voyage"
                      :rules="arrivalForm.voyageRules"
                      required
                    ></v-text-field>
                    <v-menu
                      lazy
                      :close-on-content-click="false"
                      v-model="menuArrivalDate"
                      transition="scale-transition"
                      offset-y
                      full-width
                      :nudge-right="40"
                      max-width="290px"
                      min-width="290px"
                    >
                      <v-text-field
                        slot="activator"
                        label="到港日期"
                        v-model="arrivalForm.arrivalDate"
                        :rules="arrivalForm.arrivalDateRules"
                        required
                        prepend-icon="event"
                        readonly
                      ></v-text-field>
                      <v-date-picker locale="zh-TW" v-model="arrivalForm.arrivalDate" no-title scrollable actions>
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
                      v-model="menuAvailableDate"
                      transition="scale-transition"
                      offset-y
                      full-width
                      :nudge-right="40"
                      max-width="290px"
                      min-width="290px"
                    >
                      <v-text-field
                        slot="activator"
                        label="拖櫃開始日期"
                        v-model="arrivalForm.availableDate"
                        :rules="arrivalForm.availableDateRules"
                        required
                        prepend-icon="event"
                        readonly
                      ></v-text-field>
                      <v-date-picker locale="zh-TW" v-model="arrivalForm.availableDate" no-title scrollable actions>
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
                      v-model="menuGraceDate"
                      transition="scale-transition"
                      offset-y
                      full-width
                      :nudge-right="40"
                      max-width="290px"
                      min-width="290px"
                    >
                      <v-text-field
                        slot="activator"
                        label="拖櫃寬限日期"
                        v-model="arrivalForm.graceDate"
                        :rules="arrivalForm.graceDateRules"
                        required
                        prepend-icon="event"
                        readonly
                      ></v-text-field>
                      <v-date-picker locale="zh-TW" v-model="arrivalForm.graceDate" no-title scrollable actions>
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
                      v-model="selectedBatch"
                      :items="batchList"
                      item-text="Label"
                      label="選擇對應分櫃表項目"
                      persistent-hint
                      return-object
                      single-line
                    ></v-select>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn flat @click.native="addArrivalDialog = false">取消</v-btn>
                  <v-btn
                    flat
                    primary
                    :disabled="!arrivalForm.valid"
                    @click.native="createArrival"
                  >完成</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
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
            <v-data-table
              :pagination.sync="containerListPagination"
              :headers="containerListHeaders"
              :items="containerList"
              v-model="selectedContainers"
              item-key="id"
              select-all
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
                  <td class="text-xs-right">{{ props.item.year }}</td>
                  <td class="text-xs-right">{{ props.item.month }}</td>
                  <td>{{ periodStr(props.item.period) }}</td>
                  <td class="text-xs-right">{{ props.item.containerId }}</td>
                  <td>{{ props.item.containerNo }}</td>
                  <td>
                    <v-btn flat @click="props.expanded = true">顯示項目</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-data-table
                      :headers="containerItemListHeaders"
                      :items="props.item.Items"
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
                          <td class="text-xs-right">{{ props.item.Pallet }}</td>
                          <td class="text-xs-right">{{ props.item.Quantity }}</td>
                        </tr>
                      </template>
                    </v-data-table>
                    <v-btn flat @click.native="props.expanded = false">關閉</v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card>
          <v-btn color="primary" @click.native="syncSelectedContainers">下一步</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="3">
          <v-card class="mb-5">
            <h3>貨櫃清單</h3>
            <v-layout row wrap>
              <v-flex key="col1" xs2>
                <v-card>
                  <v-card-text>
                    <v-dialog v-model="addItemsDialog" persistent max-width="800">
                      <v-btn slot="activator" @click="showAddItemsDialog">新增貨櫃/清單項目</v-btn>
                      <v-card>
                        <v-card-title class="headline">新增貨櫃/清單項目</v-card-title>
                        <v-card-text>
                          <div>請選擇加入項目的貨櫃以及新增項目(可複選)</div>
                          <v-select
                            v-model="addedContainer"
                            :items="selectContainerList"
                            item-text="label"
                            label="選擇貨櫃"
                            persistent-hint
                            return-object
                            single-line
                          ></v-select>
                          <v-data-table
                            :headers="supplierItemListHeaders"
                            :items="supplierItemList"
                            v-model="selectedSupplierItems"
                            item-key="Subject"
                            select-all
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
                                <td>{{ props.item.Type }}</td>
                                <td class="text-xs-right">{{ props.item.Weight }}</td>
                                <td class="text-xs-right">{{ props.item.Length }}</td>
                                <td class="text-xs-right">{{ props.item.Width }}</td>
                                <td>{{ props.item.Price25Item }}</td>
                              </tr>
                            </template>
                          </v-data-table>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn flat @click.native="addItemsDialog = false">取消</v-btn>
                          <v-btn
                            flat
                            primary
                            @click.native="addArrivalItems"
                            :disabled="selectedSupplierItems.length === 0"
                          >確定</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-divider></v-divider>
                    <p>下載貨櫃清單, 輸入櫃號與更新數量後再上傳匯入</p>
                    <v-btn @click="downloadArrivalContainers">下載貨櫃清單</v-btn>
                    <br/>
                    <v-divider></v-divider>
                    <form v-on:submit="ignore">
                      <file-input
                        :key="fileInputKey"
                        accept="*.xls"
                        label="選擇匯入的貨櫃清單"
                        ref="fileInput"
                        v-on:formData="setUploadFormData"
                      ></file-input>
                      <v-btn
                        :loading="loading"
                        @click.native="uploadArrivalContainers"
                        :disabled="loading || !uploadFormData"
                        color="blue-grey"
                        class="white--text"
                      >
                        匯入貨櫃清單
                        <v-icon right dark>cloud_upload</v-icon>
                      </v-btn>
                    </form>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex key="col2" xs10>
                <v-card>
                  <v-card-text>
                    <hot-table root="table" :settings="tblSettings" ref="table"></hot-table>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
          <v-btn flat @click.native="step = 2">重新選取對應分櫃表的貨櫃</v-btn>
          <v-btn color="primary" @click.native="step = 4">下一步</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="4">
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
          <v-btn @click.native="step = 3">回上一步, 輸入貨櫃清單項目內容</v-btn>
          <v-btn color="primary" @click.native="completeArrivalDialog = true">完成貨櫃清單</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
        <v-stepper-content :step="5">
          <v-card class="mb-5">
            <h3>建立貨櫃清單完成</h3>
          </v-card>
          <v-btn color="primary" @click.native="step = 1">選擇/新增貨櫃清單</v-btn>
          <v-btn flat @click.native="cancel">離開</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <v-dialog v-model="completeArrivalDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">完成貨櫃清單</v-card-title>
        <v-card-text>確定要完成貨櫃清單?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="completeArrivalDialog = false">取消</v-btn>
          <v-btn
            flat
            primary
            @click.native="completeArrival"
          >確定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    name: 'ContainerArrival',
    metaInfo: {
      title: '貨櫃清單'
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
        addArrivalDialog: false,
        addArrivalStep: 1,
        arrivalForm: {
          valid: false,
          shipNameRules: [ (v) => !!v || '請輸入船名' ],
          voyageRules: [ (v) => !!v || '請輸入航次' ],
          arrivalDateRules: [ (v) => !!v || '請輸入到港日期' ],
          availableDateRules: [ (v) => !!v || '請輸入拖櫃開始日期' ],
          graceDateRules: [ (v) => !!v || '請輸入拖櫃寬限日期' ],
          shipName: null,
          voyage: null,
          arrivalDate: null,
          availableDate: null,
          graceDate: null
        },
        menuArrivalDate: false,
        menuAvailableDate: false,
        menuGraceDate: false,
        arrivalId: null,
        supplierId: null,
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
          {
            text: '顯示項目',
            align: 'left',
            sortable: false
          }
        ],
        containerList: [],
        selectedContainers: [],
        arrivalContainers: [],
        containerItemListHeaders: [
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '產品名稱', align: 'left', value: 'Price25Item' },
          { text: '棧板數', value: 'Pallet' },
          { text: '數量(令數)', value: 'Quantity' }
        ],
        addItemsDialog: false,
        addedContainer: null,
        selectContainerList: [],
        supplierItemListHeaders: [
          { text: '紙種', align: 'left', value: 'Type' },
          { text: '克重', value: 'Weight' },
          { text: '寬', value: 'Length' },
          { text: '高', value: 'Width' },
          { text: '品名', align: 'left', value: 'Price25Item' }
        ],
        supplierItemList: [],
        selectedSupplierItems: [],
        fileInputKey: 0,
        uploadFormData: null,
        uploadSuccessed: false,
        tblSettings: {
          data: null,
          colWidths: 80,
          height: 500,
          colHeaders: [],
          columns: [],
          mergeCells: []
        },
        verifyTblSettings: {
          data: null,
          colWidths: 80,
          height: 500,
          colHeaders: [],
          columns: []
        },
        batchList: [],
        selectedBatch: null,
        completeArrivalDialog: false
      }
    },
    watch: {
      'step': function (step) {
        // watch for step
        switch (step) {
          case '1':
          case 1:
            this.retrieveArrivalList()
            this.retrievePurchaseList()
            break
          case 2:
            this.retrieveContainerList()
            break
          case 3:
            this.populateTable()
            break
          case 4:
            this.retrieveBatchList(true)
            break
        }
      }
    },
    methods: {
      showAddArrivalDialog () {
        this.addArrivalStep = 1
        this.retrieveBatchList(false)
      },
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
          default:
            return ''
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
      async createArrival () {
        let failure = false
        let purchase = this.selectedPurchase[0]
        let batch = `${this.selectedBatch.Year}-${this.selectedBatch.Month}-${this.selectedBatch.Period}`
        let arrival = {
          Purchase: purchase.Id,
          Supplier: purchase.SupplierId,
          ShipName: this.arrivalForm.shipName,
          Voyage: this.arrivalForm.voyage,
          ArrivalDate: this.arrivalForm.arrivalDate,
          AvailableDate: this.arrivalForm.availableDate,
          GraceDate: this.arrivalForm.graceDate,
          Batch: batch
        }
        try {
          let result = await service.Post('Arrival', arrival)
          if (result.status === 200 && result.data) {
            arrival.ArrivalId = result.data
            this.selectedArrival = [ arrival ]
            this.arrivalId = result.data
            this.supplierId = arrival.Supplier
            this.step = 2
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`create arrival failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '建立貨櫃清單失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
        this.addArrivalDialog = false
      },
      async retrieveArrivalList () {
        this.selectedArrival = []
        let failure = false
        try {
          let result = await service.Get('List/ArrivalForSupplier/0')
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
          default:
            return ''
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
              containerNo: i.ContainerNo
            })
            id++
          }
        })
        props.expanded = true
      },
      async retrieveContainerList () {
        let failure = false
        try {
          let result = await service.Get(`Arrival/${this.arrivalId}`)
          if (result.status === 200 && result.data) {
            this.selectedArrival = [ result.data ]
            result = await service.Get(`List/ContainerList/${this.arrivalId}`)
            if (result.status === 200 && result.data) {
              this.containerList = result.data
            } else {
              failure = true
            }
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate container list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        }
        // set selected containers & arrival container
        this.selectedContainers = []
        this.arrivalContainers = []
        this.selectedArrival[0].Items.forEach(i => {
          if (this.selectedContainers.findIndex(e => e.year === i.Year && e.month === i.Month && e.period === i.Period && e.containerId === i.ContainerId) === -1) {
            this.selectedContainers.push({
              year: i.Year,
              month: i.Month,
              period: i.Period,
              containerId: i.ContainerId,
              containerNo: i.ContainerNo
            })
          }
          if (this.arrivalContainers.findIndex(e => e.year === i.Year && e.month === i.Month && e.period === i.Period && e.containerId === i.ContainerId) === -1) {
            this.arrivalContainers.push({
              year: i.Year,
              month: i.Month,
              period: i.Period,
              containerId: i.ContainerId
            })
          }
        })
        this.selectedContainers.forEach(c => {
          let t = this.containerList.find(e => e.year === c.year && e.month === c.month && e.period === c.period && e.containerId === c.containerId)
          if (t) {
            c.id = t.id
          }
        })
      },
      async syncSelectedContainers () {
        let addList = []
        let removeList = []
        this.selectedContainers.forEach(c => {
          if (this.arrivalContainers.findIndex(e => e.year === c.year && e.month === c.month && e.period === c.period && e.containerId === c.containerId) === -1) {
            addList.push({
              id: this.arrivalId,
              year: c.year,
              month: c.month,
              period: c.period,
              containerId: c.containerId
            })
          }
        })
        this.arrivalContainers.forEach(c => {
          if (this.selectedContainers.findIndex(e => e.year === c.year && e.month === c.month && e.period === c.period && e.containerId === c.containerId) === -1) {
            removeList.push({
              id: this.arrivalId,
              year: c.year,
              month: c.month,
              period: c.period,
              containerId: c.containerId
            })
          }
        })
        let failure = false
        const addPromises = addList.map(async i => {
          try {
            let result = await service.Post('ArrivalItem', i)
            if (result.status !== 204) {
              failure = true
            }
          } catch (e) {
            failure = true
            console.log(`sync selected containers failure: ${e.message}`)
          }
        })
        await Promise.all(addPromises)
        const removePromises = removeList.map(async i => {
          try {
            let result = await service.Delete('ArrivalItem', i)
            if (result.status !== 204) {
              failure = true
            }
          } catch (e) {
            failure = true
            console.log(`sync selected containers failure: ${e.message}`)
          }
        })
        await Promise.all(removePromises)
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '更新資料失敗, 請再刷新頁面一次.',
            color: 'error',
            show: true
          })
        } else {
          this.step = 3
        }
      },
      async showAddItemsDialog () {
        this.retrieveSupplierItems()
        // retrieve new container
        let failure = false
        let newContainer
        try {
          let result = await service.Get(`ArrivalItem/${this.arrivalId}`)
          if (result.status === 200 && result.data) {
            newContainer = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`retrieve new container failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
          return
        }
        // populate selectContainerList
        newContainer.label = '增加新的貨櫃'
        this.addedContainer = newContainer
        this.selectContainerList = [ newContainer ]
        this.tblSettings.data.forEach(i => {
          let container = {
            label: i.ContainerNo ? `櫃號${i.ContainerNo} ${i.Year}年${i.Month}月${i.PeriodStr} 貨櫃序號${i.ContainerId}` : `${i.Year}年${i.Month}月${i.PeriodStr} 貨櫃序號${i.ContainerId}`,
            year: i.Year,
            month: i.Month,
            period: i.Period,
            containerId: i.ContainerId,
            containerNo: i.ContainerNo
          }
          if (this.selectContainerList.findIndex(e => {
            return e.year === container.year && e.month === container.month && e.period === container.period && e.containerId === container.containerId
          }) === -1) {
            this.selectContainerList.push(container)
          }
        })
        this.addItemsDialog = true
      },
      async retrieveSupplierItems () {
        this.selectedSupplierItems = []
        let failure = false
        try {
          let result = await service.Get(`List/AllSupplierItemList/${this.supplierId}`)
          if (result.status === 200 && result.data) {
            this.supplierItemList = result.data
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`populate supplier item list failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '讀取資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      async addArrivalItems () {
        // add arrival items
        console.log(`target container: ${JSON.stringify(this.addedContainer)}`)
        console.log(`selected items: ${JSON.stringify(this.selectedSupplierItems)}`)
        let itemList = []
        this.selectedSupplierItems.forEach(i => {
          itemList.push({
            ArrivalId: this.arrivalId,
            SubjectId: i.Subject,
            Year: this.addedContainer.year,
            Month: this.addedContainer.month,
            Period: this.addedContainer.period,
            ContainerId: this.addedContainer.containerId,
            ContainerNo: this.addedContainer.containerNo,
            Quantity: 0,
            ReamPerPallet: i.ReamPerPallet,
            Pallet: 0,
            SustainDuration: null,
            PickupDate: null,
            WarehouseId: null,
            Status: 0
          })
        })
        let failure = false
        try {
          let result = await service.Post('List/AddArrivalItems', itemList)
          if (result.status === 204) {
            this.populateTable()
            this.addItemsDialog = false
          } else {
            failure = true
          }
        } catch (e) {
          failure = true
          console.log(`add arrival items failure: ${e.message}`)
        }
        if (failure) {
          eventBus.$emit('snackbar', {
            message: '寫入資料失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
      },
      async downloadArrivalContainers () {
        let filename = `貨櫃清單(${this.arrivalId}).xlsx`
        let success = await service.Download(
          `ArrivalContainers/${this.arrivalId}`,
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
      async uploadArrivalContainers () {
        this.loading = true
        this.uploadSuccessed = false
        let result = await service.Upload(`ArrivalContainers/${this.arrivalId}`, this.uploadFormData)
        if (result.status === 200) {
          eventBus.$emit('snackbar', {
            message: result.data,
            color: 'success',
            show: true
          })
          this.fileInputKey++
          this.uploadFormData = null
          this.uploadSuccessed = true
          this.populateTable()
        } else {
          eventBus.$emit('snackbar', {
            message: '上傳失敗, 請再試一次.',
            color: 'error',
            show: true
          })
        }
        this.loading = false
      },
      async populateTable () {
        try {
          let result = await service.Get(`Table/ArrivalItem/${this.arrivalId}`)
          if (result.status === 200 && result.data) {
            result.data.data.forEach(r => {
              r.Ton = r.Pallet * r.ReamPerPallet / r.ReamPerTon
            })
            this.tblSettings.data = result.data.data
            this.tblSettings.colHeaders = result.data.colHeaders
            this.tblSettings.columns = result.data.columns
            this.tblSettings.mergeCells = result.data.mergeCells
            this.tblSettings.cells = this.cellProperty
            this.tblSettings.afterChange = this.tableChanged
          }
        } catch (e) {
          console.log(`populate table failure: ${e.message}`)
        }
      },
      cellProperty (row, col, prop) {
        let properties = {}
        if (col === 13 || col === 10) {
          properties.numericFormat = { pattern: '0.0' }
        }
        if (col === 15 || col === 9 || col === 12) {
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
      async tableChanged (changes, source) {
        if (changes && (changes[0][2] !== changes[0][3])) {
          let row = changes[0][0]
          let data = changes[0][1]
          let value = changes[0][3]
          let rowData = this.tblSettings.data[row]
          let tmpRow = row
          // check & retrieve correct container no
          while (rowData.ContainerNo === null) {
            tmpRow--
            rowData.ContainerNo = this.tblSettings.data[tmpRow].ContainerNo
          }
          // validate value
          if (data === 'Pallet') {
            if (!Number.isInteger(+value)) {
              rowData.Pallet = changes[0][2]
              eventBus.$emit('snackbar', {
                message: '請輸入整數.',
                color: 'error',
                show: true
              })
              return
            }
            if (+value < 0) {
              rowData.Pallet = changes[0][2]
              eventBus.$emit('snackbar', {
                message: '必須大於等於零.',
                color: 'error',
                show: true
              })
              return
            }
          }
          if (data === 'ReamPerPallet') {
            if (Number.isNaN(Number.parseFloat(value))) {
              rowData.ReamPerPallet = changes[0][2]
              eventBus.$emit('snackbar', {
                message: '請輸入數字.',
                color: 'error',
                show: true
              })
              return
            }
            if (+value <= 0) {
              rowData.ReamPerPallet = changes[0][2]
              eventBus.$emit('snackbar', {
                message: '必須大於零.',
                color: 'error',
                show: true
              })
              return
            }
          }
          rowData.Quantity = rowData.Pallet * rowData.ReamPerPallet
          rowData.Ton = rowData.Pallet * rowData.ReamPerPallet / rowData.ReamPerTon
          // console.log(`containerNo: ${rowData.ContainerNo}, reamPerPallet: ${rowData.ReamPerPallet}, pallet: ${rowData.Pallet}, value: ${value}`)
          let failure = false
          let result = await this.updateArrivalItem(rowData)
          if (!result) failure = true
          if (data === 'ContainerNo') {
            let tmpRow = row + 1
            let rData = this.tblSettings.data[tmpRow]
            while (rData.ContainerNo === null) {
              rData.ContainerNo = value
              result = await this.updateArrivalItem(rData)
              if (!result) failure = true
              tmpRow++
              rData = this.tblSettings.data[tmpRow]
            }
            /*
            let rowCount = this.tblSettings.mergeCells[0].rowspan
            if (rowCount > 1) {
              for (let r = 1; r < rowCount; r++) {
                let rData = this.tblSettings.data[row + r]
                rData.ContainerNo = value
                result = await this.updateArrivalItem(rData)
                if (!result) failure = true
              }
            }
            */
          }
          if (failure) {
            eventBus.$emit('snackbar', {
              message: '更新資料失敗, 請再試一次.',
              color: 'error',
              show: true
            })
          }
        }
      },
      async updateArrivalItem (item) {
        // console.log('update item: ' + JSON.stringify(item))
        let param = {
          ArrivalId: this.arrivalId,
          SubjectId: item.SubjectId,
          Year: item.Year,
          Month: item.Month,
          Period: item.Period,
          ContainerId: item.ContainerId,
          ContainerNo: item.ContainerNo,
          Quantity: item.Quantity,
          ReamPerPallet: item.ReamPerPallet,
          Pallet: item.Pallet,
          Note: item.Note
        }
        try {
          let result = await service.Put('ArrivalItem', param)
          if (result.status !== 204) return false
          return true
        } catch (e) {
          console.log(`update arrival item failure: ${e.message}`)
          return false
        }
      },
      async retrieveBatchList (populateVerifyTable) {
        this.selectedBatch = null
        let failure = false
        try {
          let result = await service.Get(`List/BatchShipmentList/${this.purchaseId}`)
          if (result.status === 200 && result.data) {
            this.batchList = result.data
            if (populateVerifyTable) {
              let batch = this.selectedArrival[0].Batch
              this.selectedBatch = this.batchList.find(i => `${i.Year}-${i.Month}-${i.Period}` === batch)
            } else {
              let now = new Date()
              let year = now.getFullYear()
              let month = now.getMonth() + 1
              let date = now.getDate()
              let period = 3
              if (date <= 10) period = 1
              if (date <= 20) period = 2
              this.selectedBatch = this.batchList.find(i => i.Year === year && i.Month === month && i.Period === period)
            }
            if (!this.selectedBatch) this.selectedBatch = this.batchList[0]
            if (populateVerifyTable) this.populateVerifyTable()
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
          let result = await service.Get(`Table/ArrivalItemQuantityVerification/${this.arrivalId}?status=0&year=${this.selectedBatch.Year}&month=${this.selectedBatch.Month}&period=${this.selectedBatch.Period}`)
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
        /*
        if (col === 9 || col === 10) {
          properties.renderer = this.alertRenderer
        }
        */
        let rowData = this.verifyTblSettings.data[row]
        if (rowData.DiffQuantity > 0) properties.renderer = this.overRenderer
        if (rowData.DiffQuantity < 0) properties.renderer = this.underRenderer
        return properties
      },
      alertRenderer (instance, td, row, col, prop, value, cellProperties) {
        HandsonTable.renderers.NumericRenderer.apply(this, arguments)
        if (+value < 0) {
          td.style.fontWeight = 'bold'
          td.style.background = 'lightpink'
        }
        if (+value > 0) {
          td.style.fontWeight = 'bold'
          td.style.background = 'lightcyan'
        }
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
      async completeArrival () {
        let failure = false
        try {
          let result = await service.Patch('ArrivalItem', { ArrivalId: this.arrivalId, Status: 1 })
          if (result.status !== 204) {
            failure = true
          } else {
            this.step = 5
            this.completeArrivalDialog = false
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
