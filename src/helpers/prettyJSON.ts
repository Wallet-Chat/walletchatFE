export const prettyJSON = (message: string, obj: string) => {
   log(message, JSON.stringify(obj, null, 2))
}
