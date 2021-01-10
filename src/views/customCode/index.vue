<template>
<div class='wrapper'>
  <div class='panel code-panel'>
    <a-tabs
      class='tabs-wrapper'
      >
      <a-tab-pane
        v-for="item in tabs"
        :key="item.key"
        :tab="item.tab"
        >
        <code-editor
          class='code-wrapper'
          v-model="item.value"
          :mode="item.mode"
          />
      </a-tab-pane>
    </a-tabs>
  </div>
  <div class="preview-btn-wrapper">
    <a-button
      @click="onClickPreview"
      >
      预览 >>
    </a-button>
  </div>
  <div class='panel preview-panel'>
    <a-alert message="通过动态子组件的方式渲染" type="info" show-icon />
    <code-preview v-bind="previewData"/>
    <a-divider style="margin: 24px 0 0 0"/>
    <a-alert message="通过实例化Vue挂载DOM的方式渲染" type="info" show-icon />
    <code-mount v-bind="previewData"/>
  </div>
</div>
</template>

<script>
import CodeEditor from '@/components/codeEditor';
import CodePreview from '@/components/codePreview';
import CodeMount from '@/components/codeMount';
import {
  template,
  js,
  css,
} from './service';

export default {
  name: '',
  components: {
    CodeEditor,
    CodePreview,
    CodeMount,
  },
  data() {
    return {
      previewData: {
        js: '',
        template: '',
        css: '',
      },
      tabs: {
        template: {
          key: 'template',
          tab: '模板',
          value: template,
          mode: 'text/x-vue',
        },
        js: {
          key: 'js',
          tab: '代码',
          value: js,
          mode: 'text/javascript',
        },
        css: {
          key: 'css',
          tab: '样式',
          value: css,
          mode: 'text/css',
        },
      },
    }
  },
  methods: {
    onClickPreview() {
      this.previewData = {
        template: this.tabs.template.value,
        js: this.tabs.js.value,
        css: this.tabs.css.value,
        sed: Math.random(),
      }
    },
  },
  mounted() {
    this.previewData = {
      template: this.tabs.template.value,
      js: this.tabs.js.value,
      css: this.tabs.css.value,
    }
  },
}
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 0 auto;
  height: 100%;

  .panel {
    border: 1px solid #ccc;
    height: 100%;
    width: 700px;
    text-align: left;
  }

  .preview-btn-wrapper {
    flex-grow: 1;
  }

  .tabs-wrapper {
    height: 100%;

    .code-wrapper {
      height: 100%;
    }
  }
}

/deep/ .ant-tabs-bar {
  margin: 0;
}

/deep/ .ant-tabs-content {
  height: calc(100% - 45px);
}
/deep/ .ant-tabs-tabpane {
  overflow: auto;
}
</style>
