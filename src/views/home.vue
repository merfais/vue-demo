<template>
<div class="home">
  <img alt="Vue logo" src="../assets/logo.png">
  <div class='nav'>
    <router-link to="/custom-code?component">custom code</router-link>
  </div>
</div>
</template>

<script>
export default {
  name: 'Home',
  components: {
  },
};
</script>

<style lang='less' scoped>
.nav {
  padding: 30px;
}

.nav a {
  font-weight: bold;
  color: #2c3e50;
}

.nav a.router-link-exact-active {
  color: #42b983;
}
</style>
