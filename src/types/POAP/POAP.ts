import POAPEvent from "./POAPEvent"

export default interface POAP {
   event: POAPEvent
   tokenId: string
   owner: string
   chain: string
   created: string
}
