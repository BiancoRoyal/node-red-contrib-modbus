const { writeFileSync, existsSync } = require('fs')

const packagePath = './package.json'
if (!existsSync(packagePath)) {
  console.error('Does not contain a package.json file')
  process.exit(1)
}
const packageJson = require(packagePath)

if (packageJson.publishConfig.registry) {
  packageJson.publishConfig.registry = 'https://packages.iniationware.com/api/packages/p4nr-nodejs-ci/npm/'

  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), { encoding: 'utf8', flag: 'w' })
}
