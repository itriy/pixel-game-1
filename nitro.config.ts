export default defineNitroConfig({
  preset: 'cloudflare-pages',
  compatibilityDate: '2026-02-22',
  srcDir: '.',
  publicAssets: [
    {
      baseURL: '/',
      dir: 'public',
    },
  ],
  devServer: {
    watch: ['routes/**/*', 'public/**/*'],
  },
});
