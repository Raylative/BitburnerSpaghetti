//import {formatInColor, colorTable} from "./utils.js"
const colorTable = {
  reset: "\u001b[0m",

  // Primärfarben
  red: "\u001b[31m",
  blue: "\u001b[34m",
  yellow: "\u001b[33m",
  green: "\u001b[92m",

  // Sekundär- und Mischfarben
  darkgreen: "\u001b[32m",
  orange: "\u001b[38;5;208m", // Hinweis: Bei manchen Systemen fehlt hier das '38' vor ';5;208m', falls es nicht lädt, nutze "\u001b[38;5;208m"
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

/** @param {ns} ns */
export async function main(ns) {
  ns.disableLog("ALL")

  const target = ns.args[0];

  const possibleMaxMoney = ns.getServerMaxMoney(target)
  const moneyThreshold = possibleMaxMoney * 0.90;

  const possibleMinSec = ns.getServerMinSecurityLevel(target) + 5;
  const stealThreshold = moneyThreshold * 0.85;
  let numOfThreads = ns.getRunningScript().threads

  //TODO: Regulation von WGH 
  //momentan das problem wenn server zu viel ram hat eine aktion alles zerfetzt.
  // dadurch braucht gerade noch das regulieren von sec übeeeel lange. 
  //optionen:
  //// ich bau einen maxSecLossThreshold oder
  //// ich berechne für jedes grown und für jedes hack und weaken die benötigte zeit, und wie viel 
  //// es effekt hat. und kann anhand dessen besser herausfinden wie viele threads für was 
  //// benutzt werden soll (durchdenken und fragen: löst das das problem oder ist der sideeffekt die lösung?)


  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    //sauber ist die mutter der Nachsicht oder so
    ns.clearLog()
    let currentServersSecurityLevel = ns.getServerSecurityLevel(target);
    let currentServersMoney = ns.getServerMoneyAvailable(target);
    let nextStolenMoney = ns.hackAnalyze(target) * currentServersMoney * numOfThreads;
    //let nextWeaken = ns.weakenAnalyze(target)*numOfThreads
    //print insights:
    //vars to show
    let moneyGoalOffset = currentServersMoney - moneyThreshold;
    let securityGoalOffset = currentServersSecurityLevel - possibleMinSec;

    //variables for printing info:
    //let 

    //actual print:
    //ns.print("INFO: \n")

    //ns.print(` -Servers Money: ${ns.format.number(currentServersMoney)}`)
    //ns.print(` -MoneyThreshold: ${ns.format.number(stealThreshold)}`)
    //ns.print(` -MoneyGoalOffset ${ns.format.number(moneyGoalOffset)}`)
    //ns.print(` -Servers Sec :  ${ns.format.number(currentServersSecurityLevel)}`)
    //ns.print(` -SecOffSet: ${ns.format.number(securityGoalOffset)}`)
    //ns.print(` -SecThreshold: ${ns.format.number(possibleMinSec)}`)
    let colorMoney = "green";
    if (moneyGoalOffset < 0) { colorMoney = "red" }
    let colorSec = "green";
    if (securityGoalOffset > 0) { colorSec = "red" }

    ns.print("==================================================");
    ns.print(` TARGET:  ${formatInColor(ns, target.toUpperCase(), "orange")}`);
    ns.print("==================================================");
    ns.print(` Geld:    ${formatInColor(ns, ns.format.number(currentServersMoney), colorMoney)} / ${ns.format.number(possibleMaxMoney)}`);
    ns.print(` Sec: ${formatInColor(ns, ns.format.number(currentServersSecurityLevel), colorSec)} (Possible Minimum: ${possibleMinSec})`);
    ns.print("--------------------------------------------------");


    //main logic:
    //todo hier ist noch ein bug versteckt. iwas mit zu viel grown weil geld zu hoch?
    if (currentServersSecurityLevel > possibleMinSec) {
      // If the server's security level is above our threshold, weaken it
      ns.print(` WARN: Weakening Sec.`);
      ns.enableLog("weaken");
      ns.print("==================================================");
      await ns.weaken(target);
    } else if (currentServersMoney < moneyThreshold) {
      // If the server's money is less than our threshold, grow it
      ns.print(`WARN: Growing Money.`);
      ns.enableLog("grow");
      ns.print("==================================================");
      await ns.grow(target);
    } else {
      if (currentServersMoney - nextStolenMoney > stealThreshold || currentServersMoney == possibleMaxMoney) {
        ns.print(`SUCCESS: hacking for money.`);
        ns.print("==================================================");
        ns.enableLog("hack");
        await ns.hack(target);
      }
      // Otherwise, hack it
      else {
        ns.print(`WARN: Counter Grow hack again`)
        ns.enableLog("grow");
        await ns.grow(target)
        ns.print("==================================================");
      }
    }
  }
}