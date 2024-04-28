import { webfont } from "webfont";
import * as fs from 'fs'
import template from 'lodash.template'
import { getPackageDir, getPackageJson, getAliases, types, asyncForEach, toPascalCase } from '../../../.build/helpers.mjs'

const formats = ['ttf', 'woff', 'woff2']
const p = getPackageJson()
const DIR = getPackageDir('icons-webfont')
const fontHeight = 1000

const aliases = getAliases(true)

fs.mkdirSync(`${DIR}/dist/fonts`, { recursive: true })

types.push('all')

const getAlliasesFlat = () => {
  let allAliases = {}

  Object.entries(aliases).forEach(([type, aliases]) => {
    Object.entries(aliases).forEach(([from, to]) => {
      allAliases[`${from}${type !== 'outline' ? `-${type}` : ''}`] = `${to}${type !== 'outline' ? `-${type}` : ''}`
    })
  })

  return allAliases
}

const camelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/[\s\-_]+/g, '');
}

asyncForEach(types, async type => {
  console.log(`Building webfont for ${type} icons`)

  await webfont({
    files: `icons-outlined/${type}/*.svg`,
    fontName: 'tabler-icons',
    prependUnicode: true,
    formats,
    normalize: true,
    fontHeight,
    descent: 100,
    ascent: 900,
    fixedWidth: false
  })
    .then((result) => {
      formats.forEach(format => {
        fs.writeFileSync(`${DIR}/dist/fonts/tabler-icons${type !== 'all' ? `-${type}` : ''}.${format}`, result[format])
      })

      const glyphs = result.glyphsData
        .map(icon => icon.metadata)
        .sort(function (a, b) {
          return ('' + a.name).localeCompare(b.name)
        })

      const options = {
        name: `Tabler Icons${type !== 'all' ? ` ${toPascalCase(type)}` : ''}`,
        fileName: `tabler-icons${type !== 'all' ? `-${type}` : ''}`,
        glyphs,
        v: p.version,
        aliases: (type === 'all' ? getAlliasesFlat() : aliases[type]) || {}
      }

      //scss
      const compiled = template(fs.readFileSync(`${DIR}/.build/iconfont.scss`).toString())
      const resultSCSS = compiled(options)
      fs.writeFileSync(`${DIR}/dist/tabler-icons${type !== 'all' ? `-${type}` : ''}.scss`, resultSCSS)

      //swift
      const compiledSwift = template(fs.readFileSync(`${DIR}/.build/iconfont.swift`).toString(), { 'imports': { 'camelCase': camelCase } })
      const resultSwift = compiledSwift(options)
      fs.writeFileSync(`${DIR}/dist/tabler-icons${type !== 'all' ? `-${type}` : ''}.swift`, resultSwift)

      //html
      const compiledHtml = template(fs.readFileSync(`${DIR}/.build/iconfont.html`).toString())
      const resultHtml = compiledHtml(options)
      fs.writeFileSync(`${DIR}/dist/tabler-icons${type !== 'all' ? `-${type}` : ''}.html`, resultHtml)
    })
    .catch((error) => {
      throw error;
    });
})
