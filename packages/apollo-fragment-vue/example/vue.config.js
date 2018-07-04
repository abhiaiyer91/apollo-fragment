module.exports = {
  chainWebpack: config => {
    const lintRule = config.module.rule('eslint');

    lintRule.uses.clear();
    config.resolve.extensions.prepend('.ts');
    config.resolve.extensions.prepend('.mjs');

    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .type('javascript/auto');

    config.module
      .rule('ts')
      .test(/\.tsx?$/)
      .use('ts-loader')
      .loader('ts-loader');
  },
};
