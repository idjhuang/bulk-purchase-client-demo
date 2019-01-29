<template>
  <div>
    <h3>Sample 2</h3>
    <p>{{message}}: <slot></slot></p>
  </div>
</template>

<script>
  export default {
    name: 'Sample2',
    props: {
      message: null
    }
  }
</script>

<style scoped>

</style>
