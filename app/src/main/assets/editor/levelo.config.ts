// levelo.config.ts
export default {
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'fragment',
    jsxInject: `import { h } from 'levelojs'`
  }
};
