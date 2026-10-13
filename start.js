export async function main(ns) {
 while (true){
  ns.print("executing deploy")

  await ns.run("deploy.js", 1, "basic.js")

  ns.toast("sleeping")
  await ns.sleep(1800000)
 }

}
