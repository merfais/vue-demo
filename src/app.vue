<script>
import Banner from 'components/banner'
import './assets/icofont.min.css'

export default {
  components: {
    Banner,
  },
  render() {
    return <div id="app">
      <banner />
      <router-view/>
    </div>
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
