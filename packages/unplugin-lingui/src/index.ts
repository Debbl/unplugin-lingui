import path from 'node:path'
import {
  createCompilationErrorMessage,
  createCompiledCatalog,
  createMissingErrorMessage,
  getCatalogDependentFiles,
  getCatalogForFile,
  getCatalogs,
} from '@lingui/cli/api'
import { getConfig } from '@lingui/conf'
import { createUnplugin } from 'unplugin'

export interface LinguiPluginOptions {
  cwd?: string
  configPath?: string
  skipValidation?: boolean

  /**
   * If true would fail compilation on missing translations
   */
  failOnMissing?: boolean

  /**
   * If true would fail compilation on message compilation errors
   */
  failOnCompileError?: boolean
}

export const unpluginFactory = createUnplugin<LinguiPluginOptions | undefined>(
  ({ failOnMissing, failOnCompileError, ...linguiConfig } = {}) => {
    const config = getConfig(linguiConfig)
    const formatToExtensionMap = {
      'po': 'po',
      'po-gettext': 'po',
      'minimal': 'json',
      'lingui': 'json',
      'csv': 'csv',
    }
    const catalogFormat = config.format

    const catalogExtension =
      typeof catalogFormat === 'string'
        ? formatToExtensionMap[catalogFormat]
        : catalogFormat?.catalogExtension
    const fileExtension = catalogExtension?.startsWith('.')
      ? catalogExtension.slice(1)
      : catalogExtension

    if (!fileExtension) {
      throw new Error('catalogExtension is not set')
    }

    return {
      name: 'unplugin-lingui',
      transform: {
        filter: {
          id: new RegExp(`(\\.${fileExtension}|\\?lingui)$`),
        },
        async handler(code, id) {
          if (!config.rootDir) {
            throw new Error('rootDir is not set')
          }

          const catalogRelativePath = path.relative(config.rootDir, id)

          const fileCatalog = getCatalogForFile(
            catalogRelativePath,
            await getCatalogs(config),
          )

          if (!fileCatalog) {
            throw new Error(
              `Requested resource ${catalogRelativePath} is not matched to any of your catalogs paths specified in "lingui.config".

Resource: ${id}

Your catalogs:
${config.catalogs!.map((c) => c.path).join('\n')}
Please check that catalogs.path is filled properly.\n`,
            )
          }

          const { locale, catalog } = fileCatalog
          const dependency = await getCatalogDependentFiles(catalog, locale)
          dependency.forEach((file) => this.addWatchFile(file))

          const { messages, missing: missingMessages } =
            await catalog.getTranslations(locale, {
              fallbackLocales: config.fallbackLocales!,
              sourceLocale: config.sourceLocale!,
            })

          if (
            failOnMissing &&
            locale !== config.pseudoLocale &&
            missingMessages.length > 0
          ) {
            const message = createMissingErrorMessage(
              locale,
              missingMessages,
              'loader',
            )
            throw new Error(
              `${message}\nYou see this error because \`failOnMissing=true\` in Vite Plugin configuration.`,
            )
          }

          const { source: compiledCode, errors } = createCompiledCatalog(
            locale,
            messages,
            {
              namespace: fileExtension === 'json' ? 'json' : 'es',
              pseudoLocale: config.pseudoLocale,
            },
          )

          if (errors.length) {
            const message = createCompilationErrorMessage(locale, errors)

            if (failOnCompileError) {
              throw new Error(
                `${
                  message
                }These errors fail build because \`failOnCompileError=true\` in Lingui Vite plugin configuration.`,
              )
            } else {
              this.warn(
                `${
                  message
                }You can fail the build on these errors by setting \`failOnCompileError=true\` in Lingui Vite Plugin configuration.`,
              )
            }
          }

          return {
            code: compiledCode,
            map: null, // provide source map if available
          }
        },
      },
    }
  },
)
