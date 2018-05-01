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
                  'last 3 versions',
                  'not < 0.25%',
                  'not Android < 5',
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
