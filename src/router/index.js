import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
// common
import Home from '@/components/Home'
import Login from '@/components/Login'
import Notification from '@/components/Notification'
import DemoDescription from '@/components/DemoDescription'
// for topcolor
import Subject from '@/components/Subject'
import Supplier from '@/components/Supplier'
import Consumption from '@/components/Consumption'
import RollingForecast from '@/components/RollingForecast'
import CreateRFQ from '@/components/CreateRFQ'
import ConfirmQuotation from '@/components/ConfirmQuotation'
import ContainerAllocation from '@/components/ContainerAllocation'
import ContainerPickup from '@/components/ContainerPickup'
// for supplier
import Quotation from '@/components/Quotation'
import UpdateQuotation from '@/components/UpdateQuotation'
import UpdatePurchasePrice from '@/components/UpdatePurchasePrice'
import BulkPurchaseOrder from '@/components/BulkPurchaseOrder'
import ContainerArrival from '@/components/ContainerArrival'
import PickupNotification from '@/components/PickupNotification'
import DownloadPurchase from '@/components/DownloadPurchase'
import Bidding from '@/components/Bidding'
import UpdateBidding from '@/components/UpdateBidding'
import OrdinaryQuotation from '@/components/OrdinaryQuotation'

import DownloadPlan from '@/components/DownloadPlan'
import ImportTable from '@/components/ImportTable'
import Test from '@/components/Test'

Vue.use(Router)
Vue.use(Meta)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/notification',
      name: 'Notification',
      component: Notification
    },
    {
      path: '/demoDescription',
      name: 'DemoDescription',
      component: DemoDescription
    },
    // for topcolor
    {
      path: '/subject',
      name: 'Subject',
      component: Subject
    },
    {
      path: '/supplier',
      name: 'Supplier',
      component: Supplier
    },
    {
      path: '/consumption',
      name: 'Consumption',
      component: Consumption
    },
    {
      path: '/rollingforecast',
      name: 'RollingForecast',
      component: RollingForecast
    },
    {
      path: '/createRFQ',
      name: 'CreateRFQ',
      component: CreateRFQ
    },
    {
      path: '/confirmQuotation',
      name: 'ConfirmQuotation',
      component: ConfirmQuotation
    },
    {
      path: '/containerAllocation',
      name: 'ContainerAllocation',
      component: ContainerAllocation
    },
    {
      path: '/containerPickup',
      name: 'ContainerPickup',
      component: ContainerPickup
    },
    // for supplier
    {
      path: '/quotation',
      name: 'Quotation',
      component: Quotation
    },
    {
      path: '/updateQuotation',
      name: 'UpdateQuotation',
      component: UpdateQuotation
    },
    {
      path: '/updatePurchasePrice',
      name: 'UpdatePurchasePrice',
      component: UpdatePurchasePrice
    },
    {
      path: '/bulkPurchaseOrder',
      name: 'BulkPurchaseOrder',
      component: BulkPurchaseOrder
    },
    {
      path: '/containerArrival',
      name: 'ContainerArrival',
      component: ContainerArrival
    },
    {
      path: '/pickupNotification',
      name: 'PickupNotification',
      component: PickupNotification
    },
    {
      path: '/downloadPurchase',
      name: 'DownloadPurchase',
      component: DownloadPurchase
    },
    {
      path: '/bidding',
      name: 'Bidding',
      component: Bidding
    },
    {
      path: '/updateBidding',
      name: 'UpdateBidding',
      component: UpdateBidding
    },
    {
      path: '/ordinaryQuotation',
      name: 'OrdinaryQuotation',
      component: OrdinaryQuotation
    },
    {
      path: '/importTable',
      name: 'ImportTable',
      component: ImportTable
    },
    {
      path: '/downloadPlan',
      name: 'DownloadPlan',
      component: DownloadPlan
    },
    {
      path: '/test',
      name: 'Test',
      component: Test
    }
  ]
})
