import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useEffect,
  useReducer,
} from 'react';
import { Snap } from '../types';
import { getSnap } from '../utils';

export type MetamaskState = {
  installedSnap?: Snap;
  error?: Error;
};

const initialState: MetamaskState = {
  error: undefined,
};

type MetamaskDispatch = { type: MetamaskActions; payload: any };

export const MetaMaskContext = createContext<
  [MetamaskState, Dispatch<MetamaskDispatch>]
>([
  initialState,
  () => {
    /* no op */
  },
]);

export enum MetamaskActions {
  SetInstalled = 'SetInstalled',
  SetError = 'SetError',
}

const reducer: Reducer<MetamaskState, MetamaskDispatch> = (state, action) => {
  switch (action.type) {
    case MetamaskActions.SetInstalled:
      return {
        ...state,
        installedSnap: action.payload,
      };

    case MetamaskActions.SetError:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

/**
 * MetaMask context provider to handle MetaMask and snap status.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function detectSnapInstalled() {
      const installedSnap = await getSnap();
      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    }

    detectSnapInstalled();
  }, [window.ethereum]);

  useEffect(() => {
    let timeoutId: number;

    if (state.error) {
      timeoutId = window.setTimeout(() => {
        dispatch({
          type: MetamaskActions.SetError,
          payload: undefined,
        });
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [state.error]);

  return (
    <MetaMaskContext.Provider value={[state, dispatch]}>
      {children}
    </MetaMaskContext.Provider>
  );
};
