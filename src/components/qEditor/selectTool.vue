<script>
/**
 * @Description:
 *  quill editor的工具栏中下拉框形态的功能
 */
import map from 'lodash/map';
import { NOOP } from './service';

export default {
  name: 'SelectTool',
  props: {
    name: String,
    title: String,
    options: Array,
    dftValue: String,
    formats: Object,
    getPopupContainer: {
      type: Function,
      default: () => NOOP,
    },
    getValue: {
      type: Function,
      default: () => NOOP,
    },
  },
  data() {
    return {
    };
  },
  methods: {
    /**
     * 修改下拉框的值
     */
    onSelect(value) {
      const { name, getValue } = this;
      this.$emit('apply', { name, value: getValue(value) });
    },
  },
  render() {
    const {
      name,
      dftValue,
      options,
      formats,
      getPopupContainer,
      onSelect,
    } = this;
    const formatVal = formats[name] || dftValue;

    // 下拉选项
    const optionsDom = map(options, ({ value, label, icon, title }) => {
      const text = label || <i class={['select-icon iconfont', icon]} />;
      return <a-select-option key={value} title={title}>
        {text}
      </a-select-option>;
    });

    return <a-select
      ref={name}
      size='small'
      value={formatVal}
      dropdownMatchSelectWidth={false}
      getPopupContainer={getPopupContainer}
      onSelect={onSelect}
    >
      {optionsDom}
    </a-select>;
  },
};
</script>
<style lang='less' scoped>
</style>
