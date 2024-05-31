const receive = (node, payload) => {
  node.receive('input', { payload: payload | 'defaultPayload' })
}

module.exports = receive
