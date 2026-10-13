/** @param {NS} ns */
export async function main(ns) {

const refreshRate = 2000;
let ownedServers = ns.cloud.getServerNames();
ns.ui.openTail();
while (true){

ns.clearLog();
ns.print("INFO: ==========================================");
for(let server of ownedServers){
  let serverRam = ns.getServerMaxRam(server);
  let upgradecost = ns.cloud.getServerUpgradeCost(server,serverRam*2);
  ns.disableLog("ALL");
  ns.print(`Server: ${server}. RAM: ${ns.format.number(serverRam)}B upgradecost: ${ns.format.number(upgradecost)}$`);
}
ns.print("INFO: ==========================================");
await ns.sleep(refreshRate);
}
}