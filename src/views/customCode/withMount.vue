<script>
import Vue from 'vue'
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
      uid: '', // Math.random().toString(36).slice(2),
      subCompErr: null,
    }
  },
  computed: {
    className() {
      return `custom-code-${this.uid}`
    },
    scopedStyle() {
      if (this.css) {
        const scope = `.${this.className}`
        const regex = /(^|\})\s*([^{]+)/g
        // 为class加前缀，做类似scope的效果
        return this.css.trim().replace(regex, (m, g1, g2) => {
          return g1 ? `${g1} ${scope} ${g2}` : `${scope} ${g2}`
        })
      }
      return ''
    },
    component() {
      const js = (this.js || '').trim()
      const result = runFnInVm(js, {})
      const component = result.value
      if (result.error) {
        result.error = {
          msg: result.error.toString(),
          type: 'js脚本错误',
        }
        result.value = { template: `<span id=${this.uid} />` }
        return result
      }

      // 如果需要注入一些变量，则对被注入的字段进行检测
      // 防止用户代码中定义了此字段，导致冲突
      // const resultTmp = this.checkVariableField(component)
      // if (resultTmp) {
      //   return resultTmp
      // }

      const template = (this.template || '')
        .replace(/^ *< *template *>|<\/ *template *> *$/g, '')
        .trim()

      // 需要对template注入含挂载id的外层dom，否则因丢失挂载id，无法刷新
      if (template) {
        component.template = `<span id=${this.uid}>${template}</span>`
      } else {
        component.template = `<span id=${this.uid}>未提供模板</span>`
      }

      // 因无法对render函数返回的dom注入含挂载id的外层dom，
      // 因此不支持此接口
      if (component.render) {
        return {
          error: {
            type: '功能限制',
            msg: '不支持render函数',
          },
          value: { template: `<span id=${this.uid} />` },
        }
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
      computed.variable = () => {
        const map = {}
        forEach(this.$store.state.variable.map, (value, key) => {
          map[key] = value
        })
        return map
      }
      component.computed = computed

      return result
    },
  },
  watch: {
    component() {
      this.mounteCode()
    },
    css() {
      // 当代码变化时，清空error，重绘
      this.subCompErr = null
    },
  },
  methods: {
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
          error: {
            type: '功能限制',
            msg: '禁止自定义名称是variable的computed或data，会影响系统变量的使用',
          },
          value: { template: `<span id=${this.uid} />` },
        }
      }
    },
    mounteCode() {
      this.subCompErr = null
      const { value: component } = this.component
      if (this.firstMounted) {
        // 首次挂载组件时, 挂载点的dom有一定的延迟，延迟时间未知
        // 需要一个相对长一点的异步
        this.firstMounted = false
        setTimeout(() => {
          new Vue(component).$mount(`#${this.uid}`)
        }, 50)
      } else {
        new Vue(component).$mount(`#${this.uid}`)
      }
    },
  },
  render() {
    const error = this.component.error || this.subCompErr
    let errorDom
    if (error) {
      errorDom = <div class='error-msg-wrapper'
        style={{ position: !this.component.error ? 'absolute' : '' }}
      >
        <div>{error.type}</div>
        <div>{error.msg}</div>
      </div>
    }
    return <div class={['code-preview-wrapper', this.className]}>
      <style>{this.scopedStyle}</style>
      <span id={this.uid} />
      {errorDom}
    </div>
  },
  mounted() {
    this.firstMounted = true
    this.uid = `id_${Math.random().toString(36).slice(2)}`
  },
}
</script>
<style lang='less' scoped>
.code-preview-wrapper {
  position: relative;

  .error-msg-wrapper {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background: #fff;
    color: red;
  }
}
</style>
