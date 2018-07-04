module.exports = {
  chainWebpack: config => {
    const lintRule = config.module.rule('eslint');

    lintRule.uses.clear();

    config.resolve.extensions.prepend('.mjs');

    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .type('javascript/auto');
  },
};
