import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  name: string
  version: string
  dsh?: { bundle?: { patch?: string }; client?: { platform?: string; inject?: string[] } }
  exports?: Record<string, unknown>
}
const client = readFileSync('client/client.js', 'utf8')

describe('package manifest', () => {
  it('declares the DSH bundle and client halves', () => {
    expect(pkg.name).toBe('dsh-workspace-tags')
    expect(pkg.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    expect(pkg.dsh?.client?.platform).toBe('web')
    expect(pkg.dsh?.client?.inject).toContain('@deepseek-ai/dsh-client-ui-slots')
    expect(pkg.dsh?.client?.inject).toContain('@deepseek-ai/dsh-client-locale')
    expect(pkg.exports?.['./client']).toBe('./client/client.js')
  })

  it('limits compatibility to the tested DSH line', () => {
    const engines = (pkg as { engines?: { dsh?: string } }).engines
    expect(engines?.dsh).toBe('>=0.2.1-rc.5 <0.3.0')
  })
})

describe('client bundle', () => {
  it('is the module-loader factory for this package', () => {
    expect(client.startsWith('window.__ModuleLoader__.load({')).toBe(true)
    expect(client).toContain('id: "dsh-workspace-tags"')
    expect(client.trimEnd().endsWith('});')).toBe(true)
    expect(client).toContain('return module.exports;')
  })

  it('requires only base modules the frozen table provides', () => {
    const required = new Set(Array.from(client.matchAll(/require\("([^"]+)"\)/gu), (match) => match[1]))
    expect(required).toEqual(new Set(['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives']))
    expect(client).not.toContain('require("node:')
  })
})

describe('host bundle', () => {
  it('imports no bare runtime package', () => {
    for (const file of readdirSync('lib')) {
      if (!file.endsWith('.js')) continue
      const source = readFileSync(`lib/${file}`, 'utf8')
      for (const match of source.matchAll(/from "([^"]+)"/gu)) {
        const specifier = match[1] ?? ''
        expect(specifier.startsWith('.'), `${file} imports ${specifier}`).toBe(true)
      }
    }
  })
})
