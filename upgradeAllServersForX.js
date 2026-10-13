/** @param {NS} ns */
export async function main(ns) {

let amount = 8*(2**ns.args[0])

for (let server of ns.cloud.getServerNames()){
ns.cloud.upgradeServer(server,amount)
}
}