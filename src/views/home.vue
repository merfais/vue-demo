<template>
<div class="home-wrapper">
  <div class='name-wrapper'>
    <img class='logo' alt="Vue logo" src="../assets/logo.png">
    <label class='name'>vue-demo</label>
  </div>
  <div class='nav-wrapper'>
    <div v-for="item in demoLinks"
      :key="item.name"
      class="item-wrapper"
      >
      <a-icon class='pre-icon' type="swap-right" />
      <router-link :to="item.link">{{item.name}}</router-link>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      demoLinks: [{
        name: '在线编代码编辑，实时预览',
        link: '/custom-code',
      }, {
        name: '富文本编辑器QEditor',
        link: '/q-editor',
      }],
    };
  },
  created() {
    this.$store.commit('setState', { filePath: '' });
  },
};
</script>

<style lang='less' scoped>
.name-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;

  .logo {
    margin: 10px 10px 0 0;
    height: 70px;
    width: 70px;
  }

  .name {
    font-size: 80px;
    font-weight: 700;
    font-style: italic;
  }
}
.nav-wrapper {
  padding: 30px;
  text-align: center;
  font-size: 20px;

  .item-wrapper {
    display: flex;
    align-items: center;
    padding-left: 100px;

    &:hover {
      color: #1890ff;
    }

    a {
      font-weight: bold;
      color: #2c3e50;
    }

    a:hover {
      color: #1890ff;
      border-bottom: 1px solid #1890ff;
    }

    a.router-link-exact-active {
      color: #42b983;
    }

    .pre-icon {
      font-size: 40px;
      font-weight: 600;
      padding-right: 20px;
    }
  }
}
</style>
