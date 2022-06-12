<script>
/**
   * @Description:
   *  quill editor的工具栏中颜色选择器
   */
import { NOOP } from './service';

export default {
  name: 'ColorTool',
  props: {
    name: String,
    title: String,
    icon: Array,
    dftValue: String,
    formats: Object,
    getValue: {
      type: Function,
      default: () => NOOP,
    },
  },
  data() {
    return {
      showPicker: false,
    };
  },
  methods: {
    /**
       * 修改颜色的回调
       */
    onChange(value) {
      const { name, getValue } = this;
      this.$emit('apply', { name, value: getValue(value) });
      this.showPicker = !this.showPicker;
    },
    /**
       * 点击颜色按钮回调
       */
    onClick() {
      // el-color-picker没有开放控制面板显示隐藏的props，
      // 这里通过写入实例内部数据的方式进行hack
      this.showPicker = !this.showPicker;
      this.$refs.picker.showPicker = this.showPicker;
    },
  },
  render() {
    const {
      name,
      dftValue,
      title,
      icon,
      formats,
      onChange,
      onClick,
    } = this;
    const formatVal = formats[name] || dftValue;
    let style = {};
    // 白色时改为系统默认色，防止与背景重合看不到
    if (/^(f|#)+$/.test(formatVal)) {
      style = { color: '#ccc' };
    } else if (formatVal) {
      style = { color: formatVal };
    }
    const [fixed, dynamic] = icon;
    return <div class='color-picker-wrapper'>
      <a-button
        class='btn'
        type='link'
        title={title}
        onClick={onClick}
      >
        <i class={['content dynamic iconfont', name, dynamic]} style={style} />
        <i class={['content fixed iconfont', name, fixed]} />
      </a-button>
      <el-color-picker
        ref='picker'
        class='picker'
        size='small'
        value={formatVal}
        onChange={onChange}
      />
    </div>;
  },
};
</script>
<style lang='less' scoped>
.color-picker-wrapper {
  position: relative;

  .btn {
    padding: 0 6px;
    border: 0;
    position: relative;
    width: 28px;
    height: 18px;
    line-height: 18px;

    .content {
      color: #000;
      font-size: 17px;
      position: absolute;
      top: 0;
      left: 0;
    }

    &:hover {
      .content {
        color: #06c;
      }
    }
  }

  .picker {
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: -1;

    /deep/ .el-color-picker__trigger {
      background: transparent;
      box-shadow: unset;
    }
    /deep/ .el-color-picker__color,
    /deep/ .el-color-picker__icon {
      display: none;
    }
  }
}
</style>
