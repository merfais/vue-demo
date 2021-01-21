<script>
import forEach from 'lodash/forEach'
import has from 'lodash/has'
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
      subCompErr: null,
    }
  },
  computed: {
    className() {
      // 生成唯一class，主要用于做scoped的样式
      const uid = Math.random().toString(36).slice(2)
      return `custom-code-${uid}`
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
        result.value = { hasError: true }
        return result
      }

      // 如果需要注入一些变量，则对被注入的字段进行检测
      // 防止用户代码中定义了此字段，导致冲突
      const resultTmp = this.checkVariableField(component)
      if (resultTmp) {
        return resultTmp
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

      // 注入mixins
      component.mixins = [{
        // 注入 beforeUpdate 钩子，用于子组件重绘时，清理父组件捕获的异常
        beforeUpdate: () => {
          this.subCompErr = null
        },
      }]

      // 通过computed注入一些变量，比如store中的一些字段，
      // 当store中的变量发生变化时，也会引发组件重绘
      const computed = component.computed || {}
      computed.variable = function variable() {
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
          value: { hasError: true },
        }
      }
    },
  },
  render() {
    const { error: compileErr, value: component } = this.component
    const error = compileErr || this.subCompErr
    let errorDom
    if (error) {
      errorDom = <div class='error-msg-wrapper'
        style={{ position: !component.hasError ? 'absolute' : '' }}
      >
        <div>{error.type}</div>
        <div>{error.msg}</div>
      </div>
    }
    return <div class='code-preview-wrapper'>
      <div class={this.className}>
        <style>{this.scopedStyle}</style>
        <component />
      </div>
      {errorDom}
    </div>
  },
  mounted() {
  },
  errorCaptured(err, vm, info) {
    this.subCompErr = {
      msg: err && err.toString && err.toString(),
      type: '自定义组件运行时错误：',
    }
    console.error('自定义组件运行时错误：', err, vm, info)
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
