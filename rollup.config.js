import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/image-annotator-lib.js',
    format: 'umd',
    name: 'ImageAnnotatorLib', // This is the global variable name for the UMD build
  },
  plugins: [
    resolve(),
  ],
};