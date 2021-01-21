<template>
<div class='wrapper'>
  <div class='home'
    @click="onClickHome"
    >
    <a-icon type="home" />
  </div>
  <div class='source-code'>
    <span>源码地址:</span>
    <a class='code-link'
      :href='filePath'
      target="_blank"
      rel="noopener noreferrer"
      >
      {{filePath}}
    </a>
  </div>
  <div class='space' />
  <a class='link'
    :href='href'
    target="_blank"
    rel="noopener noreferrer"
    >
    <a-icon class='github-icon' type="github" />
    欢迎 star，watch，follow 一键三连
  </a>
</div>
</template>
<script>
import { routes } from '@/router';

export default {
  data() {
    return {
      routes,
      href: 'https://github.com/merfais/vue-demo',
    }
  },
  computed: {
    filePath() {
      if (!this.$store.state.filePath) {
        return 'https://github.com/merfais/vue-demo'
      }
      const prefix = 'https://github.com/merfais/vue-demo/blob/main/src/'
      return prefix + this.$store.state.filePath
    },
  },
  methods: {
    onClickHome() {
      this.$router.push('/')
    },
  },
}
</script>
<style lang="less" scoped>
.wrapper {
  height: 55px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  box-shadow: 0px 3px 4px rgba(0, 0, 0, .1);
  background: rgba(200, 200, 200, 0.3);
  padding: 10px 20px;
  margin-bottom: 9px;

  .home {
    padding: 10px;
    font-size: 24px;
    cursor: pointer;

    &:hover {
      color: #1890ff;
    }
  }

  .space {
    flex-grow: 1;
  }

  .source-code {
    padding-left: 20px;
    font-size: 14px;

    .code-link {
      border-bottom: 1px solid #1890ff;
    }
  }

  .link {
    font-size: 18px;
    font-style: italic;
    border-bottom: 1px solid #1890ff;
    text-shadow: 1px 1px white, -1px -1px #444,
                  0.1em 0.1em 0.5em #333;
  }

  .github-icon {
    font-size: 30px;
    color: #555;
  }
}
</style>
