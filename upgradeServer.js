/** @param {NS} ns */
export async function main(ns) {
  let targetServer = ns.args[0];//??= null;

  let maxRam = ns.cloud.getRamLimit(targetServer);
  //let currentMoney = ns.getPlayer().money;
  //let upgradeCost = ns.cloud.getServerUpgradeCost(targetServer, maxRam);
  let desiredRam = ns.args[1] ??= null;
  let currentRam = ns.getServerMaxRam(targetServer);
  let nextBuyAmmount = 0;
  let successfulBuy = true;
  //TODO
  //  let allCloudServers = ns.cloud.getServerNames();



  // PLAN: 
  //
  //determine current ram
  //then take this value *2
  //try buy
  //do as long until buy returns false or maxRam is exceeded.
  //

  // 
  if (desiredRam === null) {

    while (!(currentRam >= maxRam) && successfulBuy) {
      currentRam = ns.getServerMaxRam(targetServer)
      nextBuyAmmount = currentRam * 2


      successfulBuy = ns.cloud.upgradeServer(targetServer, nextBuyAmmount)
    }
  currentRam = ns.getServerMaxRam(targetServer)
  ns.alert(`stopped at ${currentRam}`)
  }

else {
  if (ns.cloud.upgradeServer(targetServer, desiredRam)) ns.alert(`Upgrade Successful \n ${targetServer} has now ${desiredRam}`)
  else ns.alert("fuck, this didnt work out... \n why? \n \n dunno. ")

}
}



//todo liste holen mit allen gekauften servern und alle durchgehen bis ein buy fehlgeschlagen ist.
//innerhalb der 

//schritt für schritt richtung automation
//eine feature nach dem anderen. (keep in mind)