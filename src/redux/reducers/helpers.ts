import { ReducerStates } from '@/redux/store'

export function createErrorResponse(call: string) {
	return (response: any) => {
		const errorResponse = response as unknown as {
			status: string
			error: string
		}

		console.error(`🚨[GET][${call}]:`, errorResponse.error)

		return errorResponse.status
	}
}

export function addPendingSetReducer(
	arg: string,
	state: ReducerStates,
	stateKey: string
) {
	const stateObj = state as unknown as { [key: string]: string[] }
	const value = stateObj[stateKey]
	const newValue = new Set(value)

	if (!newValue.has(arg)) {
		newValue.add(arg)
		stateObj[stateKey] = Array.from(newValue)
	}
}

export function deletePendingSetReducer(
	arg: string,
	state: ReducerStates,
	stateKey: string
) {
	const stateObj = state as unknown as { [key: string]: string[] }
	const value = stateObj[stateKey]
	const newValue = new Set(value)

	if (newValue.has(arg)) {
		newValue.delete(arg)
		stateObj[stateKey] = Array.from(newValue)
	}
}
