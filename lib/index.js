const url = require('url')
const { request } = require('urllib')
const semver = require('semver')
const camelCase = require('lodash.camelcase')

const NPM_REGISTRY = 'http://registry.npmjs.org/'

class NpmPackage {
  static fromRemote(packageName, registry = NPM_REGISTRY) {
    return request(url.resolve(registry, packageName), {
      dataType: 'json'
    }).then(({ status, data }) => {
      if (status != '200') {
        throw new Error(`Package '${packageName}' not found`)
      }

      return new NpmPackage(data, registry)
    })
  }

  constructor(info, registry) {
    this.registry = registry

    this._pickProperties(info)
    this._setLatest()
  }

  // ============================== public ==================================

  getInfoByDistTag(distTag) {
    if (this.distTags && this.distTags[distTag]) {
      return this.getInfoByVersion(this.distTags[distTag])
    }

    throw new Error(`Package '${this.name}' do not have dist-tag ${distTag}`)
  }

  getInfoByVersion(ver) {
    if (this.versions && this.versions[ver]) {
      return this.versions[ver]
    }

    throw new Error(`Package '${this.name}' do not have version ${ver}`)
  }

  getLatestInfoByMajorVer(majorVer) {
    const versions = Object.keys(this.versions).sort(semver.compare).filter(ver => {
      return semver.major(ver) === majorVer
    })

    return versions[versions.length - 1]
  }

  getLatestVersionsByMajor() {
    return Object.keys(this.versions).sort(semver.compare).reduce((ret, ver) => {
      const majorVer = semver.major(ver)
      ret[majorVer] = ver
      
      return ret;
    }, {})
  }

  // ============================== private ==================================

  _pickProperties(info) {
    const attrs = [
      'name', 'description', 'dist-tags', 'versions', 'readme', 'homepage',
      'maintainers', 'time', 'author', 'repository', 'license', 'keywords'
    ]
    attrs.forEach(attr => {
      this[camelCase(attr)] = info[attr]
    })
  }

  _setLatest() {
    try {
      this.latest = this.getInfoByDistTag('latest')
    } catch(e) {
      // do nothing
    }
  }
}

module.exports = NpmPackage
