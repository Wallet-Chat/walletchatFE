import { useEffect, useState, KeyboardEvent } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { IconSend } from '@tabler/icons'
import { Button, Divider, Flex, FormControl } from '@chakra-ui/react'

import CommentType from '../../../../types/Comment'
import Comment from './components/Comment'

const NFTComments = ({
	account,
	ownerAddr = '',
	nftContractAddr,
	nftId,
}: {
	account: string
	ownerAddr: string | undefined | null
	nftContractAddr: string
	nftId: string
}) => {
	// Comment
	const [commentInput, setCommentInput] = useState<string>('')
	const [loadedComments, setLoadedComments] = useState<CommentType[]>([])
	const [isFetchingComments, setIsFetchingComments] = useState<boolean>(false)
	const [isPostingComment, setIsPostingComment] = useState<boolean>(false)

	useEffect(() => {
		getComments()

		const interval = setInterval(() => {
			getComments()
		}, 5000) // every 5s

		return () => {
			clearInterval(interval)
		}
	}, [account, ownerAddr])

	const getComments = () => {
		setIsFetchingComments(true)
		fetch(
			` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/get_comments/${nftContractAddr}/${nftId}`,
			{
				method: 'GET',
			}
		)
			.then((response) => response.json())
			.then((data) => {
				console.log('✅[GET][NFT][Comments]:', data)
				const translatedData = data.map((item: any) => ({
					fromAddr: item.fromaddr,
					nftAddr: item.nftaddr,
					nftId: item.nftid,
					timestamp: item.timestamp,
					message: item.message,
				}))

				setLoadedComments(translatedData)
			})
			.catch((error) => {
				console.error('🚨🚨[POST][NFT][Comments]:', error)
			})
			.finally(() => setIsFetchingComments(false))
	}

	const handleCommentKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			sendComment()
		}
	}

	const sendComment = async () => {
		if (commentInput.length <= 0) return

		// Make a copy and clear input field
		const commentInputCopy = (' ' + commentInput).slice(1)
		setCommentInput('')

		const timestamp = new Date()

		let data = {
			fromAddr: account.toLocaleLowerCase(),
			nftAddr: nftContractAddr,
			nftId: nftId,
			timestamp: new Date(),
			message: commentInputCopy,
		}

		setIsPostingComment(true)
		fetch(
			` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/create_comments`,
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwt')}`,
				},
				body: JSON.stringify(data),
			}
		)
			.then((response) => response.json())
			.then((data) => {
				console.log('nft id: ', nftId)
				console.log('✅[POST][NFT][Comment]:', data)
				addCommentToUI(
					account,
					nftContractAddr,
					nftId,
					timestamp,
					commentInputCopy
				)
			})
			.catch((error) => {
				console.error('🚨🚨[POST][NFT][Comment]:', error, JSON.stringify(data))
			})
			.finally(() => setIsPostingComment(false))
	}

	const addCommentToUI = (
		fromAddr: string,
		nftAddr: string,
		nftId: string,
		timestamp: Date,
		message: string
	) => {
		console.log(`Add comment to UI: ${message}`)

		const newComment: CommentType = {
			fromAddr,
			nftAddr,
			nftId: nftId,
			timestamp: timestamp.toISOString(),
			message,
		}
		let newLoadedComments: CommentType[] = [...loadedComments] // copy the old array
		newLoadedComments = [newComment].concat(newLoadedComments) // place new comment in 0 index
		console.log(newLoadedComments)
		setLoadedComments(newLoadedComments)
	}

	return (
		<>
			<Flex mb={5}>
				<FormControl style={{ flexGrow: 1 }}>
					<TextareaAutosize
						placeholder='Comment...'
						value={commentInput}
						onChange={(e) => setCommentInput(e.target.value)}
						onKeyPress={(e) => handleCommentKeyPress(e)}
						className='custom-scrollbar'
						style={{
							resize: 'none',
							padding: '.5rem 1rem',
							width: '100%',
							fontSize: 'var(--chakra-fontSizes-md)',
							background: 'var(--chakra-colors-lightgray-400)',
							borderRadius: '0.3rem',
							marginBottom: '-6px',
						}}
						maxRows={8}
					/>
				</FormControl>
				<Flex alignItems='flex-end'>
					<Button
						variant='black'
						height='100%'
						onClick={() => sendComment()}
						isLoading={isPostingComment}
					>
						<IconSend size='20' />
					</Button>
				</Flex>
			</Flex>

			{loadedComments.map((comment: CommentType, i) => (
				<>
					<Comment data={comment} key={i} />
					{i + 1 !== loadedComments.length && <Divider mb={4} />}
				</>
			))}
		</>
	)
}

export default NFTComments
