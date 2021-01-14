export const template = `<template>
  <div class='wrapper'>
    <a-button @click="onClick">
      点我
    </a-button>
  </div>
</template>`


export const js = `function generate() {
  return {
    name: 'customCode',
    methods: {
      onClick() {
        const cookie = window.parent.document.cookie
        this.$message.info(\`消息提示: cookie = \${cookie}\`)
      }
    },
  };
}`

export const css = `.wrapper {
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
}
`
