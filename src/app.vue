<template>
<div id="app">
  <banner />
  <router-view/>
</div>
</template>
<script>
import Banner from 'components/banner'

export default {
  components: {
    Banner,
  },
}
</script>
<style lang='less' scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
