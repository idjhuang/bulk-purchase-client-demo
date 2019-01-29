<template>
  <div>
    <h3>Sample 1</h3>
    <p>{{message}}: <slot></slot></p>
  </div>
</template>

<script>
  export default {
    name: 'Sample1',
    props: {
      message: null
    }
  }
</script>

<style scoped>

</style>
