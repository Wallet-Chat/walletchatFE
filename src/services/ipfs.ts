import { create } from 'ipfs-http-client'
import { v4 as uuidv4 } from 'uuid'

const ipfsClient = create({
   url: 'https://ipfs.infura.io:5001/api/v0',
})

export const getIpfsData = async (cid: string) => {
   
   if (cid.length === 46) {
      let returnData = '**failed - call devs**'
      const rawmessage = await fetch(`https://ipfs.infura.io/ipfs/${cid}`)
      returnData = await rawmessage.text()
      return returnData
   } else {
      return cid
   }
}

export const postIpfsData = async (text: string) => {
   let cidReturn = 'failed'
   let cid = await ipfsClient.add(text)
   // const url = `https://ipfs.infura.io/ipfs/${cid.path}`
   // console.log('IPFS link: ', url)
   console.log("text/cid:", text, cid)
   cidReturn = `${cid.path}`
   return await cidReturn
}

export const uploadIpfs = async () => {
   const result = await ipfsClient.add(
      JSON.stringify({
         version: '1.0.0',
         metadata_id: uuidv4(),
         description: 'Description',
         content: 'Content',
         external_url: null,
         image: null,
         imageMimeType: null,
         name: 'Name',
         attributes: [],
         media: [
            // {
            //   item: 'https://scx2.b-cdn.net/gfx/news/hires/2018/lion.jpg',
            //   // item: 'https://assets-global.website-files.com/5c38aa850637d1e7198ea850/5f4e173f16b537984687e39e_AAVE%20ARTICLE%20website%20main%201600x800.png',
            //   type: 'image/jpeg',
            // },
         ],
         appId: 'testing123',
      })
   )

   console.log('upload result ipfs', result)
   return result
}
