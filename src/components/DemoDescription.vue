<template>
  <div>
    <h1>展示說明</h1>
    <p>本展示為印刷廠採購作業網站, 前端使用Vue.js實現Single Page Application, 後端使用ASP.NET Web API連接MS SQL Server.</p>
    <p>展示分為兩大部分: 採溝介面, 供應商介面</p>
    <h2>採購介面展示功能</h2>
    <p>登入採購介面的帳號: demo<br />密碼: 1234</p>
    <h3><a href="/#/Subject">紙張資料維護</a></h3>
    <ul style="margin-left: 20px;">
      <li>多重步驟導引</li>
      <li>紙張清單</li>
    </ul>
    <h3><a href="/#/Consumption">紙張消耗/預估</a></h3>
    <ul style="margin-left: 20px;">
      <li>具備不同資料格式, 可以直接編輯的線上表格</li>
    </ul>
    <h3><a href="/#/CreateRFQ">建立詢價資料</a></h3>
    <ul style="margin-left: 20px;">
      <li>下載動態產生的Excel(採購計畫草稿)</li>
      <li>上傳匯入Excel(採購計畫)</li>
    </ul>
    <p></p>
    <h2>供應商介面展示功能</h2>
    <p>登入供應商介面的帳號: supplier<br />密碼: 1234</p>
    <h3><a href="/#/bulkPurchaseOrder">大量採購訂單</a></h3>
    <ul style="margin-left: 20px;">
      <li>選取訂單</li>
      <li>下載動態產生的Excel(分櫃表)</li>
    </ul>
    <h3><a href="/#/DownloadPurchase">下載採購單</a></h3>
    <ul style="margin-left: 20px;">
      <li>選取採購單(多選)</li>
      <li>下載動態產生的PDF</li>
    </ul>
    <h3><a href="/#/Bidding">議價採購單報價</a></h3>
    <ul style="margin-left: 20px;">
      <li>選取採購單</li>
      <li>輸入報價內容</li>
    </ul>
    <h3><a href="/#/OrdinaryQuotation">普通採購報價</a></h3>
    <ul style="margin-left: 20px;">
      <li>線上輸入表格</li>
    </ul>
  </div>
</template>
