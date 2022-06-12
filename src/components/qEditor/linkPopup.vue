<script>
/**
   * @Description:
   *  quill editor的用于控制超链接文本的动态工具栏
   */
import quill from 'quill';
import { Range } from 'quill/core/selection';

const LinkBlot = quill.import('formats/link');

const wrapperHeight = 64;   // popup高度
const wrapperWidth = 350;   // popup宽度

export default {
  name: 'LinkPopup',
  props: {
    quill: Object,
    visible: Boolean,
    preview: Boolean,
    contentValue: String,
  },
  data() {
    return {
      value: '',
      inputValue: '',
      rangeBound: {},
    };
  },
  watch: {
    preview() {
      // 关闭link preview 面板，让编辑器再次获取焦点
      if (!this.preview) {
        this.$nextTick(() => {
          this.$refs.input.focus();
        });
      }
    },
    contentValue(newVal, oldVal) {
      // 切换其他链接，显示工具栏，切换为预览态
      if (newVal !== oldVal) {
        this.$emit('update:preview', true);
        this.$emit('update:visible', false);
      }
    },
  },
  computed: {
    style() {
      if (!this.visible) {
        return { display: 'none' };
      }
      const style = { display: 'flex' };

      // 计算快捷工具栏位置，限定在编辑器内，且不遮挡不越界
      const containerBound = this.quill.$refs.container.getBoundingClientRect();
      const containerScrollTop = this.quill.$refs.container.scrollTop;

      let top = this.rangeBound.bottom;
      // 越过编辑器的底部, 翻转到上面显示
      if (top + wrapperHeight > containerBound.height + containerScrollTop) {
        top = this.rangeBound.top - wrapperHeight;
      }
      style.top = `${top}px`;

      // 居中显示
      let left = this.rangeBound.left - (wrapperWidth / 2);
      // 越过左侧，left设置为1，避免与外边框重叠
      if (left < 1) {
        left = 1;
      }
      // 越过右侧，right设置为1，避免与外边框重叠
      if (left + wrapperWidth - containerBound.width > 0) {
        style.right = '1px';
      } else {
        style.left = `${left}px`;
      }
      return style;
    },
  },
  methods: {
    /**
       * 修改链接值
       */
    onInput(e) {
      this.inputValue = e.target.value;
    },
    /**
       * 保存链接回调
       */
    onOk() {
      this.value = this.inputValue.trim();
      if (this.linkRange) {
        // 修改link
        this.quill.formatText(this.linkRange, 'link', this.value, quill.sources.USER);
      } else {
        // 非link区域，插入link
        if (this.range && this.range.length) {
          // 选中区域添加link
          this.quill.format('link', this.value, quill.sources.USER);
        } else {
          // 光标处插入link
          this.quill.insertText(this.range, this.value, { link: this.value }, quill.sources.USER);
        }
      }
      // 保存后关闭popup面板
      this.$emit('update:preview', true);
      this.$emit('update:visible', false);
    },
    /**
       * 点击取消回调
       */
    onCancel() {
      this.inputValue = '';
      // 没有选中连接，关闭快捷工具栏
      if (!this.linkRange) {
        this.$emit('update:visible', false);
      }
      // 连接有值，切回到预览态
      this.$emit('update:preview', true);
    },
    /**
       * 点击修改回调
       */
    onModify() {
      // 选中链接，将链接内容赋给输入框
      if (this.linkRange) {
        this.inputValue = this.value;
      }
      // 切换到编辑态
      this.$emit('update:preview', false);
    },
    /**
       * 点击复制按钮
       */
    onCopy() {
      this.$copyText(this.value).then(() => {
        this.$message.info('复制成功');
      }, (e) => {
        this.$message.error('复制失败');
        console.error(e);
      });
    },
    /**
       * 点击删除按钮
       */
    onDel() {
      this.value = '';
      this.quill.formatText(this.linkRange, 'link', false, quill.sources.USER);
      this.$emit('update:preview', true);
      this.$emit('update:visible', false);
    },
    /**
       * 编辑器选择区域变化的回调
       */
    onSelectionChange(range, oldRange, source) {
      // 没有选中内容，或不是用户触发的，跳过，不处理
      if (!range || source !== quill.sources.USER) {
        return;
      }
      // 清除缓存数据
      this.value = '';
      this.inputValue = '';
      this.linkRange = null;
      this.$emit('update:preview', true);

      // 获取并记录选中的区域
      this.range = range;
      this.rangeBound = this.quill.getBounds(range.index, 1);

      // 点击编辑区域，激活光标，range.length = 0
      if (range.length === 0) {
        const [link, offset] = this.quill.scroll.descendant(LinkBlot, range.index);
        // 点击的是link区域，弹出linkPopup
        if (link) {
          this.linkRange = new Range(range.index - offset, link.length());
          this.value = LinkBlot.formats(link.domNode);
          this.inputValue = this.value;
          this.$emit('update:visible', true);
          return;
        }
      }
      // 非link区域的点击或选中均关闭linkPopup
      this.$emit('update:visible', false);
    },
    /**
       * 渲染快捷工具栏的编辑态
       */
    renderEdit() {
      return [
        <div class='input-wrapper'>
          <label class='label'>链接</label>
          <a-input
            ref='input'
            class='input'
            value={this.inputValue}
            placeholder='http://test.test.com'
            onInput={this.onInput}
          />
        </div>,
        <a-button
          class='edit-btn'
          onClick={this.onCancel}
        >
            取消
        </a-button>,
        <a-button
          class='edit-btn'
          type="primary"
          onClick={this.onOk}
        >
            应用
        </a-button>,
      ];
    },
    /**
       * 渲染快捷工具栏的预览态
       */
    renderPreview() {
      return [
        <i class='ifont iconfont iconshezhi' />,
        <a
          class='link'
          href={this.value}
          target='_blank'
          title={this.value}
        >
          {this.value}
        </a>,
        <a-button
          class='btn'
          type='link'
          title='复制'
          onClick={this.onCopy}
        >
          <i class='ifont iconfont iconfuzhi' />
        </a-button>,
        <a-button
          class='btn'
          type='link'
          title='修改'
          onClick={this.onModify}
        >
          <i class='ifont iconfont iconbianji1' />
        </a-button>,
        <a-button
          class='btn'
          type='link'
          title='删除链接'
          onClick={this.onDel}
        >
          <i class='ifont iconfont iconguanbi' />
        </a-button>,
      ];
    },
  },
  render() {
    return <div
      class='link-popup-wrapper'
      style={this.style}
      ref='wrapper'
    >
      {this.preview ? this.renderPreview() : this.renderEdit()}
    </div>;
  },
  created() {
    this.onSelectionChange = this.onSelectionChange.bind(this);
    // 如果quill对象有值，直接绑定事件，否则添加watch
    if (this.quill) {
      this.quill.on(quill.events.SELECTION_CHANGE, this.onSelectionChange);
    } else {
      const unWatch = this.$watch('quill', () => {
        if (this.quill) {
          this.quill.on(quill.events.SELECTION_CHANGE, this.onSelectionChange);
          // 绑定完事件，取消watch，避免重复绑定
          unWatch();
        }
      });
    }
  },
  mounted() {
  },
  beforeDestroy() {
    if (this.quill) {
      this.quill.off(quill.events.SELECTION_CHANGE, this.onSelectionChange);
    }
  },
};
</script>
<style lang='less' scoped>
.link-popup-wrapper {
  padding: 15px;
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  box-shadow: 1px 2px 10px #ccc;
  width: 350px;
  position: absolute;
  background: #fff;
  border-radius: 4px;
  flex-wrap: nowrap;
  z-index: 1;

  .link {
    color: #06c;
    padding: 0 10px;
    flex: 1;
    line-height: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-decoration: underline;
  }

  .btn {
    color: #333;
    padding: 5px;
    flex: 0;

    .ifont {
      font-size: 14px;
    }
  }

  .edit-btn {
    margin-left: 10px;
    padding: 0 8px;
    font-size: 12px;
  }

  .input-wrapper {
    position: relative;
    flex: 1;

    .label {
      position: absolute;
      background: #fff;
      top: -10px;
      left: 8px;
      padding: 0 5px;
      font-size: 10px;
      z-index: 1;
    }

    .input {
      font-size: 12px;
    }
  }
}
</style>
