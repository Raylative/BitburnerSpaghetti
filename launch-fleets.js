import { getPotentialTargets, getServerList, getThresholds, canExecuteScript, crackPorts } from "./utils.js";
import { getStrategy } from "./find-targets.js"

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  let player = ns.getPlayer();
  let homeServ = ns.getHostname();
  let attackDelay = 50; // time (ms)

  const virus = "pirate.js";
  let virusRam = ns.getScriptRam(virus);

  let actions = {
    w: 'weaken',
    h: 'hack',
    g: 'grow',
  }

  function getShips(ns) {
    let nodes = getServerList(ns);
    //alle ports cracken wo geht und damit auf meine anweisungen vorbereiten
    for (let node of nodes) { crackPorts(ns, node); }

    //filter out server without access or Server that cant run the script (anymore)
    let servers = nodes.filter(node => {
      if (node === homeServ) { return false; }
      return ns.nuke(node) && canExecuteScript(ns, node, virusRam);
    });
    //copythevirus over
    for (let serv of servers) { ns.scp(virus, serv, "home"); }
    //returne ne hashmap mit {servername:RestRam}
    return servers.reduce((acc, node) => {
      let maxRam = ns.getServerMaxRam(node);
      let curRam = ns.getServerUsedRam(node);
      acc[node] = maxRam - curRam;
      return acc;
    }, {});

  }



  function getDelayforActionsSeq(ns, seq, node) {
    let server = ns.getServer(node);
    let wTime = ns.formulas.hacking.weakenTime(server,player);
    let gTime = ns.formulas.hacking.growTime(server,player);
    let hTime = ns.formulas.hacking.hackTime(server,player);
    let timing = {
      w: wTime,
      g: gTime,
      h: hTime
    };
    const baseTimes = seq.map((_, i) => attackDelay * i);
    const actionStart = seq.map((action, i) => {
      const execTime = timing[action];
      return baseTimes[i] - execTime;
    });
    const execStart = Math.min(...actionStart);
    const delays = seq.map((_, i) => {
      return Math.abs(execStart - actionStart[i]);
    });
    return delays
  }

  function getMaxThreads(ns, node) {

    let { moneyThresh, secThresh } = getThresholds(ns, node);
    let currentMoney = ns.getServerMoneyAvailable(node)
    //grow calculation 
    let gThreads = 0;
    if (currentMoney < 1) { gThreads = 1; }
    else {
      let growMultiplier = moneyThresh / currentMoney;
      if (growMultiplier >= 1) {
        gThreads = Math.round(ns.growthAnalyze(node, growMultiplier));
      }
    }
    //weaken calculation 
    let wEffect = ns.weakenAnalyze(1); //how much sec is taken with one thread
    let currentSec = ns.getServerSecurityLevel(node);
    let wThreads = Math.round((currentSec - secThresh) / wEffect); //how many threads to reach secthresh
    // hack calculation 
    let hThreads = Math.round(ns.hackAnalyzeThreads(node, currentMoney));
    return {
      grow: gThreads,
      weaken: wThreads,
      hack: hThreads,
      total: gThreads + wThreads + hThreads
    };
  }
  function getRequirements(ns, node) {
    let strategy = getStrategy(ns, node);
    let delays = getDelayforActionsSeq(ns, strategy.seq, node);
    let maxThreads = getMaxThreads(ns, node);
    return {
      delays,
      maxThreads,
      strategy
    };

  }

  function getTotalThreads(servers) {
    return Object.values(servers).reduce((sum, nodeRam) => {
      let threads = Math.floor(nodeRam / virusRam);
      sum += threads;
      return sum;

    },0);
  }

  function getAllocation(reqs, ships) {

    let totalThreads = getTotalThreads(ships);
    let { maxThreads, strategy, } = reqs;

    ns.print("Total docked Threads:" + totalThreads)
    ns.print("Total required Threads:" + maxThreads.total)


    let numWeaken = 0;
    let numGrow = 0;
    let numHack = 0;
    if (maxThreads.total < totalThreads) {
      numWeaken = maxThreads.weaken;
      numGrow = maxThreads.grow;
      numHack = maxThreads.hack;
    } else {
      let { seq, allocation } = strategy;
      for (let i = 0; i < seq.length; i++) {
        let action = seq[i];
        let portion = allocation[i];
        if (action === 'w') {
          numWeaken = Math.floor(totalThreads * portion);
        }
        if (action === 'g') {
          numGrow = Math.floor(totalThreads * portion);
        } else {
          numHack = Math.floor(totalThreads * portion);
        }
      }
    }
    return {
      numWeaken,
      numGrow,
      numHack
    }

  }

  function readyFleets(reqs, contract, ships) {
    let { strategy, delays } = reqs;
    let { seq } = strategy;
    //allocate tasks to servers with largest ram first
    let sortedShips = Object.keys(ships).sort((a, b) => ships[b] - ships[a]);
    ns.print("==========Fleet Strategy==========");
    ns.print("Executing strategy: " + strategy.type);
    ns.print("Sequence: " + seq);
    ns.print("Delay: " + delays);

    let assigned = {};
    let fleets = [];
    for (let i = 0; i < seq.length; i++) {
      let delay = delays[i];
      let sym = seq[i]; //symbol
      let action = actions[sym];
      let maxThreads = contract[sym];
      let fleet = { action, ships: [] }
      let usedThreads = 0;
      for (let serv of sortedShips) {
        if (usedThreads >= maxThreads) { break; }// exceeded recomemnded ram
        if (assigned[serv]) { continue; }//ship already assigned 
        let ram = ships[serv];
        let maxExecThreads = Math.floor(ram / virusRam);
        let newUsedThreads = usedThreads + maxExecThreads;
        let threads = maxExecThreads;
        if (newUsedThreads > maxThreads) {
          threads = maxThreads - usedThreads; //only use the subset
        }
        usedThreads += threads;
        assigned[serv] = {
          used: threads,
          left: maxExecThreads - threads
        };

        fleet.ships.push({
          serv,
          threads,
          delay
        });

      }
      fleets.push(fleet);
    }
    return {
      fleets,
      assigned
    }
  }

  function createFleets(reqs, ships) {
    let { numWeaken, numGrow, numHack } = getAllocation(reqs, ships);
    ns.print('============Resource Allocation============');
    ns.print('Threads for weaken' + numWeaken);
    ns.print('Threads for grow' + numGrow);
    ns.print('Threads for hack' + numHack);
    let contract = {
      w: numWeaken,
      g: numGrow,
      h: numHack
    };
    return readyFleets(reqs, contract, ships);
  }

  //TODO PLAN :
  // was passiert in launch fleets ?? 
  // brainstorming:
  //  [Main Loop]
  // │
  // ├── 1. getShips()          -> Flotte einsammeln & Viren verteilen
  // ├── 2. getTargets()        -> Ziele nach Priorität sortieren
  // │
  // │   for target in targets:
  // ├── 3. getRequirements()   -> Threads & Timings berechnen
  // ├── 4. createFleets()      -> Server zuteilen (w/g/h)
  // ├── 5. exec()              -> Viren abfeuern
  // ├── 6. Bookkeeping         -> ships[serv] um verbrauchte RAM reduzieren
  // │                              (oder Server ganz aus ships löschen)
  // ├── 7. Early-Exit-Check    -> break, falls ships leer
  // │
  // └── 8. sleep(tick)         -> 1s warten, dann zurück zu Schritt 1
  let tick = 1000;
  while (true) {
    let ships = await getShips(ns);
    let availableShips = Object.keys(ships).length;
    if (availableShips === 0) {
      await ns.sleep(tick);
      continue;
    }
    let targets = getPotentialTargets(ns, getServerList(ns));
    for (let target of targets) {
      ns.print('Allocating resources for:' + target);
      let reqs = getRequirements(ns, target);
      ns.print('creating fleets. . . ');
      let { fleets, assigned } = createFleets(reqs, ships);
      ns.print("Setting Sail, YAARRRR!!")
      //SET SAIL!!!!
      for (let fleet of fleets) {
        let action = fleet.action;
        for (let ship of fleet.ships) {
          let pid = 0;
          while (ns.exec(virus, ship.serv, ship.threads, action, target, ship.delay, pid) === 0) {
            pid++
          }
          // TODO logShipAction(ship,action,targetNode);

        }

      }
      for (let ship of Object.keys(assigned)) {
        let usage = assigned[ship];
        if (usage.left <= 1) { delete ships[ship] } //useless if only one thread left
        else { ships[ship] = usage.left; }
      }
      if (Object.keys(ships).length <= 0) { break; } //exit if nothing left to assign
    }
    await ns.sleep(tick);
  }
}


