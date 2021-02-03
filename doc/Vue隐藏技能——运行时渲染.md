### 一语惊人

前段时间接了一个需求：能不能让用户自制组件，从而达到定制渲染某个区域的目的。说实话接到这个需求心中一惊，感叹这个想法真是大胆呀，但作为打工人，秉承着只要思想不滑坡，办法总比困难多的打工魂，即使是刀山也得上呀，历经几日的摸索调研，发现其实VUE一早就支持了这么做，只不过时过境迁，渐渐被遗忘了这个隐藏的技能。

大致说一下项目的背景：我们做了一个拖拽生成报表的系统，通过拖拽内置的组件供用户定制自己的报表形态，但毕竟内置的组件有限，可定制性不高，那么给用户开放一个code组件，让用户自己通过写`template` + `js` + `css`的方式自由定制岂不是妙哉。

### 重提渐进式

那么该怎么实现呢？我们先来看一vue官方的介绍

> [Vue (读音 /vjuː/，类似于 view) 是一套用于构建用户界面的`渐进式框架`。与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。](https://cn.vuejs.org/v2/guide/index.html#Vue-js-%E6%98%AF%E4%BB%80%E4%B9%88)

很多时候我们貌似已经忽略了`渐进式`这回事，现在基于VUE开发的项目大多都采用vue cli生成，以vue单文件的方式编码，webpack编译打包的形式发布。这与渐进式有什么关系呢，确实没有关系。

渐进式其实指的在一个已存在的但并未使用vue的项目上接入vue，使用vue，直到所有的HTML渐渐替换为通过vue渲染完成，渐进开发，渐进迁移，这种方式在vue刚出现那几年比较多，现在或许在一些古老的项目也会出现。

为什么要提`渐进式`呢？因为渐进式是不需要本地编译的，有没有get到点！对，就是`不需要本地编译，而是运行时编译`。

### 本地编译与运行时编译

用户想通过编写`template` + `js` + `css`的方式实现运行时渲染页面，那肯定是不能本地编译的（此处的编译指将vue文件编译为js资源文件），即不能把用户写的代码像编译源码一样打包成静态资源文件。

这些代码只能原样持久化到数据库，每次打开页面再恢复回来，实时编译。毕竟不是纯js文件，是不能直接运行的，它需要一个运行时环境，运行时编译，这个环境就是 [vue的运行时 + 编译器](https://cn.vuejs.org/v2/guide/installation.html#%E8%BF%90%E8%A1%8C%E6%97%B6-%E7%BC%96%E8%AF%91%E5%99%A8-vs-%E5%8F%AA%E5%8C%85%E5%90%AB%E8%BF%90%E8%A1%8C%E6%97%B6)。

有了思路也只是窥到了天机，神功练成还是要打磨细节。具体怎么做，容我一步步道来。

### 技术干货

#### 第一步：需要一个运行时编译环境

按[官方的介绍](https://learning.dcloud.io/#/?vid=2)，通过script标签引入vue就可以渐进式开发了，也就具备了运行时+编译器，如下
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Document</title>
  <script src="https://cdn.jsdelivr.net/npm/vue"></script>
</head>
<body>
  <div id="app">{{message}}</div>
  <script type="text/javascript">
    var app = new Vue({
      el: '#app',
      data: {
        message: 'Hello Vue!'
      }
    })
  </script>
</body>
</html>
```

但通过vue单文件+webpack编译的方式，再引入一个vue就多余了，通过CLI也是可以的，只需要在vue.config.js中打开runtimeCompiler开关就行了，[详细看文档](https://cli.vuejs.org/zh/config/#runtimecompiler)。

此时我们就有了一个运行时编译环境

#### 第二步：把用户的代码注册到系统中

把代码渲染出来有两个方案


1. 通过 [注册组件](https://cn.vuejs.org/v2/guide/components-registration.html) 的方式，把代码注册为vue实例的组件，注册组件又分 全局注册 和 局部注册 两种方式
2. 通过挂载点直接挂载vue实例， 即通过`new Vue({ el: '#id' })`的方式

##### 第一种方案：动态组件

对于这种方式，在官方文档中，组件注册章节，最后给出了一个注意点
> 记住全局注册的行为必须在根 Vue 实例 (通过 new Vue) `创建之前`发生。

因此，并不能通过调用`Vue.component('my-component-name', {/* */})`的方式将用户的代码注册到系统中，因为运行时Vue实例已经创建完，用户的代码是在实例完Vue后才进来的，那我们只能通过局部注册的方式了，类似这样
```jsx
var ComponentB = {
  components: {
    'component-a': {
      ...customJsLogic,
      name: 'custom-component',
      template: '<div>custom template</div>',
    }
  },
  // ...
}
```

但想一下，好像不太对，这还是在写源码，运行时定义了`ComponentB`组件怎么用呢，怎么把`ComponentB`在一个已经编译完页面上渲染出来呢？找不到入口点，把用户代码注入到`components`对象上也无法注册到系统中，无法渲染出来。

就止步于此了吗？该怎么办呢？

想一下为什么要在`components`中先注册(声明)下组件，然后才能使用？component本质上只不过是一个js object而已。其实主要是为了服务于template模板语法，当你在template中写了 `<compA propA='value'/>`，有了这个注册声明才能在编译时找到`compA`。如果不使用template，那么这个注册就可以省了。

不使用template怎么渲染呢，使用[render函数](https://cn.vuejs.org/v2/guide/render-function.html)呀！

在render函数中如果使用createElement就比较麻烦了，API很复杂，对于渲染一整段用户定义的template也略显吃力，使用jsx就方便多了，都1202年了，想必大家对jsx都应该有所了解。

回到项目上，需要使用用户代码的地方不止一处，都用render函数写一遍略显臃肿，那么做一个code的容器，容器负责渲染用户的代码，使用地方把容器挂上就行了。

+ 容器核心代码

```javascript
export default {
  name: 'customCode',
  props: {
    template: String,   // template模板
    js: String,         // js逻辑
    css: String,        // css样式
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
      // 把代码字符串转成js对象
      const component = safeStringToObject(this.js)

      // 去掉template的前后标签
      const template = (this.template || '')
        .replace(/^ *< *template *>|<\/ *template *> *$/g, '')
        .trim()

      // 注入template或render，设定template优先级高于render
      if (this.template) {
        component.template = this.template
        component.render = undefined
      } else if (!component.render) {
        component.render = '<div>未提供模板或render函数</div>'
      }

      return component
    },
  },
  render() {
    const { component } = this
    return <div class={this.className}>
      <style>{this.scopedStyle}</style>
      <component />
    </div>
  },
}
```

+ 容器使用

```html
<template>
  <custom-code :js="js" :template="template" :css="css" />
</template>
```
以上只是核心的逻辑部分，除了这些，在项目实战中还应考虑容错处理，错误大致可以分两种

1. 用户代码语法错误

    主要是js部分，对于css和template的错误，浏览器有一定的纠错的机制，不至于崩了。

    这部分的处理主要借助于`safeStringToObject`这个函数，如果有语法错误，则返回Error，处理一下回显给用户，代码大致如下

    ```javascript
    // component对象在result.value上取，如果result.error有值，则代表出现了错误
    component() {
      // 把代码字符串转成js对象
      const result = safeStringToObject(this.js)

      const component = result.value
      if (result.error) {
        console.error('js 脚本错误', result.error)
        result.error = {
          msg: result.error.toString(),
          type: 'js脚本错误',
        }
        result.value = { hasError: true }
        return result
      }

      // ...

      retrun result
    }
    ```

2. 组件运行时错误

    既然把js逻辑交给了用户控制，那么像类型错误，从undefined中读值，把非函数变量当函数运行，甚至拼写错误等这些运行时错误就很有可能发生。

    这部分的处理需要通过在容器组件上添加 [`errorCaptured`这个官方钩子](https://cn.vuejs.org/v2/api/index.html#errorCaptured)，来捕获子组件的错误，因为并没有一个途径可以获取组件自身运行时错误的钩子。代码大致如下

    ```javascript
    errorCaptured(err, vm, info) {
      this.subCompErr = {
        msg: err && err.toString && err.toString() || err,
        type: '自定义组件运行时错误：',
      }
      console.error('自定义组件运行时错误：', err, vm, info)
    },
    ```

结合错误处理，如果希望用户能看到错误信息，则render函数需要把错误展示出来，代码大致如下

```Jsx
render() {
  const { error: compileErr, value: component } = this.component
  const error = compileErr || this.subCompErr
  let errorDom
  if (error) {
    errorDom = <div class='error-msg-wrapper'>
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
```

这里还有一个点，用户发现组件发生了错误后会修改代码，使其再次渲染，错误的回显需要特别处理下。

对于js脚本错误，因component是计算属性，随着computed计算属性再次计算，如果js脚本没有错误，导出的component可重绘出来，

但对于运行时错误，使用`this.subCompErr`内部变量保存，props修改了，这个值却不会被修改，因此需要打通props关联，通过添加watch的方式解决，这里为什么没有放在component的计算属性中做，一是违背计算属性设计原则，二是component可能并不仅仅依赖js,css,template这个props的变化，而`this.subCompErr`只需要和这个三个props关联，这么做会有多余的重置逻辑。

还有一种场景就是子组件自身可能有定时刷新逻辑，定期或不定期的重绘，一旦发生了错误，也会导致一直显示错误信息，因为用户的代码拿不到`this.subCompErr`的值，因此也无法重置此值，这种情况，可通过注入`beforeUpdate`钩子解决，代码大致如下

```javascript
computed: {
    component() {
      // 把代码字符串转成js对象
      const result = safeStringToObject(this.js)
      const component = result.value
      // ...
      // 注入mixins
      component.mixins = [{
        // 注入 beforeUpdate 钩子，用于子组件重绘时，清理父组件捕获的异常
        beforeUpdate: () => {
          this.subCompErr = null
        },
      }]
      // ...
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
```
**`完整的代码见`：[https://github.com/merfais/vue-demo/blob/main/src/views/customCode/withComponent.vue](https://github.com/merfais/vue-demo/blob/main/src/views/customCode/withComponent.vue)**

**`完整的demo见`：[https://merfais.github.io/vue-demo/#/custom-code](https://merfais.github.io/vue-demo/#/custom-code)**

##### 第二种方案：动态实例

我们知道在利用vue构建的系统中，页面由组件构成，页面本身其实也是组件，只是在部分参数和挂载方式上有些区别而已。这第二种方式就是将用户的代码视为一个page，通过new一个vm实例，再在DOM挂载点挂载vm(`new Vue(component).$mount('#id')`)的方式渲染。

动态实例方案与动态组件方案大致相同，都要通过computed属性，生成`component`对象和`scopedStyle`对象进行渲染，但也有些许的区别，动态实例比动态组件需要多考虑以下几点：

1. 需要一个稳定的挂载点

	从vue2.0开始，vue实例的挂载策略变更为，[所有的挂载元素会被 Vue 生成的 DOM 替换](https://cn.vuejs.org/v2/api/#el)，在此策略下，一旦执行挂载，原来的DOM就会消失，不能再次挂载。但我们需要实现代码变更后能够重新渲染，这就要求挂载点要稳定存在，解决方案是对用户的template进行注入，每次渲染前，在template外层包一层带固定id的DOM

2. 运行时错误捕获`errorCaptured`需要注入到`component`对象上，不再需要注入`beforeUpdate`钩子

	因为通过`new Vue()`的方式创建了一个新的vm实例，不再是容器组件的子组件，所以容器组件上的`errorCaptured`无法捕获新vm的运行时错误，`new Vue(component)`中参数component是顶层组件，根据 [Vue错误传播规则](https://cn.vuejs.org/v2/api/#errorCaptured) 可知，在非特殊控制的情况下，顶层的 `errorCaptured` 会捕获到错误

3. 首次挂载需要制造一定的延迟才能渲染

	由于挂载点含在DOM在容器内，与计算属性导出的`component`对象在首次挂载时时序基本是一致的，导致挂载vm(`$mount('#id')`)时，DOM可能还没有渲染到文档流上，因此在首次渲染时需要一定的延迟后再挂载vm。

以上的不同点，并未给渲染用户自定义代码带来任何优势，反而增加了限制，尤其 **需要稳定挂载点** 这一条，需要对用户提供的template做二次注入，包裹挂载点，才能实现用户修改组件后的实时渲染更新，因此，也不能支持用户定义render函数，因为无法获取未经运行的render函数的返回值，也就无法注入外层的挂载点。

另外一点也需要注意，这种方式也是无法在容器组件中使用template定义渲染模板的，因为如果在template中写style标签会出现以下编译错误，但style标签是必须的，需要为自定义组件提供scoped的样式。（当然，也可以通过提供appendStyle函数实现动态添加style标签，但这样并没有更方便，因此没有必要）

```shell
  Errors compiling template:

  Templates should only be responsible for mapping the state to the UI. Avoid placing tags with side-effects in your templates, such as <style>, as they will not be parsed.

  2  |  <span :class="className">
  3  |    <span id="uid" />
  4  |    <style>{this.scopedStyle}</style>
     |    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  5  |  </span>
     |  ^^^^^^^
```

鉴于以上缺点，就不提供核心代码示范了，直接给源码和demo

**`完整的代码见`：[https://github.com/merfais/vue-demo/blob/main/src/views/customCode/withMount.vue](https://github.com/merfais/vue-demo/blob/main/src/views/customCode/withMount.vue)**

**`完整的demo见`：[https://merfais.github.io/vue-demo/#/custom-code](https://merfais.github.io/vue-demo/#/custom-code)**

想一下，如果动态实例方案仅仅有以上缺点，那考虑这种方案有什么意义呢？其实，它的意义在于，动态实例方案主要应用于iframe渲染，而使用iframe渲染的目的则是为了隔离。

iframe会创建独立于主站的一个域，这种隔离可以很好地防止js污染和css污染，隔离方式又分为跨域隔离和非跨域隔离两种，跨域则意味着完全隔离，非跨域则是半隔离，其主要区别在于安全策略的限制，这个我们最后再说。

iframe是否跨域由iframe的src的值决定，设置同域的src或不设置src均符合同域策略，否则是跨域。对于没有设置src的iframe，页面只能加载一个空的iframe，因此还需要在iframe加载完后再动态加载依赖的资源，如：vuejs，其他运行时的依赖库（示例demo加载了ant-design-vue）等。如果设置了src，则可以将依赖通过script标签和link标签提前写到静态页面文件中，使依赖资源在加载iframe时自动完成加载。

先介绍半隔离方式，即通过非跨域iframe渲染，首先需要渲染一个iframe，我们使用不设置src的方式，这样更具备通用性，可以用于任意的站点。核心代码如下

```html
<template>
  <iframe ref='iframe' frameborder="0" scrolling="no" width="100%" />
</template>
```

由于是位于同域，主站与iframe可以互相读取window和document引用，因为，可以动态加载资源，核心代码如下

```javascript
methods: {
  mountResource() {
    // 添加依赖的css
    appendLink('https://cdn.bootcdn.net/ajax/libs/ant-design-vue/1.7.2/antd.min.css', this.iframeDoc)
    // 添加依赖的js，保留handler用于首次渲染的异步控制
    this.mountResourceHandler = appendScriptLink([{
      src: 'https://cdn.bootcdn.net/ajax/libs/vue/2.6.12/vue.min.js',
      defer: true,
    }, {
      src: 'https://cdn.bootcdn.net/ajax/libs/ant-design-vue/1.7.2/antd.min.js',
      defer: true,
    }], this.iframeDoc)
  },
},
mounted() {
  this.iframeDoc = this.$refs.iframe.contentDocument
  this.mountResource()
},
```

接下来是组件对象组装和挂载，基本上和动态组件的大同小异，只是挂载不再通过render函数。先上核心代码，再说注意点。

```javascript
  computed: {
    component() {
      // 把代码字符串转成js对象
      const component = safeStringToObject(this.js)

      // 关联css，为的是修改css后可自动重绘
      component.css = this.css

      // 去掉template的前后标签
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

      return component
    },
  },
  watch: {
    component() {
      if (this.hasInit) {
        this.mountCode()
      } else if (this.mountResourceHandler) {
        this.mountResourceHandler.then(() => {
          this.hasInit = true
          this.mountCode()
        })
      }
    },
  },
  methods: {
    mountCode() {
      // 添加css
      const css = this.component.css
      delete this.component.css
      removeElement(this.styleId, this.iframeDoc)
      this.styleId = appendStyle(css, this.iframeDoc)

      // 重建挂载点
      if (this.iframeDoc.body.firstElementChild) {
        this.iframeDoc.body.removeChild(this.iframeDoc.body.firstElementChild)
      }
      prependDom({ tag: 'div', id: 'app' }, this.iframeDoc)

      // 挂载实例
      const Vue = this.iframeWin.Vue
      new Vue(this.component).$mount('#app')
    },
  },
```

注意点：
1. iframe的渲染到文档流后才能添加依赖资源，依赖资源加载完才能执行vm的挂载，首次加载时需要控制时序
2. vm挂载点的重建采用了永远添加在body的第一个子元素的方式，这么做的原因是一些第三方的库（如ant-design-vue）也会向body中动态添加element，虽然采用`docment.body.innerHTML=''`的方式可以快速且干净的清空body内容，但也会将第三方库添加的内容给干掉，导致第三方库全部或部分不可用。
3. 为了使css变化后也引发重绘，在计算属性`component`中也绑定了css的值，但这对于新建vm实例这个字段是无用的，也可以通过watch css的方式实现

接下来考虑错误处理，对于iframe挂载的错误处理稍有不同，为了尽量不干预用户的代码，此模式下的错误渲染采用重建DOM，重新渲染vm的策略，即发生错误后，无论是静态的语法错误还是运行时错误，都重绘。当然这种做法也就丢失了组件自刷新的功能，因为一旦发生错误，原来的组件会被卸载，渲染为错误信息。核心代码如下

```Jsx
 computed: {
    component() {
      if (this.subCompErr) {
        return this.renderError(this.subCompErr)
      }

      // 把代码字符串转成js对象
      const result = safeStringToObject(this.js)
      if (result.error) {
        return this.renderError({
          type: 'js脚本错误',
          msg: result.error.toString(),
        })
      }

      const component = result.value

      // 注入errorCaptured, 用于错误自定义组件运行时捕获
      component.errorCaptured = (err, vm, info) => {
        this.subCompErr = {
          msg: err && err.toString && err.toString(),
          type: '自定义组件运行时错误：',
        }
        console.error('自定义组件运行时错误：', err, vm, info)
      }

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
  },
```

除了错误处理，还需解决一下iframe的一些特性，比如边框，滚动条，默认宽高，其中比较棘手是iframe高度有默认值，并不会随着iframe的内容自适应高度，但对于自定义组件的渲染，需要动态计算高度，固定高度是不行的。

边框，滚动条，宽度可通过修改iframe的属性解决，见上面的template代码。

高度自适应的解决方案是通过`MutationObserver`观测iframe的body变化，在回调中计算挂载点（第一个子元素）的高度，然后再修改iframe本身的高度。之所以没有直接使用body的高度，是因为body有默认的高度，当被渲染的组件高度小于body高度时，直接使用body的高度是错的。 核心代码如下

```javascript
mounted() {
  // 通过观察器观察iframe的body变化后修改iframe的高度，
  // 使用iframe后垂直的margin重合效果会丢失
  const observer = new MutationObserver(() => {
    const firstEle = this.iframeDoc.body.firstElementChild
    const rect = firstEle.getBoundingClientRect()
    const marginTop = parseFloat(window.getComputedStyle(firstEle).marginTop, 10)
    const marginBottom = parseFloat(window.getComputedStyle(firstEle).marginBottom, 10)
    this.$refs.iframe.height = `${rect.height + marginTop + marginBottom}px`
  })
  observer.observe(this.iframeDoc.body, { childList: true })
},
```

使用iframe还存在一些局限性，最需要注意的一点就是由于iframe是独立的窗体，那么渲染出来的组件只能封在这个窗体内，因此，像一些本应该是全局的toast, modal, drawer都会被局限在iframe内，无法覆盖到全局上。

**`完整的代码见`：[https://github.com/merfais/vue-demo/blob/main/src/views/customCode/mountSameIframe.vue](https://github.com/merfais/vue-demo/blob/main/src/views/customCode/mountSameIframe.vue)**

**`完整的demo见`：[https://merfais.github.io/vue-demo/#/custom-code](https://merfais.github.io/vue-demo/#/custom-code)**

至此非跨域iframe渲染全部逻辑介绍完毕，接下来看一下跨域iframe的渲染。跨域iframe与非跨域iframe的渲染过程基本是一致的，只是有由于跨域，隔离的更彻底。其主要体现在主域与iframe域不能互相读写对方的文档流document。

此限制带来的变化有以下几点

1. 依赖的资源需要提前内置在iframe内。

	内置指的是将依赖的资源通过script，link标签添加到html文件中，随html一并加载。有一点还需要注意，如果挂载vm时需要依赖某些资源，需要添加资源加载的回调，加载成功后再通知主域挂载。

2. iframe重新绘制需要各种元素操作只能由iframe自己完成

	在非跨域iframe模式下所有的元素操作都在主域中完成，在跨域模式下这些操作和流程控制都需要以script编码的方式内置在html内，在接到主域的挂载消息后，完整挂载过程。

3. 主域与iframe的通信需要通过`postMessage`。

 	为了通用性，调用`postMessage`时可以设置`origin = *`，但由于接收postMessage消息通过 `window.addEventListener("message", callback)`这种通用的方式，可能会接受来自多个域的非期待的消息，因此，需要对通信消息定制特殊协议格式，防止出现处理了未知消息而发生异常。

	两者间通信是双向的，主站向iframe只需传递一种消息，即含组件完整内容的挂载消息，iframe接到消息后执行重绘渲染逻辑；iframe向主站传递两种消息，一是可以挂载的状态消息，主站接到消息后执行首次渲染逻辑，即发送首次挂载消息，二是body size变化的消息，主站接到消息后修改iframe的尺寸。

在处理主域将组件内容通过`postMessage`传给iframe时，碰到了一个棘手的问题，postMessage对可传递的数据有限制，具体的限制可查看 [The structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)，这个限制导致`Function`类型的数据无法传过去，但组件很多功能需要使用函数才能实现，无法跨越这个限制，组件能力将损失过半或更甚。

对于这个限制的解决方案是：对不支持的数据类型进行序列化，转成支持的类型，如string，渲染时再反序列化回来。核心代码如下

```javascript
// 序列化
function serialize(data) {
  // 对象深度递归
  if (Object.prototype.toString.call(data) === '[object Object]') {
    const result = {}
    forEach(data, (item, key) => {
      result[key] = this.serialize(item)
    })
    return result
  }
  if (Array.isArray(data)) {
    return data.map(item => this.serialize(item))
  }
  // 函数前后打上特殊标记后转成string
  if (typeof data === 'function') {
    return encodeURI(`##${data.toString()}##`)
  }
  // 其他类型直接返回
  return data
}
// 反序列化
function deserialize(data) {
  // 对象深度递归
  if (Object.prototype.toString.call(data) === '[object Object]') {
    const result = {}
    Object.keys(data).forEach((key) => {
      result[key] = this.deserialize(data[key])
    })
    return result
  }
  if (Array.isArray(data)) {
    return data.map(item => this.deserialize(item))
  }
  // string类型尝试解析
  if (typeof data === 'string') {
    const str = decodeURI(data)
    // 匹配特殊标记，匹配成功，反转为function
    const matched = str.match(/^##([^#]*)##$/)
    if (matched) {
      // string转成function可以用eval也可用new Function
      return newFn(matched[1])
    }
    return data
  }
  // 其他类型直接返回
  return data
}
```

序列化方案看似完美，其实也有诸多的不便，毕竟是一种降级，需要特别注意的一点是，**闭包被破坏**，或者说是不支持闭包函数，举个例子:

```jsx
computed: {
  component() {
    // 把代码字符串转成js对象
    const result = safeStringToObject(this.js)
    if (result.error) {
      return this.renderError({
        type: 'js脚本错误',
        msg: result.error.toString(),
      })
    }
    // ...
    return component
  },
},
methods: {
  renderError({ type, msg }) {
    return {
       // 这里用到了闭包，render函数使用了外层变量type和msg，
       // renderError函数执行结束后这两个变量并不会释放，需等render函数执行后才会释放
       render() {
         return <div style='color: red'>
           <div>{type}</div>
           <div>{msg}</div>
         </div>
       }
    }
  },
},
```
上面在生成 component 对象时调用了函数`renderError`，此函数返回了一个函数`render`，且使用了外层函数`renderError`的两个参数，正常情况下运行是没有问题的，`type`和`msg`的引用(引用计数)会等到`render`函数执行后才会释放(引用计数清零)。

但 component 对象经过序列化后，其内部的函数被转成了字符串，因而丢失了函数的所有特性，闭包也因此丢失，经反序列化回来后，虽然还原了函数，但闭包关系无法恢复，因此，这种写法，在执行render时，`type`和`msg`两个参数会变为`undefined`。

为了规避这种限制，应在导出 component 对象时避免使用含闭包的函数， 上例中的错误处理可通过以下方式解决

```jsx
computed: {
  component() {
    // 把代码字符串转成js对象
    const result = safeStringToObject(this.js)
    if (result.error) {
      const template = this.genErrorTpl({
        type: 'js脚本错误',
        msg: result.error.toString(),
      })
      return { template }
    }
    // ...
    return component
  },
},
methods: {
  genErrorTpl({ type, msg }) {
    return `<div style='color: red'><div>${type}</div><div>${msg}</div></div>`
  },
}
```


**`完整的代码见`：**

  + **`组件`：[https://github.com/merfais/vue-demo/blob/main/src/views/customCode/mountCrossIframe.vue](https://github.com/merfais/vue-demo/blob/main/src/views/customCode/mountCrossIframe.vue)**
  + **`iframe`: [https://gitlab.com/merfais/static-page/-/blob/master/public/iframe.html](https://gitlab.com/merfais/static-page/-/blob/master/public/iframe.html)**

**`完整的demo见`：[https://merfais.github.io/vue-demo/#/custom-code](https://merfais.github.io/vue-demo/#/custom-code)**

### XSS注入与安全

通常情况下，在需要将用户输入持久化的系统中，都要考虑XSS的注入攻击，而防止注入的主要表现则是使用户输入的数据不被执行，或不能被执行。

而前文介绍的要支持用户自定义组件的渲染，恰好就是要执行用户代码，可见，此功能势必会带来XSS注入风险。

因此，在使用此功能时要慎重，在不同的应用场景中，要根据系统的安全级别，选取相应的方案。对比以上四种方案（1种动态组件，3种动态挂载）可做以下选择

在一些相对安全（允许xss注入，注入后没有安全问题）的系统中，可以使用前三种方案中的任意一种，这三种都是可以通过注入获取用户cookie的。个人推荐使用第一种动态渲染方案，因为此方案灵活性和渲染完整度都是最高的。

在一些不太安全（xss注入可能会泄露cookie中的身份信息）的系统中，推荐使用最后一种跨域组件挂载方案，通过完全隔离策略可以最大程度的降低风险，当然此方案也有很多的局限性。

