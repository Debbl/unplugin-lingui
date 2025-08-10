/* eslint-disable n/prefer-global/process */
import fs from 'node:fs/promises'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { build, watch } from './compiler'

async function copyFixture(srcPath: string) {
  const fixturesDir = path.join(process.cwd(), '_fixtures')

  try {
    await fs.mkdir(fixturesDir, { recursive: true })
  } catch {}

  const fixtureTempPath = path.join(fixturesDir, `lingui-test-fixture`)

  await fs.cp(srcPath, path.join(fixturesDir, `lingui-test-fixture`), {
    recursive: true,
  })

  return fixtureTempPath
}

async function cleanupFixtures() {
  const fixturesDir = path.join(process.cwd(), '_fixtures')
  try {
    await fs.rm(fixturesDir, { recursive: true, force: true })
  } catch {}
}

describe('unplugin-lingui', () => {
  afterAll(async () => {
    await cleanupFixtures()
  })

  it('should compile catalog in po format', async () => {
    const built = await build(path.join(__dirname, 'po-format/entrypoint.js'))

    const data = await built.loadBundle()
    expect(built.stats.errors).toEqual([])
    expect(built.stats.warnings).toEqual([])

    expect((await data.load()).messages).toMatchSnapshot()
  })

  it('should compile catalog in json format', { todo: true }, async () => {
    const built = await build(
      path.join(__dirname, './json-format/entrypoint.js'),
    )

    expect(built.stats.errors).toEqual([])
    expect(built.stats.warnings).toEqual([])

    const data = await built.loadBundle()
    expect((await data.load()).messages).toMatchSnapshot()
  })

  it('should compile catalog with relative path with no warnings', async () => {
    const built = await build(
      path.join(__dirname, './relative-catalog-path/entrypoint.js'),
    )

    expect(built.stats.errors).toEqual([])
    expect(built.stats.warnings).toEqual([])

    const data = await built.loadBundle()
    expect((await data.load()).messages).toMatchSnapshot()
  })

  it("should throw an error when requested catalog don't belong to lingui config", async () => {
    const built = await build(
      path.join(__dirname, './not-known-catalog/entrypoint.js'),
    )

    expect(built.stats.errors![0].message).toContain(
      'is not matched to any of your catalogs paths',
    )
    expect(built.stats.warnings).toEqual([])
  })

  it('should report missing error when failOnMissing = true', async () => {
    const built = await build(
      path.join(__dirname, './fail-on-missing/entrypoint.js'),
      {
        failOnMissing: true,
      },
    )

    expect(built.stats.errors![0].message).toContain(
      'Missing 1 translation(s):',
    )
    expect(built.stats.warnings).toEqual([])
  })

  it('should NOT report missing messages for pseudo locale when failOnMissing = true', async () => {
    const built = await build(
      path.join(__dirname, './fail-on-missing-pseudo/entrypoint.js'),
      {
        failOnMissing: true,
      },
    )
    expect(built.stats.errors).toEqual([])
    expect(built.stats.warnings).toEqual([])
  })

  it('should fail build if there are message compilation errors when failOnCompileError = true', async () => {
    const built = await build(
      path.join(__dirname, './fail-on-compile-errors/entrypoint.js'),
      {
        failOnCompileError: true,
      },
    )
    expect(built.stats.errors![0].message).toContain(
      'Compilation error for 2 translation(s)',
    )
    expect(built.stats.warnings).toEqual([])
  })

  it('should NOT fail build if there are message compilation errors when failOnCompileError = false', async () => {
    const built = await build(
      path.join(__dirname, './fail-on-compile-errors/entrypoint.js'),
      {
        failOnCompileError: false,
      },
    )
    expect(built.stats.warnings![0].message).toContain(
      'Compilation error for 2 translation(s)',
    )
    expect(built.stats.errors).toEqual([])
  })

  it(
    'should trigger webpack recompile on catalog dependency change',
    {
      todo: true,
    },
    async () => {
      const fixtureTempPath = await copyFixture(
        path.join(__dirname, 'po-format'),
      )

      const watching = watch(path.join(fixtureTempPath, '/entrypoint.js'))

      const res = await watching.build()

      expect((await res.loadBundle().then((m) => m.load())).messages)
        .toMatchInlineSnapshot(`
      {
        "ED2Xk0": [
          "String from template",
        ],
        "mVmaLu": [
          "My name is ",
          [
            "name",
          ],
        ],
        "mY42CM": [
          "Hello World",
        ],
      }
    `)

      // change the dependency
      await fs.writeFile(
        path.join(fixtureTempPath, '/locale/messages.pot'),
        `msgid "Hello World"
msgstr ""

msgid "My name is {name}"
msgstr ""

msgid "String from template changes!"
msgstr ""
`,
      )

      const stats2 = await watching.build()

      expect((await stats2.loadBundle().then((m) => m.load())).messages)
        .toMatchInlineSnapshot(`
      {
        "ED2Xk0": [
          "String from template changes!",
        ],
        "mVmaLu": [
          "My name is ",
          [
            "name",
          ],
        ],
        "mY42CM": [
          "Hello World",
        ],
      }
    `)

      await watching.stop()
    },
  )
})
