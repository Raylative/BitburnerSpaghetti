import { getNumMaxThreadsForScript } from "./utils.js"
/** @param {NS} ns */
export async function main(ns) {
  let maxThreads = getNumMaxThreadsForScript(ns, "home", "share.js");

  if (!(maxThreads <= 0)) {
    ns.exec("share.js", "home", maxThreads);
  }
  else{ns.alert("ERROR: No RAM left on home to run Share.js")}
}