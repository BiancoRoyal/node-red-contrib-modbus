const fs = require('fs')

const flow_title = 'modbus-write-flows-copy'
const path_to_flow = `./${flow_title}.js`

const flow = fs.readFileSync(path_to_flow)

if (flow instanceof Buffer) {
  const decoded_flow = flow.toString() 
} 


// const test_flows_obj = require(path_to_flow)
//
// const flows_array = Object.values(test_flows_obj)
//
// // TODO: replace duplicate flow ids
//
// // Check and replace duplicate flow Ids
// for (let i = 0; i < flows_array.length - 1; i++) {
//   let prev_id = flows_array[i][0].id
//
//   for (let j = i + 1; j < flows_array.length; j++) {
//     let cur_id = flows_array[j][0].id
//     const nodes = flows_array[j].slice(1)
//
//     if (prev_id == cur_id) {
//       const new_id = generateRandomId(cur_id.length)
//
//       // change cur_flow id
//       flows_array[j][0].id = new_id
//       // change 'z' prop values for all nodes in the flow
//
//       nodes.forEach(node => {
//         if (node.z) {
//           node.z = new_id
//         }
//       })
//     }
//   }
// }
//
// console.log(flows_array)


// TODO: CHECK FOR NODE IDS
// TODO: replace duplicate node ids + wire references
//  - check if node id is unique
// 	- yes
// 		- check next node id
// 	- no
// 		- generate new id
// 		- check if the node id is present in wires within the same flow
// 			- if yes, then replace the ids in wires also


// // get the current flow
// for (let i = 0; i < flows_array.length; i++ ) {
//   const cur_flow = flows_array[i]
//   for (let j = 0; j < cur_flow.length - 1; j++) {
//     const node_id = cur_flow[j].id;
//     const duplicate_id_node = searchNodeIdInAllFlows(node_id, cur_flow.slice(j + 1))
//     // search in all flows
//     // do not search in current flow
//     // 
//   }
// }
//
// // search in flows to the right
// function searchNodeIdInAllFlows(node_id, flows) {
//     for (let flow of flows) {
//       for (let node of flow) {
//         searchNodeIdInFlow(node.id, flow)
//     } 
//   }
// }
//
// function searchNodeIdInFlow(node_id, nodes) {
//   // get the cur node
//   for (let i = 0; i < nodes.length; i++) {
//     const cur_node = nodes[i];
//
//     if (cur_node.id == node_id) {
//       console.log("Found duplicate node ids")
//       return cur_node
//     }
//   }
// }


function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


