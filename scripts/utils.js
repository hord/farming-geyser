const fs = require('fs')
const path = require('path')

function getSavedContractAddresses() {
    let json
    try {
        json = fs.readFileSync(path.join(__dirname, `../deployments/contract-addresses.json`))
    } catch (err) {
        json = '{}'
    }
    return JSON.parse(json)
}

function saveContractAddress(network, contract, address) {
    const addrs = getSavedContractAddresses()
    addrs[network] = addrs[network] || {}
    addrs[network][contract] = address
    fs.writeFileSync(path.join(__dirname, `../deployments/contract-addresses.json`), JSON.stringify(addrs, null, '    '))
}

function getSavedContractAbis(env) {
    if(!env) {
        env = 'local'
    }
    let json
    try {
        json = fs.readFileSync(path.join(__dirname, `../deployments/contract-abis.json`))
    } catch (err) {
        json = '{}'
    }
    return JSON.parse(json[env])
}

function saveContractAbis(network, contract, bytecode, env) {
    if(!env) {
        env = 'local'
    }
    const bytecodes = getSavedContractAbis()
    bytecodes[network] = bytecodes[network] || {}
    bytecodes[network][contract] = bytecode
    fs.writeFileSync(path.join(__dirname, `../deployments/contract-abis.json`), JSON.stringify(bytecodes, null, '    '))
}

module.exports = {
    getSavedContractAddresses,
    saveContractAddress,
    getSavedContractAbis,
    saveContractAbis
}
