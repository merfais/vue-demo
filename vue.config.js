const path = require('path');

const devServer = {
  port: 8000,
  watchOptions: {
    // poll: true,
  },
  disableHostCheck: true,
};

const chainWebpack = (config) => {
  config.resolve.alias
    .set('@', path.resolve(__dirname, 'src'))
    .set('src', path.resolve(__dirname, 'src'))
    .set('plugins', path.resolve(__dirname, 'src/plugins'))
    .set('components', path.resolve(__dirname, 'src/components'))
    .set('router', path.resolve(__dirname, 'src/router'))
    .set('store', path.resolve(__dirname, 'src/store'))
    .set('services', path.resolve(__dirname, 'src/services'))
    .set('network', path.resolve(__dirname, 'src/network'))
    .set('utils', path.resolve(__dirname, 'src/utils'))
    .set('pages', path.resolve(__dirname, 'src/pages'))
    .set('views', path.resolve(__dirname, 'src/views'));

  if (process.env.NODE_ENV === 'development') {
    config.devtool(false);
  }
};

const pages = {
  index: {
    // page 的入口
    entry: 'src/main.js',
    // 模板来源
    template: 'public/index.html',
    // 在 dist/index.html 的输出
    filename: 'index.html',
    // 当使用 title 选项时，
    // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
    title: 'demo',
    // 在这个页面中包含的块，默认情况下会包含
    // 提取出来的通用 chunk 和 vendor chunk。
    chunks: ['chunk-vendors', 'chunk-common', 'index'],
  },
};

module.exports = {
  pages,
  publicPath: './',
  chainWebpack,
  devServer,
  // lintOnSave: false,
  runtimeCompiler: true,
  productionSourceMap: false,
};
