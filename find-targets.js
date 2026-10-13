// DIESES SCRIPT SOLL DIE AUFGABEN ÜBERNEHMEN ALLE TARGETS ZU FINDEN
//REFACTORING DIENTDER SAUBERKEIT IN UTILS ONE PRINZIP PER DING UND SO

import { getThresholds } from "./utils.js"

export function getStrategy(ns, node) {
  //return a [] with allocations on h w and g 
  let { moneyThresh, secThresh } = getThresholds(ns, node)
  let type = ''; // Strategy name (for logging)
  let seq = []; //action sequence 
  let allocation = []; //Procentual distro between each action  

  if (ns.getServerSecurityLevel(node) > secThresh) {
    type = 'flog';
    seq = ['g', 'w'];
    allocation = [0.3, 0.7]
  }
  else if (ns.getServerMoneyAvailable(node) < moneyThresh) {
    type = 'nourish';
    seq = ['g', 'w'];
    allocation = [0.6, 0.4];
  }
  else {
    type = 'plunder';
    seq = ['h', 'w', 'g', 'w'];
    allocation = [0.25, 0.25, 0.25, 0.25];
  }


  return {
    type,
    seq,
    allocation
  };

}
/** @param {NS} ns */
export async function main(ns) {

}


