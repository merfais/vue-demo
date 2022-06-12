<script>
/**
   * @Description:
   *  quill editor的工具栏中按钮形态的功能
   */
import { NOOP } from './service';

export default {
  name: 'ButtonTool',
  props: {
    name: String,
    title: String,
    icon: String,
    formats: Object,
    getValue: {
      type: Function,
      default: () => NOOP,
    },
    isActive: {
      type: Function,
      default: () => NOOP,
    },
    render: Function,
  },
  data() {
    return {
    };
  },
  computed: {
    active() {
      // 计算按钮是否激活
      let active = false;
      const { formats, name, isActive } = this
      const value = formats[name];
      if (value !== null && value !== undefined) {
        active = isActive(value);
      }
      return active
    }
  },
  methods: {
    onClick() {
      const { name, getValue, formats } = this;
      const value = getValue(formats[name]);
      this.$emit('apply', { name, value });
    },
  },
  render() {
    const { active, title, icon, onClick, $scopedSlots } = this;
    const { default: dftRender } = $scopedSlots

    if (dftRender) {
      console.log('xxxxxxxxxx', dftRender.toString())
      return dftRender({
        active,
        onClick,
      })
    }

    const className = active ? 'btn active' : 'btn';
    return <button
      class={className}
      title={title}
      onClick={onClick}
    >
      <i class={icon}></i>
    </button>
  },
};
</script>
<style lang='less' scoped>
.btn {
  &:hover, &.active {
    color: #06c;
  }
}
</style>
