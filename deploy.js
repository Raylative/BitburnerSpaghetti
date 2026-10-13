
//FUNCTIONS:

import { crackPorts,getServerList, getPotentialTargets, getNumMaxThreadsForScript,getHackWorth } from "./utils.js";


async function deployToServer(ns, target, script, targetedServer) {

  //TODO : REFACTOR THIS SHIT INTO ITS OWN HELPER METHOD IN UTILS 


  
  crackPorts(ns,target);
  //let openPortsRequired = ns.getServerNumPortsRequired(target)
  // nuke dann erst machen wenn mindest thread erfüllt ist sonnst nicht erst versuchen
  
  ns.nuke(target);
  //EXCEPTION CHECK 
  if (!ns.hasRootAccess(target)) {
    ns.print(`WARN: fuck, still no Root Access to ${target}, this shouldnt happen`)
    return;
  }
  // copy script to target
  ns.scp(script, target, "home");

  //calculate the ammount of maximal threads of this script the
  // serve can handle
  let maxThreads = getNumMaxThreadsForScript(ns, target, script);
  
  //dont try running if no ram at all
  if (maxThreads < 1 || maxThreads === Infinity) {
    ns.print(`WARN: Holy fuck, Script's Ass so big, cant run on ${target} even once.`)
    return
  }
    if (maxThreads > 0) {
      //LETS GOOOOOOO Start the fucking attackooooo
      ns.exec(script, target, maxThreads, targetedServer)
    }

}

//MAIN LOOP:
/** @param {NS} ns */
export async function main(ns) {

  // script das er deployn soll
  let script = ns.args[0];
  //gewünschter Server auf den es deployed werden soll 
  let targetedServer = ns.args[1] ?? null;
  //wenn kein ziel gegeben nutze autoTargeting
  let autoTargetMode = false;
   let autoTargetIndex = 0
  if (targetedServer === null) autoTargetMode = true;


  //verteiler methode kann weg bald.....
  let hostsAssignedtoCurrentTarget = 0;
  let maxHostsPerTarget = 15

  //get a list of all servers.sort it, filter stuff out
  let allServers = getServerList(ns);
  let sortedCandidates = []
  if (autoTargetMode) {
  sortedCandidates = getPotentialTargets(ns,allServers)
  
  }

  for (let currentServer of allServers) {
    if (currentServer === "home") continue;

    //Wenn no target given, search for best target. 
    if (autoTargetMode) {
      //target is best in list:
      targetedServer = sortedCandidates[autoTargetIndex]
      //
      if (hostsAssignedtoCurrentTarget >= maxHostsPerTarget) {
      ns.toast(` ${targetedServer} with ${ns.format.number(getHackWorth(ns,targetedServer))} (pot$/ hack/ thread) gets attacked by ${hostsAssignedtoCurrentTarget} assigned hosts`, "info", 3500)
        
        // TODO NEWTARGET DEFINIEREN
        autoTargetIndex++;
        hostsAssignedtoCurrentTarget = 0
        //wenn index höher is als anzahl aller server einfach wieder den besten wählen:
        if (autoTargetIndex >= sortedCandidates.length){autoTargetIndex=0}
      }
      hostsAssignedtoCurrentTarget++
    }

    ns.print(`DEBUG: currentServer=${currentServer} attacks target: ${targetedServer}, hasRoot=${ns.hasRootAccess(currentServer)}`)
    await deployToServer(ns, currentServer, script, targetedServer)
    await ns.sleep(200)
  }

}
