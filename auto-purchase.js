import {getPotentialTargets,getServerList} from "./utils.js"

/** @param {NS} ns */
export async function main(ns) {


  let target = getPotentialTargets(ns,getServerList(ns))[0] // 
  const homeserver = "home";
  let pRam = 8; //purchasedRam
  const serverPrefix = "ps-";

  let maxRam = ns.cloud.getRamLimit()
  var maxServers = ns.cloud.getServerLimit()


  const virus = "basic.js"
  const virusRam = ns.getScriptRam(virus)

  function canPurchaseServer() {
    return ns.getPlayer().money > ns.cloud.getServerCost(pRam)
  }

  function killVirus(server) {
    if (ns.scriptRunning(virus, server)) {
      ns.scriptKill(virus, server);
    }
  }


  async function copyAndRunVirus(server) {
    ns.print(`Copying ${virus} to: ${server}`);
    await ns.scp(virus, server);
    killVirus(server);
    let maxThreads = Math.floor(ns.getServerMaxRam(server) / virusRam);
    
    ns.exec(virus, server, maxThreads, target);
  }


  //upgrade Server (server) 
  //sRam = ns.getServrerMaxRam(server)
  //wenn: sRam kleiner als pRam 
  //solange nicht canPurchaseServer(): {sleepen 10 secunden }
  //shutdownServer(server)
  //glaube ich brauch das alles nicht .... hat sich mittlerweile gändert
  // übersetzt sich zu solange du nicht das geld nicht reicht warten sonnst um pRam erweitern


  async function autoUpgradeServers() {
    let i = 0;
    while (i < maxServers) {
      var server = serverPrefix + i;
      if (ns.serverExists(server)) {
        let currentRam = ns.getServerMaxRam(server);
        if (currentRam < pRam) {
          ns.print(`Upgrading ${server} to ${pRam} GB `);
          while (!ns.cloud.upgradeServer(server, pRam)) {
            let cost = ns.cloud.getServerUpgradeCost(server,pRam)
            ns.print(`WARN: tried purchasing ${ns.format.number(pRam)}B but it costs${ns.format.number(cost)}$`) 
            ns.print(`WARN: Need ${ns.format.number(cost-(ns.getPlayer().money))} $ more`) 
            await ns.sleep(10000) 
            };
          await copyAndRunVirus(server);
        }
        ++i
      }
      else if (canPurchaseServer()) {
        ns.print(`Purchasing ${server} with ${pRam} GB`);
        ns.cloud.purchaseServer(server, pRam);
        await copyAndRunVirus(server);
        ++i;
      }
      else await ns.sleep(1000)
    }
  }


  while (true) {
    await autoUpgradeServers();
    if (pRam === maxRam) { break; }
    let newRam = pRam * 2;
    if (newRam > maxRam) { pRam = maxRam; }
    else { pRam = newRam; }

  }

}