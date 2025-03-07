import * as fs from 'node:fs'
import template from 'lodash.template'
import { getPackageDir, getPackageJson, getAliases, types, asyncForEach, toPascalCase, toCamelCase } from '../../../.build/helpers.mjs'
import {buildSvgFont, loadSvgFiles} from "./build-utilities.mjs";
import svg2ttf from "svg2ttf";
import ttf2woff from "ttf2woff";
import wawoff2 from "wawoff2";

const p = getPackageJson()
const DIR = getPackageDir('icons-webfont')

const strokes = {
  200: 1,
  300: 1.5,
  400: 2,
}

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

for (const strokeName in strokes) {
  asyncForEach(types, async type => {
    console.log(`Building ${strokeName} webfont for ${type} icons`)

    const svgFiles = await loadSvgFiles(`icons-outlined/${strokeName}/${type}`);
    const svgFontFileSource = await buildSvgFont(svgFiles);
    const ttfFile = Buffer.from(svg2ttf(svgFontFileSource).buffer);
    const woffFile = Buffer.from(ttf2woff(ttfFile).buffer);
    const woff2File = await wawoff2.compress(ttfFile);

    const fileName = `tabler-icons${strokeName !== "400" ? `-${strokeName}` : ''}${type !== 'all' ? `-${type}` : ''}`;
    //fs.writeFileSync(`${DIR}/dist/fonts/${fileName}.svg`, svgFontFileSource); // for debug
    fs.writeFileSync(`${DIR}/dist/fonts/${fileName}.ttf`, ttfFile);
    fs.writeFileSync(`${DIR}/dist/fonts/${fileName}.woff`, woffFile);
    fs.writeFileSync(`${DIR}/dist/fonts/${fileName}.woff2`, woff2File);

    const glyphs = svgFiles.map(f => f.metadata)
      .sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })

    const currentAliases = (type === 'all' ? getAlliasesFlat() : aliases[type]) || {};
    const replacements = [
      ['123', 'oneTwoThree'],
      ['2fa', 'twoFa'],
      ['360', 'threeSixty'],
      ['12', 'twelve'],
      ['24', 'twentyFour'],
      ['3d', 'threeD'],
    ];

    const sanitizedAliases = Object.keys(currentAliases).reduce((r, v) => {
    if (!v[0].match(/[0-9]/)) {
        r[v] = currentAliases[v];
        return r;
    }

    let newKey = v;
    for (const [key, value] of replacements) {
        newKey = newKey.replace(key, value);
    }

    r[newKey] = currentAliases[v];
    return r;
    }, {});


    const options = {
      name: `Tabler Icons${type !== 'all' ? ` ${toPascalCase(type)}` : ''}`,
      fileName,
      glyphs,
      v: p.version,
      aliases: (type === 'all' ? getAlliasesFlat() : aliases[type]) || {},
      sanitizedAliases,
      forbiddenUnicodes: [
        'FFFE',
        'FFFF',
        '1FFFE',
        '1FFFF',
        '2FFFE',
        '2FFFF',
        '3FFFE',
        '3FFFF',
        '4FFFE',
        '4FFFF',
        '5FFFE',
        '5FFFF',
        '6FFFE',
        '6FFFF',
        '7FFFE',
        '7FFFF',
        '8FFFE',
        '8FFFF',
        '9FFFE',
        '9FFFF',
        'AFFFE',
        'AFFFF',
        'BFFFE',
        'BFFFF',
        'CFFFE',
        'CFFFF',
        'DFFFE',
        'DFFFF',
        'EFFFE',
        'EFFFF',
        'FFFFE',
        'FFFFF',
        '10FFFE',
        '10FFFF',
        'FDD0',
        'FDD1',
        'FDD2',
        'FDD3',
        'FDD4',
        'FDD5',
        'FDD6',
        'FDD7',
        'FDD8',
        'FDD9',
        'FDDA',
        'FDDB',
        'FDDC',
        'FDDD',
        'FDDE',
        'FDDF',
        'FDE0',
        'FDE1',
        'FDE2',
        'FDE3',
        'FDE4',
        'FDE5',
        'FDE6',
        'FDE7',
        'FDE8',
        'FDE9',
        'FDEA',
        'FDEB',
        'FDEC',
        'FDED',
        'FDEE',
        'FDEF',
    ],
    }

    //scss
    const compiled = template(fs.readFileSync(`${DIR}/.build/iconfont.scss`).toString())
    const resultSCSS = compiled(options)
    fs.writeFileSync(`${DIR}/dist/${fileName}.scss`, resultSCSS)

    //swift
    const compiledSwift = template(fs.readFileSync(`${DIR}/.build/iconfont.swift`).toString(), {
      imports: { toCamelCase: toCamelCase },
    });
    const resultSwift = compiledSwift(options);
    fs.writeFileSync(`${DIR}/dist/${fileName}.swift`, resultSwift)

    //html
    const compiledHtml = template(fs.readFileSync(`${DIR}/.build/iconfont.html`).toString())
    const resultHtml = compiledHtml(options)
    fs.writeFileSync(`${DIR}/dist/${fileName}.html`, resultHtml)
  })
}
