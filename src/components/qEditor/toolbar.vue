<script>
/**
   * @Description: quill editor的工具栏
   */
import map from 'lodash/map';
import get from 'lodash/get';
import quill from 'quill';
import { getToolbar, getToolbarMap } from './service';
import ButtonTool from './buttonTool';
import SelectTool from './selectTool';
import ColorTool from './colorTool';

export default {
  name: 'quillToolbar',
  components: {
    ButtonTool,
    SelectTool,
    ColorTool,
  },
  props: {
    quill: Object,
    contentValue: String,
    config: [Array, Object],
  },
  data() {
    return {
      formats: {},
    };
  },
  computed: {
    toolbarList() {
      const toolbarMap = getToolbarMap()
      if (Array.isArray(this.config)) {
        return this.config.map(item => {
          if (typeof item === 'string') {
            return toolbarMap[item]
          }
          const { name } = item
          return {
            ...toolbarMap[name],
            ...item,
          }
        })
      }
      return getToolbar()
    }
  },
  watch: {
    contentValue(newVal, oldVal) {
      // 编辑器内容发生变化，根据当前选中的区域更新toolbar按钮的状态
      if (newVal !== oldVal) {
        this.update(this.quill.getSelection());
      }
    },
  },
  methods: {
    /**
       * 更新toolbar中各个按钮激活状态
       */
    update(range) {
      if (!range) {
        return;
      }
      this.formats = this.quill.getFormat(range);
    },
    /**
       * 点击toolbar中按钮的回调，应用样式
       */
    applyFormat({ name, value }) {
      this.quill.focus();
      // 内置的link处理UI样式无法定制，改为自定义逻辑
      if (name === 'link') {
        this.$emit('addLink', value);
        return;
      }
      // 如果存在quill内置的特殊handler，则使用内置handler
      const handlers = get(this.quill, 'theme.modules.toolbar.handlers', {});
      if (handlers[name]) {
        handlers[name].call(this.quill.theme.modules.toolbar, value);
      } else {
        this.quill.format(name, value, quill.sources.USER);
      }
      this.quill.focus();

      // 更新各个按钮的状态
      this.formats = this.quill.getFormat(this.quill.getSelection());
    },
    t({ onClick, active }) {
        const className = { 'active': active }
        return <button class={className} onClick={onClick}>加粗</button>


    }
  },
  render() {
    const content = map(this.toolbarList, (item) => {
      const { component, className = '', ...props } = item;
      props.formats = this.formats;

      // 控制a-select的下拉面板挂载的节点，防止出现遮挡，不跟随滚动等问题
      if (component === 'select-tool') {
        props.getPopupContainer = () => this.$refs.wrapper;
      }
      const scopedSlots = {
        default: item.scopedSlots.default.bind(this)// ({ active, onClick } = {}) => {
          // return item.scopedSlots.default.call(this,{ active, onClick })
          // const className = { 'active': active }
          // return <button class={className} onClick={onClick}>加粗</button>
        //}
      }

      return <component
        class={className}
        props={props}
        scopedSlots={scopedSlots}
        onApply={this.applyFormat}
      />;
    });
    return <div class="toolbar-wrapper" ref='wrapper'>
      {content}
    </div>;
  },
  created() {
    // 选择区域变化回调，更新toolbar按钮激活状态
    this.onSelectionChange = (range) => {
      this.update(range);
    };
    // 滚动区域变化回调，更新toolbar按钮激活状态
    this.onScrollOptimize = () => {
      const [range] = this.quill.selection.getRange();
      this.update(range);
    };
    const unWatch = this.$watch('quill', () => {
      if (this.quill) {
        this.quill.on(quill.events.SELECTION_CHANGE, this.onSelectionChange);
        this.quill.on(quill.events.SCROLL_OPTIMIZE, this.onScrollOptimize);
        this.quill.focus();
        unWatch();
      }
    });
  },
  mounted() {
  },
  beforeDestroy() {
    if (this.quill) {
      this.quill.off(quill.events.EDITOR_CHANGE, this.onEditorChange);
      this.quill.off(quill.events.SCROLL_OPTIMIZE, this.onScrollOptimize);
    }
  },
};
</script>
<style lang='less' scoped>
.toolbar-wrapper {
  display: flex;
  background: #fff;
  border: 0;
  border-bottom: 1px solid #cacfd9;
  border-radius: 4px 4px 0 0 ;
  padding: 8px;
  align-items: center;
  flex-wrap: wrap;

  .divider {
    border-right: 1px solid #ccc;
    height: 20px;
    margin: 0 6px;
  }

  /deep/.ant-select {
    width: 45px;
    margin: 0 6px;

    &.align-select {
      width: 33px;
      height: 22px;
    }

    .ant-select-selection {
      &,&:hover,&:active {
        border: 0;
        box-shadow: unset;
      }
    }

    .ant-select-selection__rendered {
      margin: 0;
    }
    .ant-select-arrow {
      right: 0;
    }
  }
  /deep/ .ant-select-dropdown {
    .ant-select-dropdown-menu {
      max-height: 150px;

      .ant-select-dropdown-menu-item {
        padding: 8px 6px;
        text-align: center;
        line-height: 1;
        font-weight: normal;
      }
    }
  }

}
</style>
