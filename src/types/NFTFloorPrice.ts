// export interface NFTFloorPriceAPIType {
//    openSea: {
//       floorPrice: number
//       priceCurrency: string
//       retrievedAt: string
//       collectionUrl: string
//    }
//    looksRare: {
//       floorPrice: number
//       priceCurrency: string
//       retrievedAt: string
//       collectionUrl: string
//    }
// }

// export interface NFTFloorPriceType {
//     floorPrice: number
//     priceCurrency: string
//     retrievedAt: string
//     collectionUrl: string
//  }

export default interface NFTStatistics {
   statistics: {
      one_day_volume: number
      one_day_change: number
      one_day_sales: number
      one_day_average_price: number
      seven_day_volume: number
      seven_day_change: number
      seven_day_sales: number
      seven_day_average_price: number
      thirty_day_volume: number
      thirty_day_change: number
      thirty_day_sales: number
      thirty_day_average_price: number
      total_volume: number
      total_sales: number
      total_supply: number
      total_minted: number
      num_owners: number
      average_price: number
      market_cap: number
      floor_price: number
      floor_price_historic_one_day: number
      floor_price_historic_seven_day: number
      floor_price_historic_thirty_day: number
      updated_date: string
   }
}
