import posthtml from 'posthtml'
import { Plugin } from './_plugin.js'
import { FlatCache } from './flatCache.js'

export class PostHtml extends Plugin {
  #pluginsArray
  cache

  constructor(options) {
    super({
      associations: options.associations,
      workingDirectory: options.workingDirectory,
      ignore: options.ignore,
    })

    this.#pluginsArray = options.plugins

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
    let distPathToFile = this.getDistPathForFile(pathToFile)

    let result = await posthtml(this.#pluginsArray)
      .process(this.fs.readFileSync(pathToFile, Plugin.ENCODING))

    this.fs.outputFileSync(distPathToFile, result.html, Plugin.ENCODING)

    this.emitter.emit('processedFile', {
      pathToFile: pathToFile,
      style: 'cyan'
    })
  }
}