<template>
<iframe
  ref='iframe'
  frameborder="0"
  scrolling="no"
  width="100%"
  />
</template>
<script>
import has from 'lodash/has'
import forEach from 'lodash/forEach'
import { runFnInVm } from '@/utils/vm'
import {
  appendScriptLink,
  appendLink,
  prependDom,
  appendStyle,
  removeElement,
} from '@/utils/dom'

export default {
  name: 'codePreview',
  props: {
    template: String,
    js: String,
    css: String,
  },
  data() {
    return {
      subCompErr: null,
    }
  },
  computed: {
    component() {
      if (this.subCompErr) {
        return this.renderError(this.subCompErr)
      }
      const js = (this.js || '').trim()
      const result = runFnInVm(js, {})
      result.css = this.css
      const component = result.value
      if (result.error) {
        return this.renderError({
          type: 'js脚本错误',
          msg: result.error.toString(),
        })
      }

      // 如果需要注入一些变量，则对被注入的字段进行检测
      // 防止用户代码中定义了此字段，导致冲突
      const error = this.checkVariableField(component)
      if (error) {
        return this.renderError(error)
      }

      const template = (this.template || '')
        .replace(/^ *< *template *>|<\/ *template *> *$/g, '')
        .trim()

      // 注入template或render，设定template优先级高于render
      if (template) {
        component.template = template
        component.render = undefined
      } else if (!component.render) {
        component.template = '<span>未提供模板或render函数</span>'
      }

      // 注入errorCaptured, 用于错误自定义组件运行时捕获
      component.errorCaptured = (err, vm, info) => {
        this.subCompErr = {
          msg: err && err.toString && err.toString(),
          type: '自定义组件运行时错误：',
        }
        console.error('自定义组件运行时错误：', err, vm, info)
      }

      // 通过computed注入一些变量，比如store中的一些字段，
      // 当store中的变量发生变化时，也会引发组件重绘
      const computed = component.computed || {}
      const keys = Object.keys(this.$store.state.variable.map)
      computed.variable = () => {
        const map = {}
        forEach(keys, (key) => {
          map[key] = this.$store.state.variable.map[key]
        })
        return map
      }
      component.computed = computed

      return component
    },
  },
  watch: {
    js() {
      // 当代码变化时，清空error，重绘
      this.subCompErr = null
    },
    template() {
      // 当代码变化时，清空error，重绘
      this.subCompErr = null
    },
    css() {
      // 当代码变化时，清空error，重绘
      this.subCompErr = null
    },
    component() {
      if (this.hasInit) {
        this.mountCode()
      } else {
        this.mountResourceHandler.then(() => {
          this.hasInit = true
          this.mountCode()
        })
      }
    },
  },
  methods: {
    renderError({ type, msg }) {
      return {
        render() {
          return <div style='color: red'>
            <div>{type}</div>
            <div>{msg}</div>
          </div>
        },
      }
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
    mountResource() {
      appendLink('https://cdn.bootcdn.net/ajax/libs/ant-design-vue/1.7.2/antd.min.css', this.iframeDoc)
      this.mountResourceHandler = appendScriptLink([{
        src: 'https://cdn.bootcdn.net/ajax/libs/vue/2.6.12/vue.min.js',
        defer: true,
      }, {
        src: 'https://cdn.bootcdn.net/ajax/libs/ant-design-vue/1.7.2/antd.min.js',
        defer: true,
      }], this.iframeDoc)
    },
    mountCode() {
      removeElement(this.styleId, this.iframeDoc)
      this.styleId = appendStyle(this.css, this.iframeDoc)
      if (this.iframeDoc.body.firstElementChild) {
        this.iframeDoc.body.removeChild(this.iframeDoc.body.firstElementChild)
      }
      prependDom({ tag: 'div', id: 'app' }, this.iframeDoc)
      const Vue = this.iframeWin.Vue
      this.iframeWin.antd.install(Vue)
      new Vue(this.component).$mount('#app')
    },
  },
  mounted() {
    this.iframeWin = this.$refs.iframe.contentWindow
    this.iframeDoc = this.$refs.iframe.contentDocument
    this.mountResource()
    // 通过观察器观察iframe的body变化后修改iframe的高度，
    // 使用iframe会丢失margin叠加效果
    const observer = new MutationObserver(() => {
      const firstEle = this.iframeDoc.body.firstElementChild
      const rect = firstEle.getBoundingClientRect()
      const marginTop = parseFloat(window.getComputedStyle(firstEle).marginTop, 10)
      const marginBottom = parseFloat(window.getComputedStyle(firstEle).marginBottom, 10)
      this.$refs.iframe.height = `${rect.height + marginTop + marginBottom}px`
    })
    observer.observe(this.iframeDoc.body, { childList: true })
  },
}
</script>
<style lang='less' scoped>
</style>
