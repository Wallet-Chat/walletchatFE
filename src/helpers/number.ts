export function numberWithCommas(x: number) {
   let rounded = x.toFixed(2)
   let parts = rounded.toString().split('.')
   parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
   return parts.join('.')
}

export function nFormatter(num: number, decimals: number) {
   const lookup = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'k' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'G' },
      { value: 1e12, symbol: 'T' },
      { value: 1e15, symbol: 'P' },
      { value: 1e18, symbol: 'E' },
   ]
   const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
   var item = lookup
      .slice()
      .reverse()
      .find(function (item) {
         return num >= item.value
      })
   return item
      ? (num / item.value).toFixed(decimals).replace(rx, '$1') + item.symbol
      : '0'
}
