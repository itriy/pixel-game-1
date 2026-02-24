export default defineNitroConfig({
  preset: 'cloudflare_module',
  compatibilityDate: '2026-02-22',
  srcDir: '.',
  publicAssets: [
    {
      baseURL: '/',
      dir: 'public',
    },
  ],
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
  },
  devServer: {
    watch: ['routes/**/*', 'public/**/*'],
  },
});
