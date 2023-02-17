import { RootState, ReducerStates } from '@/redux/store'

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

const selectState = (state: unknown) => (state as RootState).dm

export function createFetchCondition(
	fetchingKey: keyof ReducerStates,
	valuesKey: keyof ReducerStates
) {
	return (arg: string, { getState }: { getState: any }) => {
		const state = selectState(getState())
		const stateObj = state as unknown as {
			[key: string]: { [arg: string]: any }
		}
		const fetchingValues = stateObj[fetchingKey]
		const isFetching = fetchingValues.includes(arg)
		const alreadyFetchedValue = stateObj[valuesKey][arg]

		if (isFetching || alreadyFetchedValue) {
			return false
		}
	}
}
