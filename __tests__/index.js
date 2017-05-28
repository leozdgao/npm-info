const NpmPackage = require('../lib')

test('Get npm package info from remote', () => {
  return NpmPackage.fromRemote('react').then((pkg) => {
    expect(pkg.name).toBe('react')
    expect(Object.keys(pkg.distTags).length).toBeGreaterThan(0)
  })
})

test('Get npm package info through specified version', () => {
  return NpmPackage.fromRemote('react').then((pkg) => {
    const ver = pkg.distTags['latest']
    expect(pkg.getInfoByVersion(ver).version).toEqual(pkg.getInfoByDistTag('latest').version)
  })
})
