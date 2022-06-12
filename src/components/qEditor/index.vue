<template>
<div
  class="editor-wrapper"
  :style="style"
  >
  <toolbar
    v-if='!readonly'
    class='toolbar'
    ref='toolbar'
    :quill='quill'
    :content-value='value'
    :config='toolbar'
    @addLink='onAddLink'
    />
  <div class='scroll-wrapper' ref='container'>
    <div class='content-wrapper'>
      <div ref="editor"></div>
      <link-popup
        v-if='!readonly'
        :visible.sync='linkPopup.visible'
        :preview.sync='linkPopup.preview'
        :quill='quill'
        :content-value='value'
        />
    </div>
  </div>
</div>
</template>
<script>
import get from 'lodash/get';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Toolbar from './toolbar';
import LinkPopup from './linkPopup';

export default {
  name: 'richEditor',
  components: {
    Toolbar,
    LinkPopup,
  },
  props: {
    value: String,
    readonly: Boolean,
    height: {
      type: String,
      default: '100%',
    },
    width: {
      type: String,
      default: '100%',
    },
    toolbar: [Object, Array],

    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    borderColor: {
      type: String,
      default: '#E1E4EA',
    },
    fontSize: {
      type: String,
      default: '14px',
    },
    placeholder: String,
    visible: Boolean,
  },
  data() {
    return {
      quill: null,
      linkPopup: {
        visible: false,
        preview: true,
        value: '',
      },
    };
  },
  computed: {
    style() {
      return {
        width: this.width,
        height: this.height,
        backgroundColor: this.backgroundColor,
        border: `1px solid ${this.borderColor}`,
      };
    },
  },
  watch: {
    readonly() {
      if (this.quill) {
        this.quill.enable(!this.readonly);
      }
    },
    value() {
      this.setContent(this.value);
    },
    visible() {
      // 控制编辑器自动获取焦点
      if (this.visible) {
        this.quill.focus();
      } else {
        this.quill.blur();
      }
    },
  },
  methods: {
    /**
       * 初始化编辑器
       */
    initialize() {
      if (!this.$el) {
        return;
      }
      const options = {
        readOnly: this.readonly,
        modules: {
          toolbar: this.readonly ? null : this.$refs.toolbar.$el,
        },
        placeholder: this.placeholder,
        theme: 'snow',
      };
      this.quill = new Quill(this.$refs.editor, options);
      if (this.readonly) {
        this.quill.enable(false);
      } else {
        // 将vue的实例绑定到quill实例上，方便tooltip计算位置
        this.quill.$refs = {
          container: this.$refs.container,
        };
      }
      // 设置默认字号
      this.quill.format('size', '14px');
      // 绑定必要事件
      this.quill.on(Quill.events.SELECTION_CHANGE, this.onSelectionChange);
      this.quill.on(Quill.events.TEXT_CHANGE, this.onTextChange);
      this.$emit('ready', this.quill);
      // 初始化内容
      this.setContent(this.value);
    },
    /**
       * 向编辑器写入内容
       */
    setContent(html) {
      if (!this.quill) {
        return;
      }
      if (html) {
        if (html === this.latestHtml) {
          return;
        }
        this.latestHtml = html;
        if (this.readonly) {
          const delta = this.quill.clipboard.convert(html);
          this.quill.setContents(delta);
        } else {
          // dangerouslyPasteHTML内部会调用document.getSelection方法，
          // 再调用selection.removeAllRanges方法，
          // 此方法会使其他组件（如input）丢失焦点，造成无法连续输入
          this.quill.clipboard.dangerouslyPasteHTML(html);
        }
      } else {
        this.quill.setText('');
      }
    },
    /**
       * 选择区域改变回调，用于模拟focus， blur事件
       */
    onSelectionChange(range) {
      if (!range) {
        this.$emit('blur');
        return;
      }
      this.$emit('focus');
    },
    /**
       * 内容变化回调
       */
    onTextChange() {
      let html = this.$refs.editor.children[0].innerHTML;
      const text = this.quill.getText();
      if (html === '<p><br></p>') {
        html = '';
      }
      this.latestHtml = html;
      this.$emit('input', html);
      this.$emit('textChange', text);
    },
    /**
       * 点击添加链接按钮
       */
    onAddLink() {
      this.linkPopup.visible = true;
      this.linkPopup.preview = false;
    },
  },
  mounted() {
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.initialize();
  },
  beforeDestroy() {
    this.quill.off(Quill.events.Text_CHANGE, this.onTextChange);
    this.quill.off(Quill.events.SELECTION_CHANGE, this.onSelectionChange);
  },
};
</script>
<style lang='less' scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  border: 1px solid;
  border-radius: 3px;

  .toolbar {
    flex: 0;
  }

  .scroll-wrapper {
    flex: 1;
    overflow: auto;

    .content-wrapper {
      position: relative;
      height: 100%;
    }
  }

  /deep/ .ql-container {
    font-size: 14px;
    border: 0;

    .ql-editor {
      padding: 0;
      overflow: unset;
      overflow-y: unset;
    }

    .ql-tooltip {
      display: none;
    }
  }
}
</style>
