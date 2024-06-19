import sharp from 'sharp'
import { Plugin } from './_plugin.js'
import { FlatCache } from './flatCache.js'

export class Sharp extends Plugin {
  #ALLOWED_EXTENSIONS = [
    'gif',
    'png',
    'jpg', 'jpeg',
    'webp',
    'avif',
    'tiff',
    'heif',
  ]
  #DEFAULT_CONVERSION_OPTIONS = {
    quality: 90,
    lossless: false,
    chromaSubsampling: '4:2:0',
  }
  #DEFAULT_SHARP_OPTIONS = {
    animated: true,
    limitInputPixels: false,
  }
  #options
  #sharpOptions
  cache

  constructor(options) {
    super({
      associations: options.associations,
      workingDirectory: options.workingDirectory,
      ignore: options.ignore,
    })

    this.#sharpOptions = Object.assign(
      this.#DEFAULT_SHARP_OPTIONS,
      options.params.sharpOptions ?? {}
    )
    delete options.params.sharpOptions

    this.#options = this.#parseOptionObject(options.params)

    options.reLaunchOn && this.startWatching(options.reLaunchOn)

    this.cache = new FlatCache({
      id: this.constructor.name,
    })

    this.runProcess()
  }

  async runProcess(paths = this.files()) {
    paths = this.cache.getChangedFiles(paths)

    let normalizedPaths = this.normalizeInputPaths(paths)
    if (!normalizedPaths) return


    this.emitter.emit('processStart')

    try {
      for (let pathToFile of normalizedPaths) {
        await this.#process(pathToFile)
      }
    }
    catch (error) {
      this.errorLog(error)
      return this.returnAndCleanProcessedBuffer()
    }


    this.emitter.emit('processEnd')

    return this.returnAndCleanProcessedBuffer()
  }

  async #process(pathToFile) {
    let parsedPath = this.path.parse(pathToFile)
    let extWithoutDot = parsedPath.ext.replace('.', '')

    if (!this.#extnameIsCorrect(extWithoutDot)) {
      this.#copyWithLog(pathToFile, parsedPath.base)

      return this.getDistPathForFile(pathToFile)
    }

    for (let paramName of Object.keys(this.#options[extWithoutDot])) {
      let outputExtname = paramName == 'this' ? extWithoutDot : paramName

      let destFilePath = this.getDistPathForFile(pathToFile, outputExtname)

      let sharpInstance = await sharp(pathToFile, this.#sharpOptions)
        .toFormat(
          outputExtname,
          {
            ...this.#DEFAULT_CONVERSION_OPTIONS,
            ...this.#options[extWithoutDot][paramName]
          }
        )

      this.fs.createFileSync(destFilePath)

      await sharpInstance.toFile(destFilePath)

      this.emitter.emit('processedFile', {
        pathToFile: pathToFile,
        style: 'magenta',
        extension: outputExtname,
      })
    }
  }

  #parseOptionObject(options) {
    for (let [rule, params] of Object.entries(options)) {
      let optionsForFatherRule = {}

      for (let paramName of Object.keys(params)) {
        // if the parameter is not an extension parameter
        if (!this.#extnameIsCorrect(paramName)) {
          optionsForFatherRule[paramName] = params[paramName]

          delete options[rule][paramName]

          continue
        }
      }

      if (Object.keys(optionsForFatherRule).length > 0) {
        options[rule].this = optionsForFatherRule
      }
      if (Object.keys(params).length == 0) {
        options[rule].this = {}
      }
    }

    return options
  }

  #copyWithLog(pathToFile) {
    this.fs.copySync(pathToFile, this.getDistPathForFile(pathToFile))

    this.emitter.emit('processedFile', {
      pathToFile: pathToFile,
      style: 'red',
      extension: this.path.extname(pathToFile).replace('.', ''),
    })
  }
  #extnameIsCorrect(extname) {
    if (!this.#ALLOWED_EXTENSIONS.includes(extname)) {
      return false
    }
    else {
      return true
    }
  }
}