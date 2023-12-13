import paths from './paths.js'
import { isProductionMode } from './environment.js'

export default {
  html: {
    files: paths.src.root + '*.html',
    tasks: ['newer:posthtml', 'newer:prettify'],
    options: {
      spawn: false,
    },
  },
  htmlComponents: {
    files: paths.src.root + 'components/*.html',
    tasks: ['posthtml', 'prettify'],
    options: {
      spawn: false,
    },
  },
  // htmlLint: {
  //   files: paths.dest.root + '*.html',
  //   tasks: 'newer:htmllint',
  //   options: {
  //     spawn: false,
  //   },
  // },
  css: {
    files: paths.src.styles + '*.pcss',
    tasks: 'newer:postcss:base',
    options: {
      spawn: false,
    },
  },
  cssForScripts: {
    files: paths.src.scripts + '**/*.pcss',
    tasks: 'newer:postcss:modules',
    options: {
      spawn: false,
    },
  },
  cssEnvFile: {
    files: paths.src.styles + '_environment.pcss',
    tasks: 'postcss',
    options: {
      spawn: false,
    },
  },
  assets: {
    files: paths.src.assets + '**/*',
    tasks: 'newer:copy',
    options: {
      spawn: false,
    },
  },
  images: {
    files: [
      //! DO NOT SET AN ANOTHER REGEX VALUE, only **/** works. ¯\_(ツ)_/¯
      paths.src.images + '**/**',
    ],
    tasks: 'sharp',
    options: {
      spawn: false,
      event: ['changed', 'added']
    },
  },
}