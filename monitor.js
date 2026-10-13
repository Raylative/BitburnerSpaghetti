import{getServerList} from "./utils.js"


export async function main(ns) {
  const flags = ns.flags([
    ['refreshrate', 100],
    ['help', false],
  ])
  if (flags.help) {
    ns.tprint("This script helps visualize the money and security of a server.");
    ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} n00dles`)
    return;
  }
  ns.ui.openTail();
  ns.disableLog('ALL');

  let listOfServers = ["the-hub","phantasy","neo-net","alpha-ent","summit-uni","crush-fitness","foodnstuff"];

  while (true) {
    ns.clearLog();
    for(let server of listOfServers){


    
    let money = ns.getServerMoneyAvailable(server);
    if (money === 0) money = 1;
    const maxMoney = ns.getServerMaxMoney(server);
    const minSec = ns.getServerMinSecurityLevel(server);
    let sec = ns.getServerSecurityLevel(server);

    let currentMoneyFormatted = ns.format.number(money)
    const maxMoneyFormatted = ns.format.number(maxMoney)
    let moneyPercentFormatted = ns.format.percent(money / maxMoney, 2)

    let growthMultiplier = maxMoney / money;
    if (growthMultiplier < 1 || !isFinite(growthMultiplier)) growthMultiplier = 1

    let analyzedhackThreads = Math.ceil(ns.hackAnalyzeThreads(server, money));
    let analyzedgrowThreads = Math.ceil(ns.growthAnalyze(server, growthMultiplier));
    let analyzedweakenThreads = Math.ceil((sec - minSec) * 20)
    if (!isFinite(analyzedhackThreads)) analyzedhackThreads = 1;
    if (!isFinite(analyzedgrowThreads)) analyzedgrowThreads = 1;
    if (analyzedweakenThreads <= 0 || !isFinite(analyzedweakenThreads)) analyzedweakenThreads = 1

    

    ns.print(`${server}:`);
    ns.print(` $_______: ${currentMoneyFormatted} / ${maxMoneyFormatted} (${moneyPercentFormatted})`);
    ns.print(` security: +${(sec - minSec).toFixed(2)}`);
    ns.print(` hack____: ${ns.format.time(ns.getHackTime(server))} (t=${analyzedhackThreads})`);
    ns.print(` grow____: ${ns.format.time(ns.getGrowTime(server))} (t=${analyzedgrowThreads})`);
    ns.print(` weaken__: ${ns.format.time(ns.getWeakenTime(server))} (t=${analyzedweakenThreads})`);
    }
    await ns.sleep(flags.refreshrate);
  }
}

export function autocomplete(data, args) {
  return data.servers;
}