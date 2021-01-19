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
    <with-component v-bind="previewData"/>
    <a-divider/>
    <a-alert message="通过实例化Vue挂载DOM的方式渲染" type="info" show-icon />
    <with-mount v-bind="previewData"/>
    <a-divider/>
    <a-alert message="通过实例化Vue挂载到iframe的方式渲染" type="info" show-icon />
    <mount-same-iframe v-bind="previewData"/>
    <a-divider/>
    <a-alert message="通过实例化Vue挂载到iframe的方式渲染" type="info" show-icon />
    <mount-cross-iframe v-bind="previewData"/>
    <a-divider/>
  </div>
</div>
</template>

<script>
import CodeEditor from './codeEditor';
import WithComponent from './withComponent';
import WithMount from './withMount';
import MountSameIframe from './mountSameIframe'
import MountCrossIframe from './mountCrossIframe'
import {
  template,
  js,
  css,
} from './service';

export default {
  name: '',
  components: {
    CodeEditor,
    WithComponent,
    WithMount,
    MountSameIframe,
    MountCrossIframe,
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
  created() {
    this.$store.commit('setState', {
      filePath: 'views/customCode/index.vue',
      pageName: '',
    });
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
  flex-grow: 1;

  .panel {
    border: 1px solid #ccc;
    height: 100%;
    text-align: left;
    overflow: auto;
    flex-grow: 1;
  }

  .preview-btn-wrapper {
    margin: 10px;
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
