const {
  FuseBox,
  BabelPlugin,
} = require('fuse-box');

const fuse = FuseBox.init({
  homeDir: 'src',
  output: 'dist/$name.js',
  sourceMaps: true,
  plugins: [
    BabelPlugin({
      config: {
        sourceMaps: true,
        presets: [
          [
            'env',
            {
              targets: {
                browsers: [
                  'last 2 versions',
                  'safari >= 7',
                ],
              },
              useBuiltIns: true,
            },
          ],
          [
            'stage-0',
          ],
        ],
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
