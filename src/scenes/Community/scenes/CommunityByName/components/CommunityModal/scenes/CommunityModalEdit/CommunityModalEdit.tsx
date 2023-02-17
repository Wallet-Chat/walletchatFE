import {
	Avatar,
	Box,
	Button,
	Flex,
	Heading,
	Input,
	InputGroup,
	InputLeftElement,
	Spinner,
	Text,
	useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useDebounce } from '../../../../../../../../hooks/useDebounce'
import CommunityType from '../../../../../../../../types/Community'
import User from '../../../../../../../../types/User'

const CommunityModalEdit = ({
	setPageState,
	communityData,
}: {
	setPageState: (state: string) => void
	communityData: CommunityType | undefined
}) => {
	const { community = '' } = useParams()

	const [searchTerm, setSearchTerm] = useState<string>('')
	const debouncedSearchTerm: string = useDebounce<string>(searchTerm, 500)
	const [filteredMembers, setFilteredMembers] = useState<User[]>(
		communityData?.members ? communityData.members : []
	)

	const [file, setFile] = useState<Blob | MediaSource>()
	const [filePreview, setFilePreview] = useState('')
	const [isFetchingAvatar, setIsFetchingAvatar] = useState(false)
	const [isSuccessAvatar, setIsSuccessAvatar] = useState(false)
	const toast = useToast()

	useEffect(() => {
		if (communityData?.members) {
			setFilteredMembers(communityData.members)
		}
	}, [communityData])

	return (
		<Box>
			<Box px={6}>Edit</Box>
		</Box>
	)
}

export default CommunityModalEdit
