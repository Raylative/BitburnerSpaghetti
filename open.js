/** @param {NS} ns */
export async function main(ns) {

//first argument is target
let target = ns.args[0];
ns.print("target is: "+ target);
ns.nuke(target);
ns.print("NUKE.Exe was executed on " + target);




}