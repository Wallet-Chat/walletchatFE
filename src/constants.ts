import { ChainObjectType } from './types/Chain'

export const POLLING_QUERY_OPTS = {
  pollingInterval: 5000, // 5 sec
}

export const CHAT_CONTEXT_TYPES = ['dm', 'community', 'nft'] as const

export const currencyList = [
  { name: 'US Dollar', code: 'USD', symbol: '$' },
  { name: 'Australian Dollar', code: 'AUD', symbol: '$' },
  { name: 'Brazilian Real', code: 'BRL', symbol: 'R$' },
  { name: 'Canadian Dollar', code: 'CAD', symbol: '$' },
  { name: 'Chinese Yuan', code: 'CNY', symbol: '¥' },
  { name: 'Czech Republic Koruna', code: 'CZK', symbol: 'Kč' },
  { name: 'Euro', code: 'EUR', symbol: '€' },
  { name: 'Israeli New Sheqel', code: 'ILS', symbol: '₪' },
  { name: 'Japanese Yen', code: 'JPY', symbol: '¥' },
  { name: 'Malaysian Ringgit', code: 'MYR', symbol: 'RM' },
  { name: 'New Zealand Dollar', code: 'NZD', symbol: '$' },
  { name: 'Philippine Peso', code: 'PHP', symbol: '₱' },
  { name: 'Russian Ruble', code: 'RUB', symbol: '₽' },
  { name: 'Singapore Dollar', code: 'SGD', symbol: '$' },
  { name: 'Swiss Franc', code: 'CHF', symbol: 'CHf' },
  { name: 'Thai Baht', code: 'THB', symbol: '฿' },
]

export const poapContractAddress = '0x22c1f6050e56d2876009903609a2cc3fef83b415'

export const chains: ChainObjectType = {
  '1': {
    symbol: 'ETH',
    name: 'Ethereum',
    slug: 'ethereum',
    block_explorer_url: 'https://etherscan.io/',
    logo: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPCEtLSBDcmVhdG9yOiBDb3JlbERSQVcgMjAxOSAoNjQtQml0KSAtLT4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZlcnNpb249IjEuMSIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIKdmlld0JveD0iMCAwIDc4NC4zNyAxMjc3LjM5IgogeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiB4bWxuczp4b2RtPSJodHRwOi8vd3d3LmNvcmVsLmNvbS9jb3JlbGRyYXcvb2RtLzIwMDMiPgogPGcgaWQ9IkxheWVyX3gwMDIwXzEiPgogIDxtZXRhZGF0YSBpZD0iQ29yZWxDb3JwSURfMENvcmVsLUxheWVyIi8+CiAgPGcgaWQ9Il8xNDIxMzk0MzQyNDAwIj4KICAgPGc+CiAgICA8cG9seWdvbiBmaWxsPSIjMzQzNDM0IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHBvaW50cz0iMzkyLjA3LDAgMzgzLjUsMjkuMTEgMzgzLjUsODczLjc0IDM5Mi4wNyw4ODIuMjkgNzg0LjEzLDY1MC41NCAiLz4KICAgIDxwb2x5Z29uIGZpbGw9IiM4QzhDOEMiIGZpbGwtcnVsZT0ibm9uemVybyIgcG9pbnRzPSIzOTIuMDcsMCAtMCw2NTAuNTQgMzkyLjA3LDg4Mi4yOSAzOTIuMDcsNDcyLjMzICIvPgogICAgPHBvbHlnb24gZmlsbD0iIzNDM0MzQiIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjM5Mi4wNyw5NTYuNTIgMzg3LjI0LDk2Mi40MSAzODcuMjQsMTI2My4yOCAzOTIuMDcsMTI3Ny4zOCA3ODQuMzcsNzI0Ljg5ICIvPgogICAgPHBvbHlnb24gZmlsbD0iIzhDOEM4QyIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjM5Mi4wNywxMjc3LjM4IDM5Mi4wNyw5NTYuNTIgLTAsNzI0Ljg5ICIvPgogICAgPHBvbHlnb24gZmlsbD0iIzE0MTQxNCIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjM5Mi4wNyw4ODIuMjkgNzg0LjEzLDY1MC41NCAzOTIuMDcsNDcyLjMzICIvPgogICAgPHBvbHlnb24gZmlsbD0iIzM5MzkzOSIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjAsNjUwLjU0IDM5Mi4wNyw4ODIuMjkgMzkyLjA3LDQ3Mi4zMyAiLz4KICAgPC9nPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg==',
  },
  '100': {
    symbol: 'xDAI',
    name: 'Gnosis',
    slug: 'xdai',
    block_explorer_url: 'https://gnosisscan.io/',
    logo: 'PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMDIuMDQ0IDMzMi43MDFDMjE2LjI0OCAzMzIuNzAxIDIyOS4zNiAzMjcuOTY4IDIzOS45MjMgMzE5Ljc3NkwxNTMuMjM4IDIzMy4xMjJDMTQ1LjA0MyAyNDMuNDk5IDE0MC4zMDggMjU2LjYwNiAxNDAuMzA4IDI3MC45ODhDMTQwLjEyNiAzMDUuMDMgMTY3LjgwNyAzMzIuNzAxIDIwMi4wNDQgMzMyLjcwMVoiIGZpbGw9IiMwNDc5NUIiLz4KPHBhdGggZD0iTTQ1OS45MTMgMjcwLjgwNUM0NTkuOTEzIDI1Ni42MDYgNDU1LjE3OCAyNDMuNDk5IDQ0Ni45ODMgMjMyLjk0TDM2MC4yOTggMzE5LjU5M0MzNzAuNjc5IDMyNy43ODUgMzgzLjc5MSAzMzIuNTE4IDM5OC4xNzggMzMyLjUxOEM0MzIuMjMyIDMzMi43IDQ1OS45MTMgMzA1LjAzIDQ1OS45MTMgMjcwLjgwNVoiIGZpbGw9IiMwNDc5NUIiLz4KPHBhdGggZD0iTTUwMy42MiAxNzYuNjg5TDQ2NS4xOTQgMjE1LjEwMUM0NzcuOTQyIDIzMC4zOTIgNDg1LjU5MSAyNDkuNjg5IDQ4NS41OTEgMjcxLjE3MUM0ODUuNTkxIDMxOS40MTIgNDQ2LjQzNyAzNTguNTUyIDM5OC4xNzcgMzU4LjU1MkMzNzYuODcgMzU4LjU1MiAzNTcuMzg0IDM1MC45MDYgMzQyLjA4NyAzMzguMTYzTDMwMC4wMTkgMzgwLjIxNUwyNTcuOTUxIDMzOC4xNjNDMjQyLjY1NCAzNTAuOTA2IDIyMy4zNSAzNTguNTUyIDIwMS44NjEgMzU4LjU1MkMxNTMuNjAxIDM1OC41NTIgMTE0LjQ0NyAzMTkuNDEyIDExNC40NDcgMjcxLjE3MUMxMTQuNDQ3IDI0OS44NzEgMTIyLjA5NiAyMzAuMzkyIDEzNC44NDQgMjE1LjEwMUwxMTUuMTc2IDE5NS40NEw5Ni40MTgzIDE3Ni42ODlDNzQuNTY0OSAyMTIuNzM0IDYxLjk5OTMgMjU0Ljc4NyA2MS45OTkzIDI5OS45MzRDNjEuOTk5MyA0MzEuMzcgMTY4LjUzNCA1MzcuNjg0IDI5OS44MzcgNTM3LjY4NEM0MzEuMTM5IDUzNy42ODQgNTM3LjY3NCA0MzEuMTg4IDUzNy42NzQgMjk5LjkzNEM1MzguMDM5IDI1NC42MDUgNTI1LjQ3MyAyMTIuNTUyIDUwMy42MiAxNzYuNjg5WiIgZmlsbD0iIzA0Nzk1QiIvPgo8cGF0aCBkPSJNNDcyLjExNCAxMzUuNzI4QzQyOC45NTQgOTAuMzk5IDM2Ny43NjQgNjIuMDAwMSAzMDAuMDE5IDYyLjAwMDFDMjMyLjI3MyA2Mi4wMDAxIDE3MS4yNjYgOTAuMzk5IDEyNy45MjQgMTM1LjcyOEMxMjIuMDk2IDE0MS45MTggMTE2LjQ1MSAxNDguNDcyIDExMS4xNjkgMTU1LjIwN0wyOTkuODM3IDM0My44MDVMNDg4LjUwNCAxNTUuMDI1QzQ4My43NjkgMTQ4LjQ3MSA0NzguMTI0IDE0MS43MzYgNDcyLjExNCAxMzUuNzI4Wk0zMDAuMDE5IDkyLjk0NzdDMzU1Ljc0NSA5Mi45NDc3IDQwNy40NjUgMTE0LjQyOSA0NDYuMjU1IDE1My41NjlMMzAwLjAxOSAyOTkuNzUxTDE1My43ODMgMTUzLjU2OUMxOTIuNzU1IDExNC40MjkgMjQ0LjI5MyA5Mi45NDc3IDMwMC4wMTkgOTIuOTQ3N1oiIGZpbGw9IiMwNDc5NUIiLz4KPC9zdmc+Cg==',
  },
  '137': {
    symbol: 'MATIC',
    name: 'Polygon',
    slug: 'polygon',
    block_explorer_url: 'https://polygonscan.com/',
    logo: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTI1IiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDEyNSAxMjUiPg0KICA8ZGVmcz4NCiAgICA8Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aCI+DQogICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlXzMyIiBkYXRhLW5hbWU9IlJlY3RhbmdsZSAzMiIgd2lkdGg9IjEyNSIgaGVpZ2h0PSIxMjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM4NSAzNDUpIiBmaWxsPSIjZmZmIi8+DQogICAgPC9jbGlwUGF0aD4NCiAgPC9kZWZzPg0KICA8ZyBpZD0iZmF2aWNvbiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTM4NSAtMzQ1KSI+DQogICAgPGcgaWQ9Ik1hc2tfR3JvdXBfMyIgZGF0YS1uYW1lPSJNYXNrIEdyb3VwIDMiIGNsaXAtcGF0aD0idXJsKCNjbGlwLXBhdGgpIj4NCiAgICAgIDxwYXRoIGlkPSJQYXRoXzE1MSIgZGF0YS1uYW1lPSJQYXRoIDE1MSIgZD0iTTkxLjQ4NywzMS44NWE3Ljc5NCw3Ljc5NCwwLDAsMC03LjYwNSwwTDY2LjQzNCw0MS45N2wtMTEuODU1LDYuNkwzNy4xMzIsNTguNjlhNy44LDcuOCwwLDAsMS03LjYwNSwwTDE1LjY1OCw1MC43N2E3LjU2Niw3LjU2NiwwLDAsMS0zLjgtNi4zOFYyOC43N2E3LjExNCw3LjExNCwwLDAsMSwzLjgtNi4zOGwxMy42NDUtNy43YTcuOCw3LjgsMCwwLDEsNy42MDUsMGwxMy42NDUsNy43YTcuNTY2LDcuNTY2LDAsMCwxLDMuOCw2LjM4VjM4Ljg5bDExLjg1NS02LjgyVjIxLjk1YTcuMTE0LDcuMTE0LDAsMCwwLTMuOC02LjM4TDM3LjEzMiwxLjA1MWE3LjgsNy44LDAsMCwwLTcuNjA1LDBMMy44LDE1LjU3MUE3LjExNCw3LjExNCwwLDAsMCwwLDIxLjk1VjUxLjIxYTcuMTE0LDcuMTE0LDAsMCwwLDMuOCw2LjM4bDI1LjcyNCwxNC41MmE3LjgsNy44LDAsMCwwLDcuNjA1LDBsMTcuNDQ3LTkuOSwxMS44NTUtNi44MiwxNy40NDgtOS45YTcuNzk0LDcuNzk0LDAsMCwxLDcuNjA1LDBsMTMuNjQ1LDcuN2E3LjU2Nyw3LjU2NywwLDAsMSwzLjgsNi4zOHYxNS42MmE3LjExNCw3LjExNCwwLDAsMS0zLjgsNi4zOGwtMTMuNjQ1LDcuOTJhNy44LDcuOCwwLDAsMS03LjYwNSwwbC0xMy42NDUtNy43YTcuNTY3LDcuNTY3LDAsMCwxLTMuOC02LjM4VjY1LjI4OWwtMTEuODU1LDYuODJ2MTAuMTJhNy4xMTQsNy4xMTQsMCwwLDAsMy44LDYuMzhsMjUuNzI0LDE0LjUyYTcuOCw3LjgsMCwwLDAsNy42MDUsMGwyNS43MjQtMTQuNTJhNy41NjcsNy41NjcsMCwwLDAsMy44LTYuMzhWNTIuOTdhNy4xMTQsNy4xMTQsMCwwLDAtMy44LTYuMzhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzODcgMzU0LjkzOSkiIGZpbGw9IiM4MjQ3ZTUiLz4NCiAgICA8L2c+DQogIDwvZz4NCjwvc3ZnPg0K',
  },
  // "43114": {
  //     symbol: "AVAX",
  //     name: "Avalanche C Chain",
  //     slug: "avalanche",
  //     block_explorer_url: "https://snowtrace.io/"
  // }
}
