//// COLOR SYSTEM

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
export function formatInColor(ns,string,color) {


  let prefix = colorTable[color]
  let postfix = colorTable[reset]

 

  let formatted = `${prefix}${string}${RESET}`

  return formatted
}/** @param {NS} ns */
export async function main(ns) {

}