/* eslint-disable n/prefer-global/process */
import { mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import webpack from 'webpack'
import Lingui from '../src/webpack'
import type { LinguiPluginOptions } from '../src/index'

export interface BuildResult {
  loadBundle: () => Promise<any>
  stats: webpack.StatsCompilation
}

export async function build(
  entryPoint: string,
  loaderOptions: LinguiPluginOptions = {},
): Promise<BuildResult> {
  // set cwd() to working path
  const oldCwd = process.cwd()

  process.chdir(path.dirname(entryPoint))

  const compiler = getCompiler(entryPoint, loaderOptions)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      process.chdir(oldCwd)

      if (err) {
        return reject(err)
      }

      const jsonStats = stats!.toJson()
      compiler.close(() => {
        resolve({
          loadBundle: () =>
            import(path.join(jsonStats.outputPath!, 'bundle.js')),
          stats: jsonStats,
        })
      })
    })
  })
}

export function watch(
  entryPoint: string,
  loaderOptions: LinguiPluginOptions = {},
) {
  // set cwd() to working path
  const oldCwd = process.cwd()
  process.chdir(path.dirname(entryPoint))
  const compiler = getCompiler(entryPoint, loaderOptions)

  let deferred = createDeferred<webpack.StatsCompilation>()

  const watching = compiler.watch({}, async (err, stats) => {
    err ? deferred.reject(err) : deferred.resolve(stats!.toJson())
    deferred = createDeferred<any>()
  })

  return {
    build: async (): Promise<BuildResult> => {
      process.chdir(path.dirname(entryPoint))
      const stats = (await deferred.promise)!

      return {
        loadBundle: () => import(path.join(stats.outputPath!, 'bundle.js')),
        stats,
      }
    },
    stop: () =>
      new Promise((resolve) => {
        watching.close(resolve)
        process.chdir(oldCwd)
      }),
  }
}

export function getCompiler(
  entryPoint: string,
  loaderOptions: LinguiPluginOptions,
) {
  return webpack({
    mode: 'development',
    target: 'node',
    entry: entryPoint,
    plugins: [Lingui(loaderOptions)],
    output: {
      path: mkdtempSync(path.join(os.tmpdir(), `lingui-test-${process.pid}`)),
      filename: 'bundle.js',
      libraryTarget: 'commonjs',
    },
  })!
}

function createDeferred<T>() {
  let deferred: {
    resolve: (r: T) => void
    reject: (err: any) => void
    promise: Promise<T>
  }

  const promise = new Promise<T>((resolve, reject) => {
    deferred = { resolve, reject, promise: undefined as any }
  })

  return { ...deferred!, promise }
}
