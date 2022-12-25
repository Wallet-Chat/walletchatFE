import {
   Box,
   Button,
   Divider,
   Flex,
   FormControl,
   FormErrorMessage,
   FormLabel,
   IconButton,
   Image as CHAKRAIMAGE,
   Input,
   Modal,
   ModalBody,
   ModalCloseButton,
   ModalContent,
   ModalFooter,
   ModalHeader,
   ModalOverlay,
   Text,
   useToast,
} from '@chakra-ui/react'
import { AiOutlineClose, AiOutlineUpload } from "react-icons/ai";
import React, { ChangeEvent, DragEventHandler, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'
import { useWallet } from '../../../../context/WalletProvider'
import OpenSeaNFT from '../../../../types/OpenSea/NFT'
import Resizer from "react-image-file-resizer";
import { BlockieWrapper } from '../../../../styled/BlockieWrapper';
import Blockies from 'react-blockies'
import useWindowSize from '../../../../hooks/useWindowSize'
import { relative } from 'path';

const ChangeName = () => {
   const {
      handleSubmit,
      register,
      formState: { errors },
      setValue
   } = useForm()

   const { width, height } = useWindowSize();

   const { name: _name, setName: globalSetName, account } = useWallet()
   const toast = useToast()

   const [name, setName] = useState('')
   const [curPFP, setCurPFP] = useState<string | null>(null)
   const [isCropModalOpen, setCropModalOpen] = useState(false)
   const [modalDim, setModalDim] = useState<{
      maxW: number,
      minW: number,
      maxH: number,
      minH: number,
      w: number,
      h: number,
   }>({
      w: 981,
      h: 981,
      maxW: 855,
      minW: 348,
      minH: 391,
      maxH: 898,
   })
   const [isPFPOverlay, setPFPOverlay] = useState(false)
   const [isSaveHover, setSaveHover] = useState(false)
   const [isPreviewGrab, setPreviewGrab] = useState(false)
   const [dragPos, setDragPos] = useState<{
      x: number,
      y: number
   }>({
      x: 0,
      y: 0
   })
   const [pfpPos, setPfpPos] = useState<{
      x: number,
      y: number
   }>({
      x: 0,
      y: 0
   })
   const [imgToUpload, setImgToUpload] = useState<{
      blob: File | undefined,
      url: string,
      w: number,
      h: number,
      aspect: number
   }>({
      blob: undefined,
      url: "",
      h: 0,
      w: 0,
      aspect: 1
   })
   const [isFetching, setIsFetching] = useState(false)
   const [ownedENS, setOwnedENS] = useState<OpenSeaNFT[]>([])

   const [file, setFile] = useState('string')

   const resizeFile = (file: Blob) =>
      new Promise((resolve) => {
         Resizer.imageFileResizer(
            file,
            64,
            64,
            "JPEG",
            100,
            0,
            (uri) => {
               resolve(uri);
            },
            "base64"
         );
      });

   const clickUpload = () => {

   }

   const localUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      console.log(`localUpload`)
      console.warn(e.target.files)
      const files = e.target.files
      console.log(files)
      if (files && files.length !== 0) {
         let imgBlob = files[0]
         console.log(`Converting blob to url`)
         let url = URL.createObjectURL(imgBlob as Blob | MediaSource)
         console.log(`url: ${url}`)
         let img = new Image()
         img.src = url
         img.onload = () => {
            alert(img.width + " " + img.height);
            setImgToUpload({
               blob: imgBlob,
               url: url,
               w: img.width,
               h: img.height,
            })
   
            setCropModalOpen(true)
         }
         
      }
   }

   const upload = async (e: ChangeEvent<HTMLInputElement>) => {
      console.warn(e.target.files)
      const files = e.target.files
      if (files && files.length !== 0) {
         const image = await resizeFile(files[0])

         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/image`, {
            method: 'PUT',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
            body: JSON.stringify({
               base64data: image,
               addr: account,
            }),
         })
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[POST][Image]:', response)
               toast({
                  title: 'Success',
                  description: `PFP updated!`,
                  status: 'success',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
               setName("")
            })
            .catch((error) => {
               console.error('🚨[POST][Image]:', error)
               toast({
                  title: 'Error',
                  description: `Image Not Updated - Unknown error`,
                  status: 'error',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
            }).then(() => {
               setIsFetching(false)
            })
      }
   }
   const resizeModal = () => {
      console.log(`Window H W: ${height} ${width}`)
      if (height != undefined && width != undefined) {

         const smallerVal = height > width ? width : height;
         const minWidth = smallerVal / 5;
         const minHeight = minWidth + 43;
         const maxWidth = minWidth * 4;
         const maxHeight = maxWidth + 43;
         setModalDim({
            maxH: maxHeight,
            minH: minHeight,
            minW: minWidth,
            maxW: maxWidth,
            w: maxWidth,
            h: maxWidth
         })
      }
   }
   useEffect(() => {
      resizeModal()
   }, [height, width])
   useEffect(() => {
      const getOwnedENS = () => {
         if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
            console.log('Missing OpenSea API Key')
            return
         }
         fetch(
            `https://api.opensea.io/api/v1/assets?owner=${account}&collection=ens`,
            {
               method: 'GET',
               headers: {
                  Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
               },
            }
         )
            .then((response) => response.json())
            .then((result) => {
               console.log(`✅[GET][ENS Owned by ${account}]]:`, result)
               if (result?.assets?.length > 0) {
                  setOwnedENS(result.assets)
               }
            })
            .catch((error) =>
               console.log(`🚨[GET][ENS Owned by ${account}`, error)
            )
      }
      if (account) {
         getOwnedENS()
      }
   }, [account])

   const onSubmit = (values: any) => {
      if (values?.name) {

         setIsFetching(true)

         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/name`, {
            method: 'POST',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
            body: JSON.stringify({
               name: values.name,
               address: account,
            }),
         })
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[PUT][Name]:', response)
               globalSetName(values.name)
               toast({
                  title: 'Success',
                  description: `Name's updated to ${values.name}`,
                  status: 'success',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
               setName("")
            })
            .catch((error) => {
               console.error('🚨[PUT][Name]:', error)
               toast({
                  title: 'Error',
                  description: `Name Not Updated - Ensure you own this ENS address!`,
                  status: 'error',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
            }).then(() => {
               setIsFetching(false)
            })
      }
   }

   const onSubmitPFP = (values: any) => {

   }

   const onCloseModal = () => {
      setCropModalOpen(false);
   }

   const showUploadOverlay = () => {
      setPFPOverlay(true)
   }

   const removeUploadOverlay = () => {
      setPFPOverlay(false)
   }

   const handleImgGrab = (e: React.MouseEvent<HTMLDivElement>) => {
      // console.log(`isPreviewGrab: ${isPreviewGrab}`)
      if (!isPreviewGrab) return;
      // console.log("handleImgGrab")
      // console.log(e)
      let dragX = e.pageX, dragY = e.pageY;
      // console.log("X: " + dragX + " Y: " + dragY);
      // if (dragPos.x != null && dragPos.y != null){
      // console.log(`Move bg by ${dragX - dragPos.x} ${dragY - dragPos.y}`)
      // }
      setPfpPos({
         x: pfpPos.x + (dragX - dragPos.x),
         y: pfpPos.y + (dragY - dragPos.y)
      })
      setDragPos({
         x: dragX,
         y: dragY
      })
   }

   const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
      console.log("handleDragStart")
      setPreviewGrab(true)
      let dragX = e.pageX, dragY = e.pageY;
      setDragPos({
         x: dragX,
         y: dragY
      })
   }

   const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
      console.log("handleDragEnd")
      setPreviewGrab(false)
      let dragX = e.pageX, dragY = e.pageY;
      console.log("X: " + dragX + " Y: " + dragY)
   }

   return (
      <Box p={6} pt={16} background="white" width="100%" height="100vh">
         <form onSubmit={onSubmitPFP}>
            <FormControl>
               <span>Upload your PFP</span>
               <Input opacity="0"
                  aria-hidden="true"
                  accept="image/*" id='imgupload' type='file' onChange={(e) => localUpload(e)} name='img' style={{
                     display: 'none'
                  }} />
               <FormLabel width={'64px'} height={'64px'} htmlFor='imgupload' fontSize="xl" position={'relative'} onMouseOver={showUploadOverlay} onMouseLeave={removeUploadOverlay}>

                  {/* <AiOutlineUpload /> */}
                  {curPFP ? (<CHAKRAIMAGE width={'100%'} height={'100%'} src={''} />) :
                     (
                        <BlockieWrapper style={{
                           borderRadius: "50%",
                           width: '64px',
                           height: '64px',
                        }}>
                           <Blockies
                              seed={"naani"}
                              scale={8}
                           />
                        </BlockieWrapper>
                     )}

                  <Box
                     position={'absolute'}
                     top={'0'}
                     left={'0'}
                     cursor={'pointer'}
                     opacity={isPFPOverlay ? '100%' : '0'}
                     display={'flex'}
                     justifyContent={'center'}
                     alignItems={'center'}
                     borderRadius={'50%'}
                     width={'64px'}
                     height={'64px'}
                     color={'rgba(190,190,190,0.75)'}
                     backgroundColor={'rgba(90,90,90,0.5)'}
                     transition={"opacity 0.25s"}

                  >
                     <AiOutlineUpload fontSize={'1.5em'} />
                  </Box>
               </FormLabel>

            </FormControl>
         </form>
         <Divider
            orientation="horizontal"
            height="15px"
            d="inline-block"
            verticalAlign="middle"
         />
         <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl>
               <FormLabel fontSize="xl">Change your name</FormLabel>
               <Text color="darkgray.300" fontSize="md" mb={1}>Current name: <b>{_name}</b></Text>
               <Flex>
                  <Input
                     type="text"
                     size="lg"
                     value={name}
                     placeholder="Enter new name..."
                     borderColor="black"
                     {...register('name', {
                        required: true,
                     })}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setName(e.target.value)
                     }
                  />
                  <Button variant="black" height="auto" type="submit" isLoading={isFetching}>
                     <IconSend size="20" />
                  </Button>
               </Flex>
               {ownedENS.length > 0 && (
                  <Box mt={2}>
                     {ownedENS.map((item, i) =>
                        (item?.name && item.name !== "Unknown ENS name") ? (
                           <Button
                              variant="outline"
                              key={i}
                              onClick={() => item?.name && setValue('name', item.name, { shouldTouch: true })}
                              mr="2"
                              mb="2"
                              size="sm"
                           >
                              {item.name}
                           </Button>
                        ) : (
                           ''
                        )
                     )}
                  </Box>
               )}
               {errors.name && errors.name.type === 'required' && (
                  <FormErrorMessage>No blank name please</FormErrorMessage>
               )}
            </FormControl>
         </form>
         <Modal closeOnOverlayClick={false} isOpen={isCropModalOpen} onClose={onCloseModal} isCentered motionPreset='slideInRight'>
            <ModalOverlay />
            <ModalContent style={
               {
                  maxWidth: modalDim.maxW,
                  minWidth: modalDim.minW,
                  maxHeight: modalDim.maxH,
                  minHeight: modalDim.minH,
                  width: modalDim.w,
                  height: modalDim.h,
               }
            }>
               <ModalHeader flex={"none"} height={43} py={0} textAlign={'center'} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>

                  <span style={{
                     color: "skyblue",
                     filter: `saturate(${isSaveHover ? 2.85 : 1})`,
                     cursor: "pointer",
                     transition: "filter 0.5s"
                  }} onMouseOver={() => { setSaveHover(true) }} onMouseLeave={() => { setSaveHover(false) }}>Save</span>
                  <span>Crop</span>
                  <IconButton onClick={onCloseModal} icon={<AiOutlineClose />} aria-label={'Close'} />
               </ModalHeader>
               <ModalBody p={0} position={'relative'} zIndex={99999}
                  overflow={"hidden"}
                  onMouseDown={handleDragStart} onMouseUp={handleDragEnd}
                  onMouseMove={handleImgGrab}
                  cursor={isPreviewGrab ? "grabbing" : "grab"}>
                  <Box 
                     height={"100%"} 
                     width={"100%"} 
                     backgroundPosition={"center center"}
                     backgroundRepeat={"no-repeat"}
                     backgroundSize={"cover"}
                     backgroundImage={imgToUpload.url} 
                     transform={`translate3d(${pfpPos.x}px, ${pfpPos.y}px, 0px) scale(1)`} ></Box>
                  <Box id="grid" position={'absolute'} height="100%" width={'100%'} top={0} left={0}>
                     <Box position={'relative'} height="100%" width={'100%'}>
                        <div style={{
                           left: "33%",
                           top: 0,
                           width: "1px",
                           height: "100%",
                           position: "absolute",
                           backgroundColor: "rgba(255,255,255,0.3)",

                        }}></div>

                        <div style={{
                           left: "66%",
                           top: 0,
                           width: "1px",
                           height: "100%",
                           position: "absolute",
                           backgroundColor: "rgba(255,255,255,0.3)",

                        }}></div>

                        <div style={{
                           top: "33%",
                           left: 0,
                           height: "1px",
                           width: "100%",
                           position: "absolute",
                           backgroundColor: "rgba(255,255,255,0.3)",

                        }}></div>

                        <div style={{
                           top: "66%",
                           left: 0,
                           height: "1px",
                           width: "100%",
                           position: "absolute",
                           backgroundColor: "rgba(255,255,255,0.3)",

                        }}></div>
                     </Box>
                  </Box>
               </ModalBody>
            </ModalContent>
         </Modal>
      </Box>
   )
}

export default ChangeName
