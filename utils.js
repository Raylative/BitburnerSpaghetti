export function crackPorts(ns, target) {
  const exeToFunction = {
    "BruteSSH.exe": ns.brutessh,
    "FTPCrack.exe": ns.ftpcrack,
    "relaySMTP.exe": ns.relaysmtp,
    "HTTPWorm.exe": ns.httpworm,
    "SQLInject.exe": ns.sqlinject
  }

  // Execute all Penetration Programs if possible
  for (let exeFunction in exeToFunction) {
    if (ns.fileExists(exeFunction, "home")) {
      let accordingHack = exeToFunction[exeFunction]
      accordingHack(target)
    }

  }
}
export function canExecuteScript (ns,server,scriptRam,useMax = false){
let maxRam = ns.getServerMaxRam(server);
let usedRam = ns.getServerUsedRam(server);
let ramAvailable = useMax ? maxRam : maxRam -usedRam;
return ramAvailable > scriptRam;
}
//soll true returnen wenn anzahol an crack die ich besitze >= anzahl der required cracks ist
//export function canPenetrate (ns,server){
//  let reqPorts = ns.getServer(server).numOpenPortsRequired
//  //anzahl
//  let cracks = getNumCracks()
//}

//hier eventuall um RAM zu safen Player einfach einmal vorher aufrufen und mitgeben.
export function getNodeInformation(ns, node) {
  //servertypestuff
  let server = ns.getServer(node);
  let maxMoney = server.moneyMax;
  let curMoney = server.moneyAvailable;
  let reqHackLevel = server.requiredHackingSkill;
  let sec = server.hackDifficulty;
  let minSec = server.minDifficulty;
  let moneyThresh = maxMoney * 0.75;
  let secThresh = minSec + 5;
  let reqPorts = server.numOpenPortsRequired;
  let hasRoot = server.hasAdminRights;
  let maxRam = server.maxRam;

  let player = ns.getPlayer();
  //formula stats:
  let hChance = ns.formulas.hacking.hackChance(node, player);


  let revYield = maxMoney * hChance;

  //TODO:
  //var strategy = getStrategy(ns,node)

  let nodeDetails = {
    node,
    maxMoney,
    maxRam,
    curMoney,
    reqHackLevel,
    sec,
    minSec,
    secThresh,
    moneyThresh,
    reqPorts,
    hasRoot,
    hChance,
    revYield,
  };

  //TODO STRATS VERTEILEN 



  return {

    /// ZODO TODO TODOZODO TODO TODOZODO TODO TODOZODO TODO TODOZODO TODO TODO

  }
}
export function getThresholds(ns, node) {
  let server = ns.getServer(node);
  let moneyThresh = server.moneyMax * 0.75;
  let secThresh = server.minDifficulty + 5;
  return { moneyThresh, secThresh };
}

function canHack(ns, server) {
  let playersHackingLevel = ns.getHackingLevel()
  let serverHackLevelRequired = ns.getServerRequiredHackingLevel(server)
  return playersHackingLevel >= serverHackLevelRequired
}


// return a list of all Networknodes // refactor: Return an array of ServerObjects with fields
export function getServerList(ns) {
  let queue = ["home"]
  let visitedServers = new Set(["home"])

  while (queue.length > 0) {
    let currentServerToScan = queue.shift();
    let currentServersNeighbours = ns.scan(currentServerToScan);

    for (const currentNeighbor of currentServersNeighbours) {
      if (!visitedServers.has(currentNeighbor)) {
        visitedServers.add(currentNeighbor);
        queue.push(currentNeighbor);
      }
    }
  }
  //remove Home from list cause we dont need it.(for now) this shouldnt be deleted here
  //this actually should be decided in the function the list was requested for the specific case
  visitedServers.delete("home")
  return [...visitedServers]
}
//returns a value for given server. the higher the better the earning per time. 
//this seems to not work properly. solution till we use hack formulas
//TODO:
//getHackworth wird zu RevYield in getNodeInformation damit wird die funktion unnötig. 
//WIRD ABER BEHALTEN WEGEN: entscheiden ob hackwoprth hier besser berechnet wir als revYield.
export function getHackWorth(ns, target) {
  let possibleMaxMoney = ns.getServerMaxMoney(target);
  let serversHackTime = ns.getHackTime(target);
  let serversHackChance = ns.hackAnalyzeChance(target);

  let percentStolenperThread = ns.hackAnalyze(target)
  let expectedMoneyPerHack = possibleMaxMoney * percentStolenperThread * serversHackChance;

  //berechnet nicht mit ein wie lange grow und weaken braucht. . . .
  //berechnet nicht die bereits hackenden scripte mit ein. . . 
  let hackWorth = expectedMoneyPerHack / (serversHackTime / 1000);

  return hackWorth
}
// runs get hackworth through a list abnd sorts the best rated to [0]
export function sortArrayofServers(ns, array) {
  array.sort((a, b) => getHackWorth(ns, b) - getHackWorth(ns, a))
}
//picks the best one 
export function getPotentialTargets(ns, serverList) {
  //Spread-Operator to make this idiotfriendly for myself.
  let serverArray = [...serverList];
  //filter out unhackable and servers without cash
  let candidates = serverArray.filter(server =>
    ns.getServerMaxMoney(server) > 0 && canHack(ns, server)&&ns.nuke(server));
  //exception catch of death:
  if (candidates.length === 0) { return null }
  //Sort that shit
  sortArrayofServers(ns, candidates);
  // return first in list:
  //ns.toast(`picking ${candidates[0]} with ${ns.format.number(getHackWorth(ns,candidates[0]))} potential $ per hack/ per thread`, "info", 10000)
  return candidates;
  //ende


}

// returns the number of maxThreads you can run given script on given server
export function getNumMaxThreadsForScript(ns, targetServer, scriptToExecute) {
  let targetServerRam = ns.getServerMaxRam(targetServer);
  let scriptRamRequirement = ns.getScriptRam(scriptToExecute, "home");//ist es richtig an "home" zu messen?
  let usedServerRam = ns.getServerUsedRam(targetServer)
  if (targetServerRam <= 0 || scriptRamRequirement <= 0) { return 0 }//exception auffangen
  let maxThreads = (targetServerRam - usedServerRam) / scriptRamRequirement;
  maxThreads = Math.floor(maxThreads);
  return maxThreads;
}


//==================== COLORSYSTEM =======================

const colorTable = {
  reset: "\u001b[0m",

  // Primärfarben
  red: "\u001b[31m",
  blue: "\u001b[34m",
  yellow: "\u001b[33m",
  green: "\u001b[92m",

  // Sekundär- und Mischfarben
  darkgreen: "\u001b[32m",
  orange: "\u001b;5;208m", // Hinweis: Bei manchen Systemen fehlt hier das '38' vor ';5;208m', falls es nicht lädt, nutze "\u001b[38;5;208m"
  violet: "\u001b[35m",
  pink: "\u001b[35;1m",

  // Nicht-Farben & Erdtöne
  black: "\u001b[30m",
  white: "\u001b[37m",
  brown: "\u001b[38;5;94m",
  gray: "\u001b[90m"
};
export function formatInColor(ns, string, color) {

  let prefix = colorTable[color]
  let postfix = colorTable["reset"]

  let formatted = `${prefix}${string}${postfix}`

  return formatted
}




//make a netReport of all Servers  WIP
export function printNetworkReport(ns, listOfServers) {
  let player = ns.getPlayer();
  let fileName = "network-report.txt"
  for (currentServer of listOfServers) {
    let serverName = currentServer

  }
}
/** @param {NS} ns */
export async function main(ns) {

}