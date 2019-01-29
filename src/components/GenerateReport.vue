<template>
  <div>
    <form>
      <h2>請輸入下載的檔案名稱</h2>
      <v-text-field
        name="filename"
        label="檔名"
        v-model="filename"
        required
      ></v-text-field>
      <v-btn flat @click="download">下載</v-btn>
    </form>
  </div>
</template>
<script>
  import service from '@/libs/service'

  export default {
    data () {
      return {
        filename: null
      }
    },
    props: {},
    methods: {
      download () {
        service.Download(
          `File/${this.filename}`,
          'blob',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'test.xls'
        )
      }
    },
    components: {}
  }
</script>
<style scoped>
</style>
