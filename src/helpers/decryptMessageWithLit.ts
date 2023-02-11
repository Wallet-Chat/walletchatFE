import lit from '../utils/lit'

interface EncryptedLitMessage {
	message: string
	lit_access_conditions: any
	encrypted_sym_lit_key: string
}

export const decryptMessageWithLit = async (
	encryptedItem: EncryptedLitMessage
): Promise<string> => {
	const blob = lit.b64toBlob(encryptedItem.message)
	const _accessControlConditions = JSON.parse(
		encryptedItem.lit_access_conditions
	)

	if (String(encryptedItem.lit_access_conditions).includes('evmBasic')) {
		const rawmsg = await lit.decryptString(
			blob,
			encryptedItem.encrypted_sym_lit_key,
			_accessControlConditions
		)
		return rawmsg.decryptedFile.toString()
	} else {
		const rawmsg = await lit.decryptStringOrig(
			blob,
			encryptedItem.encrypted_sym_lit_key,
			_accessControlConditions
		)
		return rawmsg.decryptedFile.toString()
	}
}
