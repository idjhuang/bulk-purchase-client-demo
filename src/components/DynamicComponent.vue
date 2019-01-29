<template>
  <component :is="componentLoader" :options="options">
  </component>
</template>

<script>
  export default {
    name: 'dynamic-component',
    props: {
      componentFile: {
        type: String,
        default: () => null
      },
      options: {
        type: Array,
        default: () => []
      }
    },
    mounted () {
      if (this.$props.componentFile) {
        this.loadComponent()
      }
    },
    computed: {
      componentLoader () {
        return () => import(`@/${this.componentFile}`)
      }
    },
    methods: {
      loadComponent () {
        this.componentLoader().then(comp => {
          console.log(`component ${comp.name} loaded.`)
        })
      }
    }
  }
</script>
