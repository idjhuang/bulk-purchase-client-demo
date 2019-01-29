<template>
  <div>
    Test for dynamic component
    <input v-model="componentFileStr" type="text">
    <textarea v-model="optionStr" cols="40"></textarea>
    <button @click="setComponent">設定元件</button>
    <dynamic-component :componentFile="componentFile" :option="option">{{slot}}</dynamic-component>
  </div>
</template>
<script>
  import DynamicComponent from '@/components/DynamicComponent'

  export default {
    data () {
      return {
        componentFileStr: 'components/Sample1.vue',
        optionStr: '',
        componentFile: 'components/Sample1.vue',
        option: [],
        slot: null
      }
    },
    methods: {
      setComponent () {
        this.componentFile = this.componentFileStr
        this.option = JSON.parse(this.optionStr)
      }
    },
    components: {
      DynamicComponent
    }
  }
</script>
<style scoped>
</style>
