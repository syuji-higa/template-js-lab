import {
  FuseBox,
  BabelPlugin,
} from 'fuse-box';

const fuse = FuseBox.init({
  homeDir: 'src',
  output: 'dist/$name.js',
  sourceMaps: true,
  plugins: [
    BabelPlugin({
      extensions: ['.js'],
      test: /\.js$/,
    }),
  ],
});

fuse
  .bundle('bundle')
  .instructions('>main.js')
  .hmr()
  .watch();

fuse.dev({
  root: 'dist/',
  httpServer: true,
});

fuse.run();
