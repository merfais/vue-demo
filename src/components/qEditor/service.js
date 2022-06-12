import _ from 'lodash';
import quill from 'quill';
import italicSvg from 'quill/assets/icons/italic.svg'

// 重置fontSize内置的whitelist，可以设置任意字号
const fontSize = quill.import('attributors/style/size');
fontSize.whitelist = null;
quill.register(fontSize, true);

/**
 * 生成fontSize配置
 */
const genFontSize = function genFontSize() {
  // 最大字号70px
  const maxSize = 61;
  return _.map(Array.from(Array(maxSize)), (v, i) => {
    const size = `${i + 10}px`;
    return { value: size, label: size };
  });
};

/**
 * 生成段落，正文，标题配置
 */
const genParagraph = function genParagraph() {
  const list = [{ value: 'false', label: '正文' }];
  for (let i = 1; i < 7; i += 1) {
    list.push({ value: i, label: `H${i}` });
  }
  return list;
};

/**
 * 生成对齐方式配置
 */
const genAlign = function genAlign() {
  return [
    { value: 'left', title: '左对齐', icon: 'iconzuoduiqi' },
    { value: 'center', title: '居中', icon: 'iconzhongduiqi' },
    { value: 'right', title: '右对齐', icon: 'iconyouduiqi' },
  ];
};

export const getToolbarMap = () => ({
  bold: {
    name: 'bold',
    title: '加粗',
    isActive: value => value === true,
    getValue: value => !value,
    component: 'button-tool',
    icon: 'icofont-settings-alt',
    svgIcon: italicSvg,
  },
  italic: {
    name: 'italic',
    title: '倾斜',
    isActive: value => value === true,
    getValue: value => !value,
    component: 'button-tool',
    icon: 'icofont-settings-alt',
  },
  underline: {
    name: 'underline',
    title: '下划线',
    isActive: value => value === true,
    getValue: value => !value,
    component: 'button-tool',
    icon: 'icofont-settings-alt',
  },
  strike: {
    name: 'strike',
    title: '中划线',
    isActive: value => value === true,
    getValue: value => !value,
    component: 'button-tool',
    icon: 'icofont-settings-alt',
  },
  blockquote: {
    name: 'blockquote',
    title: '引用',
    isActive: value => value === true,
    getValue: value => !value,
    component: 'button-tool',
    icon: 'icofont-settings-alt',
  },
  divider: {
    component: 'div',
    className: 'divider',
  },
  orderedList: {
    name: 'list',
    title: '有序列表',
    isActive: value => value === 'ordered',
    getValue: value => (value === 'ordered' ? '' : 'ordered'),
    component: 'button-tool',
    icon: 'icofont-settings-alt',
  },
  bulletList: {
    name: 'list',
    title: '无序列表',
    isActive: value => value === 'bullet',
    getValue: value => (value === 'bullet' ? '' : 'bullet'),
    component: 'button-tool',
    icon: 'icofont-settings-alt',
  },
  leftIndent: {
    name: 'indent',
    title: '左缩进',
    isActive: value => value < 0,
    getValue: () => '-1',
    component: 'button-tool',
    icon: 'icofont-settings-alt',
  },
  rightIndent: {
    name: 'indent',
    title: '右缩进',
    isActive: value => value > 0,
    getValue: () => '+1',
    component: 'button-tool',
    icon: 'icofont-settings-alt',
  }
})

/**
 * 生成操作栏配置
 */
export const getToolbar = () => [{
  name: 'bold',
  title: '加粗',
  isActive: value => value === true,
  getValue: value => !value,
  component: 'button-tool',
  icon: 'iconjiacu',
}, {
  name: 'italic',
  title: '倾斜',
  isActive: value => value === true,
  getValue: value => !value,
  component: 'button-tool',
  icon: 'iconbianjiqixieti',
}, {
  name: 'underline',
  title: '下划线',
  isActive: value => value === true,
  getValue: value => !value,
  component: 'button-tool',
  icon: 'iconxiahuaxian',
}, {
  name: 'strike',
  title: '中划线',
  isActive: value => value === true,
  getValue: value => !value,
  component: 'button-tool',
  icon: 'iconzitishanchuxian',
}, {
  name: 'blockquote',
  title: '引用',
  isActive: value => value === true,
  getValue: value => !value,
  component: 'button-tool',
  icon: 'iconbianjiqiyinyong',
}, {
  component: 'div',
  className: 'divider',
}, {
  name: 'list',
  title: '有序列表',
  isActive: value => value === 'ordered',
  getValue: value => (value === 'ordered' ? '' : 'ordered'),
  component: 'button-tool',
  icon: 'iconyouxupailie',
}, {
  name: 'list',
  title: '无序列表',
  isActive: value => value === 'bullet',
  getValue: value => (value === 'bullet' ? '' : 'bullet'),
  component: 'button-tool',
  icon: 'iconwuxupailie',
}, {
  name: 'indent',
  title: '左缩进',
  isActive: value => value < 0,
  getValue: () => '-1',
  component: 'button-tool',
  icon: 'iconzuosuojin',
}, {
  name: 'indent',
  title: '右缩进',
  isActive: value => value > 0,
  getValue: () => '+1',
  component: 'button-tool',
  icon: 'iconyousuojin',
}, {
  name: 'align',
  dftValue: 'left',
  options: genAlign(),
  getValue: value => (value === 'left' ? false : value),
  component: 'select-tool',
  className: 'align-select',
}, {
  component: 'div',
  className: 'divider',
}, {
  name: 'size',
  dftValue: '14px',
  options: genFontSize(),
  getValue: value => value,
  component: 'select-tool',
}, {
  name: 'header',
  dftValue: 'false',
  options: genParagraph(),
  getValue: value => (value === 'false' ? false : value),
  component: 'select-tool',
}, {
  component: 'div',
  className: 'divider',
}, {
//   name: 'color',
//   title: '字体颜色',
//   dftValue: '#000',
//   getValue: value => value,
//   isActive: value => !!value,
//   component: 'color-tool',
//   icon: ['iconwenbendingbububianse-copy', 'iconwenbenyanse-bianse5'],
// }, {
//   name: 'background',
//   title: '背景色',
//   dftValue: '#fff',
//   getValue: value => value,
//   isActive: value => !!value,
//   component: 'color-tool',
//   icon: ['iconwenbendingbububianse', 'iconbackground'],
// }, {
  name: 'clean',
  title: '清除样式',
  isActive: () => false,
  getValue: () => {},
  component: 'button-tool',
  icon: 'iconxingzhuangjiehe21',
}, {
  name: 'link',
  title: '超链接',
  isActive: value => !!value,
  getValue: value => value,
  component: 'button-tool',
  icon: 'iconfuwenbenbianjiqi_chaolianjie',
}];


export const NOOP = () => {}
