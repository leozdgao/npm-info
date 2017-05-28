const url = require('url')
const { request } = require('urllib')
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
  }

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

  _pickProperties(info) {
    const attrs = [
      'name', 'description', 'dist-tags', 'versions', 'readme', 'homepage',
      'maintainers', 'time', 'author', 'repository', 'license', 'keywords'
    ]
    attrs.forEach(attr => {
      this[camelCase(attr)] = info[attr]
    })
  }
}

module.exports = NpmPackage
