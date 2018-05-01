import {
  FuseBox,
  BabelPlugin,
} from 'fuse-box';

const fuse = FuseBox.init({
  homeDir: 'src',
  output: 'dist/$name.js',
  plugins: [
    BabelPlugin({
      config: {
        sourceMaps: true,
      },
    }),
  ],
});

fuse
  .bundle('bundle')
  .instructions('>main.js')
  .hmr({ reload: true })
  .watch();

fuse.dev({
  root: 'dist/',
  httpServer: true,
});

fuse.run();
