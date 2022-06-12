<script>
import Editor from 'components/qEditor'

export default {
  name: '',
  components: {
    Editor,
  },
  data() {
    return {
      toolbar: [
        {
          name: 'bold',
          icon: 'icofont-bold',
          scopedSlots: {
            default: ({ onClick, active }) => {
              console.log('-------------------')
              const className = { 'active': active }
              return <button class={className} onClick={onClick}>加粗</button>
            }
          },
        },
      ]
    }
  },
  methods: {
  },
  render() {
    return <div class='wrapper'>
      <Editor
        toolbar={this.toolbar}
      />
    </div>

  },
  created() {
    this.$store.commit('setState', {
      filePath: 'views/qEditor/index.vue',
      pageName: '',
    })
  },
  mounted() {
  },
}
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  align-items: center;
  padding: 10px;
  flex-grow: 1;
}

</style>
