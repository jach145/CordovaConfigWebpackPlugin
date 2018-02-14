/* globals describe, it, describe, afterEach */
import { expect } from 'chai'
import et from 'elementtree'
const fs = require('fs')
const path = require('path')
const separator = path.sep

const CordovaConfigWebpackPlugin = require('./../lib/index')

const MockCompiler = {
  plugin: (signal, cb) => {
    'use strict'
    cb()
  },
  context: './test/helper'
}

const parseFile = () => {
  const filename = path.resolve(MockCompiler.context, 'config.xml')
  return new et.ElementTree(et.XML(fs.readFileSync(filename, 'utf-8').replace(/^\uFEFF/, '')))
}

const copyFileToTest = () => {
  const data = fs.readFileSync(`${MockCompiler.context}${separator}test-config.xml`, 'utf-8')
  fs.writeFileSync(`${MockCompiler.context}${separator}config.xml`, data)
}

const removeFileToTest = () => {
  fs.unlinkSync(`${MockCompiler.context}${separator}config.xml`)
}

describe('CordovaConfigWebpackPlugin specs: ', () => {
  'use strict'
  afterEach(() => {
    removeFileToTest()
  })
  beforeEach(() => {
    copyFileToTest()
  })
  it('Should modify content field in config.xml', () => {
    const fakeOptions = {
      content: {
        src: 'fake.html'
      },
      widget: {
        version: '1.0.0'
      },
      author: {
        email: 'fake@fake.com'
      },
      access: {
        origin: 'fakeorigin'
      }
    }
    const cordovaConfigWebpackPlugin = CordovaConfigWebpackPlugin(fakeOptions)
    cordovaConfigWebpackPlugin.apply(MockCompiler)
    expect(parseFile().getroot().attrib.version).to.equal(fakeOptions.widget.version)
    expect(parseFile().find('content[@src]').attrib.src).to.equal(fakeOptions.content.src)
    expect(parseFile().find('author[@email]').attrib.email).to.equal(fakeOptions.author.email)
    expect(parseFile().find('access[@origin]').attrib.origin).to.equal(fakeOptions.access.origin)
  })

  it('Should modify several attributes for each tag', () => {
    const fakeOptions = {
      widget: {
        id: 'testid',
        version: '1.1.0'
      },
      author: {
        email: 'test@email.com',
        href: 'test.com'
      }
    }
    const cordovaConfigWebpackPlugin = CordovaConfigWebpackPlugin(fakeOptions)
    cordovaConfigWebpackPlugin.apply(MockCompiler)
    expect(parseFile().getroot().attrib.id).to.equal(fakeOptions.widget.id)
    expect(parseFile().getroot().attrib.version).to.equal(fakeOptions.widget.version)
    expect(parseFile().find('author').attrib.email).to.equal(fakeOptions.author.email)
    expect(parseFile().find('author').attrib.href).to.equal(fakeOptions.author.href)
  })

  it('Should modify the content of tag', () => {
    const fakeOptions = {
      author: {
        email: 'test@email.com',
        text: 'author text'
      },
      name: {
        text: 'testtext'
      }
    }
    const cordovaConfigWebpackPlugin = CordovaConfigWebpackPlugin(fakeOptions)
    cordovaConfigWebpackPlugin.apply(MockCompiler)
    expect(parseFile().find('author').attrib.email).to.equal(fakeOptions.author.email)
    expect(parseFile().find('author').text).to.equal(fakeOptions.author.text)
    expect(parseFile().find('name').text).to.equal(fakeOptions.name.text)
  })

  it('Should launch error if not found field in config.xml', () => {
    const fakeOptions = {
      fake: {
        origin: 'fakeorigin'
      }
    }
    let err = false
    try {
      const cordovaConfigWebpackPlugin = CordovaConfigWebpackPlugin(fakeOptions)
      cordovaConfigWebpackPlugin.apply(MockCompiler)
    } catch (e) {
      err = true
    }
    expect(err).to.equal(true)
  })
})
