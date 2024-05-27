import fs from 'fs-extra'
import replace from 'replace-in-file'
import { log } from 'console'
import enquirer from 'enquirer'
import chalk from 'chalk'
import paths from './grunt/other/paths.js'

class ModuleObject {
  constructor(config = {}) {
    this.moduleName = null
    this.filesAndFolders = null
    this.htmlConnectStrings = null

    Object.assign(this, config)
  }
}
class VariableTemplate {
  constructor(config = {}) {
    this.fields = null
    this.message = null
    this.template = null
    this.snippetName = null
    this.variableFilePath = null

    Object.assign(this, config)
  }
}

const pathToProject = './',
  distFolderName = pathToProject + 'dist/',
  snippetsFolderName = pathToProject + 'snippets/',
  readmeFolder = pathToProject + 'readmeFiles/',
  sources = pathToProject + 'sources/',
  readmeFilePath = pathToProject + 'README.md',
  stylesFolder = sources + 'styles/',
  scriptsFolder = sources + 'scripts/',
  assets = sources + 'assets/',
  fontsGitkeep = sources + 'fonts/.gitkeep',
  gruntPostcss = pathToProject + 'grunt/css/postcss.js',
  styles = {
    folder: stylesFolder,
    environment: stylesFolder + '_environment.pcss',
    normalize: stylesFolder + 'normalize.pcss',
    others: stylesFolder + 'other.pcss',
  },
  html = {
    folder: sources,
    components: sources + 'components/',
    layout: sources + 'components/' + 'layout.html',
    index: sources + 'index.html',
  }


logSomeImportantInConsole(
  `Salute!
You will have to use some keys, such as: 
${chalk.yellowBright('↑')} - focus up,
${chalk.yellowBright('↓')} - focus down,
${chalk.yellowBright('← →')} - choosing between elements on the same line,
${chalk.yellowBright('space')} - to select an option,
${chalk.yellowBright('⭾')} - tab, to move to a next element, for example, in templates.
`,
  chalk.green
)

await enquirer.toggle({
  message: chalk.italic('Any questions?'),
  enabled: chalk.greenBright('Nope, i totally understand!'),
  disabled: chalk.greenBright('Nope, i understand!'),
})


await includeModuleByQuestion(
  'Whether you want to save the plugin...',

  new ModuleObject({
    moduleName: 'Just Validate',
    filesAndFolders: assets + 'justValidate/',
    htmlConnectStrings: { strings: `justValidate="false"` },
  }),
  new ModuleObject({
    moduleName: 'scroll-timeline polyfill',
    filesAndFolders: assets + 'scroll-timeline.js',
    htmlConnectStrings: [
      { strings: `scrollTimeline="false"` }
    ],
  }),
  new ModuleObject({
    moduleName: `Slider Swiper ${chalk.magenta(`[MANDATORY FOR MODULE 'STEP BY STEP BLOCK']`)
      }`,
    filesAndFolders: assets + 'swiper/',
    htmlConnectStrings: { strings: `swiper="false"` },
  }),
  new ModuleObject({
    moduleName: 'Typed',
    filesAndFolders: assets + 'typed/',
    htmlConnectStrings: { strings: `typed="false"` },
  }),
  new ModuleObject({
    moduleName: 'Input Mask',
    filesAndFolders: assets + 'inputmask/',
  }),
  new ModuleObject({
    moduleName: 'Photo Swipe',
    filesAndFolders: assets + 'photoswipe/',
    htmlConnectStrings: { strings: `photoSwipe="false"` },
  }),
  new ModuleObject({
    moduleName: 'No Ui Slider',
    filesAndFolders: assets + 'nouislider/',
    htmlConnectStrings: { strings: `noUiSlider="false"` },
  })
)
await includeModuleByQuestion(
  'Whether you want to save the module...',

  new ModuleObject({
    moduleName: 'Scripts for dialog',
    filesAndFolders: [
      scriptsFolder + 'dialogs/',
      html.components + 'modals.html',
    ],
    htmlConnectStrings: [
      { strings: `<x-modals></x-modals>`, },
      { strings: `dialogs="false"` },
    ],
  }),
  new ModuleObject({
    moduleName: 'Tabs',
    filesAndFolders: scriptsFolder + 'tab/',
    htmlConnectStrings: [
      { strings: `tabs="false"` }
    ],
  }),
  new ModuleObject({
    moduleName: 'Parallax by mouse',
    filesAndFolders: scriptsFolder + 'mouseParallax/',
    htmlConnectStrings: [
      { strings: `mouseParallax="false"` }
    ],
  }),
  new ModuleObject({
    moduleName: 'AutoScrollPadding',
    filesAndFolders: scriptsFolder + 'autoScrollPadding/',
    htmlConnectStrings: [
      { strings: `autoScrollPadding="false"` }
    ],
  }),
  new ModuleObject({
    moduleName: 'Tools for observer',
    filesAndFolders: scriptsFolder + 'observerTools/',
    htmlConnectStrings: [
      { strings: `observerTools="false"` }
    ],
  }),
  new ModuleObject({
    moduleName: 'Horizontal scroll by mouse wheel',
    filesAndFolders: scriptsFolder + 'horizontalMouseScroll.ts',
    htmlConnectStrings: [
      { strings: `horizontalMouseScroll="false"` }
    ],
  }),
  new ModuleObject({
    moduleName: 'Switching by swipe',
    filesAndFolders: scriptsFolder + 'toggleBySwipe/',
    htmlConnectStrings: [
      { strings: `toggleBySwipe="false"` }
    ],
  }),
  new ModuleObject({
    moduleName: 'Step By Step block',
    filesAndFolders: scriptsFolder + 'stepByStepBlock/',
    htmlConnectStrings: [
      { strings: `stepByStep="false"` }
    ],
  }),
  new ModuleObject({
    moduleName: 'Infinite auto-scroll',
    filesAndFolders: scriptsFolder + 'infiniteScroll/',
    htmlConnectStrings: [
      { strings: `infiniteScroll="false"` }
    ],
  }),
)

await setMainFont()

logSomeImportantInConsole(
  `\nNow, i suggest you change the values of the main variables.\n`,
  chalk.greenBright
)

await setVariables(
  new VariableTemplate({
    snippetName: 'html layout',
    message: chalk.cyanBright(`Fill in the fields in the html-layout. \nSet the main language of pages. (${chalk.yellow.underline(html.layout)})`),
    variableFilePath: html.layout,
    fields: [
      { name: 'mainLangOfPages', initial: 'en' },
    ],
    template: `<html lang="\${mainLangOfPages}">`
  }),

  new VariableTemplate({
    snippetName: 'title of index page',
    message: chalk.cyanBright('Title of index page...'),
    variableFilePath: html.index,
    fields: [
      { name: 'title', initial: '' },
    ],
    template: `page_title="\${title}"`
  }),

  new VariableTemplate({
    snippetName: 'stylesheetVariables',
    message: chalk.cyanBright(
      `Fill in some css variables ${chalk.yellow.underline(styles.normalize)}`),
    variableFilePath: styles.normalize,
    fields: [
      { name: 'mainTextColor', initial: 'black', },
      { name: 'backgroundColor', initial: 'white', },
    ],
    template: `--main-text-color: \${mainTextColor};
--background: \${backgroundColor};`
  }),

  new VariableTemplate({
    snippetName: 'another name',
    message: chalk.cyanBright('Enter the width of the largest design layout.'
      + `\n${chalk.yellow.underline(gruntPostcss)}`),
    variableFilePath: gruntPostcss,
    fields: [
      { name: 'maxDesignLayoutWidth', initial: '1440', },
    ],
    template: `const LAYOUT_WIDTH = \${maxDesignLayoutWidth}`,
  }),

  new VariableTemplate({
    snippetName: 'some name',
    message: chalk.cyanBright(
      `Set the values for the ${chalk.red('content-inline-padding')} variable, which is intended to center the content.`
      + `\n${chalk.yellow.underline(styles.normalize)}`),
    variableFilePath: styles.normalize,
    fields: [
      { name: 'largePaddings', initial: '15vw', },
    ],
    template:
      `
@media (width > 1440px) {
  --content-inline-padding: \${largePaddings};
}`,
  }),

  new VariableTemplate({
    snippetName: 'some name 2',
    message: chalk.cyan('PC screen...'),
    variableFilePath: styles.normalize,
    fields: [
      { name: 'defaultPaddings', initial: '13vw', },
    ],
    template:
      `
@media (1024px <= width <= 1440px) {
  --content-inline-padding: \${defaultPaddings};
}`,
  }),

  new VariableTemplate({
    snippetName: 'some name 2.1',
    message: chalk.cyan('Small PC screens...'),
    variableFilePath: styles.normalize,
    fields: [
      { name: 'smallPcPaddings', initial: '10vw', },
    ],
    template:
      `
@media (769px <= width <= 1024px) {
  --content-inline-padding: \${smallPcPaddings};
}`,
  }),

  new VariableTemplate({
    snippetName: 'some name 3',
    message: chalk.cyan('Tablets...'),
    variableFilePath: styles.normalize,
    fields: [
      { name: 'tabletPaddings', initial: '5vw', },
    ],
    template:
      `
@media (426px <= width <= 769px) {
  --content-inline-padding: \${tabletPaddings};
}`,
  }),

  new VariableTemplate({
    snippetName: 'some name 4',
    message: chalk.cyan('Mobiles...'),
    variableFilePath: styles.normalize,
    fields: [
      { name: 'mobilePaddings', initial: '3vw', },
    ],
    template:
      `
@media (width <= 426px) {
  --content-inline-padding: \${mobilePaddings};
}`,
  }),
)


deleteUnnecessaryFilesAndFolders()

writeCompletelyPhrase()



async function includeModuleByQuestion(title, ...moduleObjects) {
  let selectedModules = await enquirer.multiselect({
    name: 'value',
    message: chalk.greenBright(title),
    limit: 5,
    choices: moduleObjects.map(module => {
      return {
        name: module.moduleName, value: module.moduleName,
      }
    }),

    footer: () => chalk.gray.italic('use ↑ and ↓ to switch, you can "scroll" this list')
  })


  for (let module of moduleObjects) {
    let confirmedModuleName = selectedModules.find(answer => answer == module.moduleName)

    if (confirmedModuleName) {
      replaceHtmlConnectionString(module.htmlConnectStrings, 'false', 'true')
      continue
    }

    if (!Array.isArray(module.filesAndFolders))
      module.filesAndFolders = new Array(module.filesAndFolders)

    for (let fileOrFolder of module.filesAndFolders) {
      fs.removeSync(fileOrFolder)
    }

    replaceHtmlConnectionString(module.htmlConnectStrings)
  }
}
async function setVariables(...variableTemplates) {
  for (let variableTemplate of variableTemplates) {
    let result = await enquirer.snippet({
      name: variableTemplate.snippetName,
      message: variableTemplate.message + '\n',
      required: true,
      fields: variableTemplate.fields,
      template: variableTemplate.template,

      footer: () => chalk.gray.italic("use tab to move, when you're done, press enter")
    })

    let formattedTemplate = replaceEnquirerTemplateValues(
      variableTemplate.template,
      variableTemplate.fields,
      result.values,
      true
    )
    let newTemplate = replaceEnquirerTemplateValues(
      variableTemplate.template,
      variableTemplate.fields,
      result.values
    )

    let templateStrings = formattedTemplate.split('\n')
    let newTemplateStrings = newTemplate.split('\n')

    for (let i = 0; i < templateStrings.length; i++) {
      await replace({
        files: variableTemplate.variableFilePath,
        from: templateStrings[i],
        to: newTemplateStrings[i],
      })
    }
  }
}
async function setMainFont() {
  await enquirer.toggle({
    message: chalk.italic(`Now i will analyze your folder ${chalk.underline.yellow(paths.src.fontsFolder)}, make sure that you have added font files there.\n`),
    enabled: chalk.greenBright(
      `I added the font files to this folder.`
    ),
    disabled: chalk.greenBright(
      `I added the font files to this folder.`
    ),
  })

  let filesInSources = fs.readdirSync(paths.src.fontsFolder)

  if (filesInSources.indexOf('.gitkeep') != -1) {
    filesInSources.splice(filesInSources.indexOf('.gitkeep'), 1)
  }

  for (let i = 0; i < filesInSources.length; i++) {
    filesInSources[i] +=
      chalk.magenta(` (as ${filesInSources[i].split('-')[0]})`)
  }

  if (filesInSources?.length <= 0) return

  let selectedFont = await enquirer.select({
    name: 'set font',
    message: 'Select the font that will be preloaded, and it will also be in the --main-font-family variable.' + '\n',
    required: true,
    choices: filesInSources,

    footer: () => chalk.gray.italic("use ↑↓ to move, when you're done, press enter")
  })

  replace.sync({
    files: styles.normalize,
    from: `--main-font-family: arial;`,
    to: `--main-font-family: '${selectedFont.split('-')[0]}'; `,
  })
  replace.sync({
    files: html.layout,
    from: `href="./fonts/your_preloadedFontName.woff2"`,
    to: `href="./fonts/${selectedFont.split('.')[0]}.woff2"`,
  })
}

function deleteUnnecessaryFilesAndFolders() {
  deleteFolder(readmeFolder, 'The readme folder have been deleted.')
  deleteFolder(readmeFilePath)
  fs.createFileSync('README.md')

  log(chalk.gray.italic('✅ The readme file are clean.'))

  deleteFolder(distFolderName, 'Dist have been deleted.')
  deleteFolder(snippetsFolderName, 'Snippets have been deleted.')
  deleteFolder(fontsGitkeep, 'Gitkeep in fonts have been deleted.')

  if (fs.readdirSync(assets).length == 0)
    deleteFolder(assets, 'Assets have been deleted.')
}

function replaceHtmlConnectionString(htmlConnectStrings, replacedValue, replacedNewValue) {
  if (!htmlConnectStrings) return

  if (!Array.isArray(htmlConnectStrings))
    htmlConnectStrings = new Array(htmlConnectStrings)

  for (let htmlConnectStringData of htmlConnectStrings) {
    if (!htmlConnectStringData.path)
      htmlConnectStringData.path = html.index

    let newHtmlConnectString

    if (!replacedValue || !replacedNewValue) {
      newHtmlConnectString = ''
    } else {
      newHtmlConnectString = htmlConnectStringData.strings.replace(replacedValue, replacedNewValue)
    }

    replace.sync({
      files: htmlConnectStringData.path,
      from: htmlConnectStringData.strings, to: newHtmlConnectString,
    })
  }
}
function deleteFolder(folderPath, messageOnSuccessful) {
  try {
    fs.removeSync(folderPath)

    if (messageOnSuccessful)
      log(chalk.gray.italic('✅ ' + messageOnSuccessful))
  }
  catch (error) {
    log(chalk.red('❌ ' + error))
  }
}
function replaceEnquirerTemplateValues(template, fields, values, replaceNamesToDefaults) {
  let newTemplate = template

  if (replaceNamesToDefaults) {
    for (let field of fields) {
      newTemplate = newTemplate.replaceAll(
        '${' + field.name + '}',
        field.initial ?? ''
      )
    }
  }
  else {
    for (let field of fields) {
      newTemplate = newTemplate.replaceAll(
        '${' + field.name + '}',
        values[field.name] ?? field.initial
      )
    }
  }

  return newTemplate
}
function logSomeImportantInConsole(message, chalkColor) {
  log(chalkColor(message))
}

function writeCompletelyPhrase() {
  let
    topPhrase = 'The setup is completely complete!',
    middlePhrase = 'I wish You a successful job.',
    bottomPhrase = '🎆🎆🎆',

    positionOfTop = Math.round(process.stdout.columns / 2) - Math.round(topPhrase.length / 2),
    positionOfMiddle = Math.round(process.stdout.columns / 2) - Math.round(middlePhrase.length / 2),
    positionOfBottom = Math.round(process.stdout.columns / 2) - Math.round(bottomPhrase.length / 2)

  topPhrase = ' '.repeat(positionOfTop) + topPhrase
  middlePhrase = ' '.repeat(positionOfMiddle) + middlePhrase
  bottomPhrase = ' '.repeat(positionOfBottom) + bottomPhrase

  logSomeImportantInConsole(
    '\n'
    + topPhrase + '\n'
    + middlePhrase + '\n'
    + bottomPhrase + '\n'

    , chalk.greenBright
  )

  // An empty line to correct one error in the visualization
  console.log('')
}