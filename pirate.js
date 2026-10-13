/** @param {NS} ns */
export async function main(ns) {

let action = ns.args[0];
let target = ns.args[1];
let delay = ns.args[2];
let pid = ns.args[3];

ns.print(pid);
//apropiate delay per action
await ns.sleep(delay);

if (action === "weaken") {
  await ns.weaken(target);
} else if (action === "grow") {
  await ns.grow(target);
} else {
await ns.hack(target);
}

}