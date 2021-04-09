const fs = require('fs')
const path = require('path')

function getSavedContractAddresses() {
    let json
    try {
        json = fs.readFileSync(path.join(__dirname, `../contract-addresses.json`))
    } catch (err) {
        json = '{}'
    }
    return JSON.parse(json)
}

function saveContractAddress(network, contract, address, abi) {
    const addrs = getSavedContractAddresses()
    addrs[network] = addrs[network] || {}
    const config = {
        'address' : address,
        'abi' : abi
    }
    addrs[network][contract] = config;
    fs.writeFileSync(path.join(__dirname, `../contract-addresses.json`), JSON.stringify(addrs, null, '    '))
}


module.exports = {
    getSavedContractAddresses,
    saveContractAddress
}
