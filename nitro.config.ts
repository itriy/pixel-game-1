export default defineNitroConfig({
  srcDir: '.',
  publicAssets: [
    {
      baseURL: '/',
      dir: 'public'
    }
  ],
  devServer: {
    watch: ['routes/**/*', 'public/**/*']
  }
});