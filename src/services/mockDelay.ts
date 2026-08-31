export const simulateNetworkDelay = (min = 500, max = 1500) => {
  const delay = Math.floor(Math.random() * (max - min + 1) + min)
  return new Promise(resolve => setTimeout(resolve, delay))
}
