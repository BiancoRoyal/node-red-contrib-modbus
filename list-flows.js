const fs = require('fs')
const path = require('path')

const flows = {}

// Recursive function to read subfolders and files
function readSubfoldersAndFiles (directory) {
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join('./', directory, file)
    if (fs.lstatSync(fullPath).isDirectory()) {
      readSubfoldersAndFiles(fullPath)
    } else {
      if (path.extname(fullPath) === '.js' && fullPath.indexOf('flows') !== -1) {
        flows[fullPath] = require('./' + fullPath)
      }
    }
  })
}

// convert Object to JSON formatted string
function formatJSON (obj) {
  for (const data in obj) {
    obj[data] = JSON.parse(JSON.stringify(obj[data]))
  }
  return obj
}

readSubfoldersAndFiles('./test')
// console.log(flows);

for (const flowEntry in flows) {
  console.log(flowEntry)
  const flowData = require('./' + flowEntry)

  for (const flow in flowData) {
    flowData[flow] = formatJSON(flowData[flow])
  }

  // console.log(flowData);
}

// console.log(flows);
