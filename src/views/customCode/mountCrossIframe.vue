<template>
<iframe
  ref="iframe"
  src='http://127.0.0.1:8000/iframe.html'
  frameborder="0"
  scrolling="no"
  width="100%"
  />
</template>
<script>
import has from 'lodash/has'
import forEach from 'lodash/forEach'
import { runFnInVm } from '@/utils/vm'

export default {
  name: 'codePreview',
  props: {
    template: String,
    js: String,
    css: String,
  },
  data() {
    return {
    }
  },
  computed: {
    component() {
      let template = (this.template || '')
        .replace(/^ *< *template *>|<\/ *template *> *$/g, '')
        .trim()

      const js = (this.js || '').trim()
      const result = runFnInVm(js, {})
      result.css = this.css
      const component = result.value
      if (result.error) {
        template = this.genErrorTpl({
          type: 'js脚本错误',
          msg: result.error.toString(),
        })
      }

      // 如果需要注入一些变量，则对被注入的字段进行检测
      // 防止用户代码中定义了此字段，导致冲突
      const error = this.checkVariableField(component)
      if (error) {
        template = this.genErrorTpl(error)
      }

      // 注入template或render，设定template优先级高于render
      if (template) {
        component.template = template
        component.render = undefined
      } else if (!component.render) {
        component.template = '<span>未提供模板或render函数</span>'
      }

      // 注入errorCaptured, 用于错误自定义组件运行时捕获
      component.errorCaptured = (err, vm, info) => {
        // 调用iframe域的renderError方法
        window.renderError({
          msg: err && err.toString && err.toString(),
          type: '自定义组件运行时错误：',
        })
        console.error('自定义组件运行时错误：', err, vm, info)
      }

      // 通过propsData注入一些变量，比如store中的一些字段，
      // 当store中的变量发生变化时，也会引发组件重绘
      const map = {}
      const keys = Object.keys(this.$store.state.variable.map)
      forEach(keys, (key) => {
        map[key] = this.$store.state.variable.map[key]
      })
      component.props = ['variable']
      component.propsData = { variable: map }

      return component
    },
  },
  watch: {
    component() {
      if (this.resolve) {
        this.mountCode()
      } else {
        new Promise((resolve) => {
          this.resolve = resolve
        }).then(() => {
          this.mountCode()
        })
      }
    },
  },
  methods: {
    genErrorTpl({ type, msg }) {
      return `<div style='color: red'><div>${type}</div><div>${msg}</div></div>`
    },
    checkVariableField(component) {
      // 如果需要注入一些变量，比如名字叫variable
      let data = component.data
      if (typeof data === 'function') {
        // 如果data是函数，执行后取data的结果
        // 用于行为无法预知，可能定义了错误的data，需要trycatch防崩
        // catch的异常不用关心
        try {
          data = data()
        } catch (e) {}
      }
      if (has(component, 'computed.variable')
          || has(data, 'variable')
      ) {
        return {
          type: '功能限制',
          msg: '禁止自定义名称是variable的computed或data，会影响系统变量的使用',
        }
      }
    },
    serialize(data) {
      if (Object.prototype.toString.call(data) === '[object Object]') {
        const result = {}
        forEach(data, (item, key) => {
          result[key] = this.serialize(item)
        })
        return result
      }
      if (typeof data === 'function') {
        return encodeURI(`##${data.toString()}##`)
      }
      if (Array.isArray(data)) {
        return data.map(item => this.serialize(item))
      }
      return data
    },
    mountCode() {
      this.$refs.iframe.contentWindow.postMessage({
        event: 'mount',
        component: this.serialize(this.component),
        css: this.css,
      }, '*')
    },
  },
  beforeCreate() {
    window.addEventListener('message', (event) => {
      const msg = event.data
      if (msg.event === 'mutationObserverBody' && msg.data && msg.data.height) {
        this.$refs.iframe.height = `${msg.data.height}px`
      } else if (msg.event === 'mounted' && msg.data && msg.data.vue) {
        this.resolve()
      }
    }, false)
  },
  mounted() {
  },
}
</script>
<style lang='less' scoped>
</style>
