const unwrapCascadeLayers = {
  postcssPlugin: "unwrap-cascade-layers",
  AtRule: {
    layer(atRule) {
      if (atRule.nodes) {
        atRule.replaceWith(...atRule.nodes);
        return;
      }

      atRule.remove();
    },
  },
};

const config = {
  plugins: ["@tailwindcss/postcss", unwrapCascadeLayers],
};

export default config;
