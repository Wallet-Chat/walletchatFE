import { ChainObjectType } from "./types/Chain";

export const currencyList = [
    {"name":"US Dollar","code":"USD","symbol":"$"},
    {"name":"Australian Dollar","code":"AUD","symbol":"$"},
    {"name":"Brazilian Real","code":"BRL","symbol":"R$"},
    {"name":"Canadian Dollar","code":"CAD","symbol":"$"},
    {"name":"Chinese Yuan","code":"CNY","symbol":"¥"},
    {"name":"Czech Republic Koruna","code":"CZK","symbol":"Kč"},
    {"name":"Euro","code":"EUR","symbol":"€"},
    {"name":"Israeli New Sheqel","code":"ILS","symbol":"₪"},
    {"name":"Japanese Yen","code":"JPY","symbol":"¥"},
    {"name":"Malaysian Ringgit","code":"MYR","symbol":"RM"},
    {"name":"New Zealand Dollar","code":"NZD","symbol":"$"},
    {"name":"Philippine Peso","code":"PHP","symbol":"₱"},
    {"name":"Russian Ruble","code":"RUB","symbol":"₽"},
    {"name":"Singapore Dollar","code":"SGD","symbol":"$"},
    {"name":"Swiss Franc","code":"CHF","symbol":"CHf"},
    {"name":"Thai Baht","code":"THB","symbol":"฿"},
];

export const chains: ChainObjectType = {
    "1": {
        symbol: "ETH",
        name: "Ethereum",
        slug: "ethereum",
        block_explorer_url: "https://etherscan.io/",
        logo: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPCEtLSBDcmVhdG9yOiBDb3JlbERSQVcgMjAxOSAoNjQtQml0KSAtLT4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZlcnNpb249IjEuMSIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIKdmlld0JveD0iMCAwIDc4NC4zNyAxMjc3LjM5IgogeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiB4bWxuczp4b2RtPSJodHRwOi8vd3d3LmNvcmVsLmNvbS9jb3JlbGRyYXcvb2RtLzIwMDMiPgogPGcgaWQ9IkxheWVyX3gwMDIwXzEiPgogIDxtZXRhZGF0YSBpZD0iQ29yZWxDb3JwSURfMENvcmVsLUxheWVyIi8+CiAgPGcgaWQ9Il8xNDIxMzk0MzQyNDAwIj4KICAgPGc+CiAgICA8cG9seWdvbiBmaWxsPSIjMzQzNDM0IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHBvaW50cz0iMzkyLjA3LDAgMzgzLjUsMjkuMTEgMzgzLjUsODczLjc0IDM5Mi4wNyw4ODIuMjkgNzg0LjEzLDY1MC41NCAiLz4KICAgIDxwb2x5Z29uIGZpbGw9IiM4QzhDOEMiIGZpbGwtcnVsZT0ibm9uemVybyIgcG9pbnRzPSIzOTIuMDcsMCAtMCw2NTAuNTQgMzkyLjA3LDg4Mi4yOSAzOTIuMDcsNDcyLjMzICIvPgogICAgPHBvbHlnb24gZmlsbD0iIzNDM0MzQiIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjM5Mi4wNyw5NTYuNTIgMzg3LjI0LDk2Mi40MSAzODcuMjQsMTI2My4yOCAzOTIuMDcsMTI3Ny4zOCA3ODQuMzcsNzI0Ljg5ICIvPgogICAgPHBvbHlnb24gZmlsbD0iIzhDOEM4QyIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjM5Mi4wNywxMjc3LjM4IDM5Mi4wNyw5NTYuNTIgLTAsNzI0Ljg5ICIvPgogICAgPHBvbHlnb24gZmlsbD0iIzE0MTQxNCIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjM5Mi4wNyw4ODIuMjkgNzg0LjEzLDY1MC41NCAzOTIuMDcsNDcyLjMzICIvPgogICAgPHBvbHlnb24gZmlsbD0iIzM5MzkzOSIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjAsNjUwLjU0IDM5Mi4wNyw4ODIuMjkgMzkyLjA3LDQ3Mi4zMyAiLz4KICAgPC9nPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg=="
    },
    "137": {
        symbol: "MATIC",
        name: "Polygon",
        slug: "polygon",
        block_explorer_url: "https://polygonscan.com/" ,
        logo: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTI1IiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDEyNSAxMjUiPg0KICA8ZGVmcz4NCiAgICA8Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aCI+DQogICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlXzMyIiBkYXRhLW5hbWU9IlJlY3RhbmdsZSAzMiIgd2lkdGg9IjEyNSIgaGVpZ2h0PSIxMjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM4NSAzNDUpIiBmaWxsPSIjZmZmIi8+DQogICAgPC9jbGlwUGF0aD4NCiAgPC9kZWZzPg0KICA8ZyBpZD0iZmF2aWNvbiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTM4NSAtMzQ1KSI+DQogICAgPGcgaWQ9Ik1hc2tfR3JvdXBfMyIgZGF0YS1uYW1lPSJNYXNrIEdyb3VwIDMiIGNsaXAtcGF0aD0idXJsKCNjbGlwLXBhdGgpIj4NCiAgICAgIDxwYXRoIGlkPSJQYXRoXzE1MSIgZGF0YS1uYW1lPSJQYXRoIDE1MSIgZD0iTTkxLjQ4NywzMS44NWE3Ljc5NCw3Ljc5NCwwLDAsMC03LjYwNSwwTDY2LjQzNCw0MS45N2wtMTEuODU1LDYuNkwzNy4xMzIsNTguNjlhNy44LDcuOCwwLDAsMS03LjYwNSwwTDE1LjY1OCw1MC43N2E3LjU2Niw3LjU2NiwwLDAsMS0zLjgtNi4zOFYyOC43N2E3LjExNCw3LjExNCwwLDAsMSwzLjgtNi4zOGwxMy42NDUtNy43YTcuOCw3LjgsMCwwLDEsNy42MDUsMGwxMy42NDUsNy43YTcuNTY2LDcuNTY2LDAsMCwxLDMuOCw2LjM4VjM4Ljg5bDExLjg1NS02LjgyVjIxLjk1YTcuMTE0LDcuMTE0LDAsMCwwLTMuOC02LjM4TDM3LjEzMiwxLjA1MWE3LjgsNy44LDAsMCwwLTcuNjA1LDBMMy44LDE1LjU3MUE3LjExNCw3LjExNCwwLDAsMCwwLDIxLjk1VjUxLjIxYTcuMTE0LDcuMTE0LDAsMCwwLDMuOCw2LjM4bDI1LjcyNCwxNC41MmE3LjgsNy44LDAsMCwwLDcuNjA1LDBsMTcuNDQ3LTkuOSwxMS44NTUtNi44MiwxNy40NDgtOS45YTcuNzk0LDcuNzk0LDAsMCwxLDcuNjA1LDBsMTMuNjQ1LDcuN2E3LjU2Nyw3LjU2NywwLDAsMSwzLjgsNi4zOHYxNS42MmE3LjExNCw3LjExNCwwLDAsMS0zLjgsNi4zOGwtMTMuNjQ1LDcuOTJhNy44LDcuOCwwLDAsMS03LjYwNSwwbC0xMy42NDUtNy43YTcuNTY3LDcuNTY3LDAsMCwxLTMuOC02LjM4VjY1LjI4OWwtMTEuODU1LDYuODJ2MTAuMTJhNy4xMTQsNy4xMTQsMCwwLDAsMy44LDYuMzhsMjUuNzI0LDE0LjUyYTcuOCw3LjgsMCwwLDAsNy42MDUsMGwyNS43MjQtMTQuNTJhNy41NjcsNy41NjcsMCwwLDAsMy44LTYuMzhWNTIuOTdhNy4xMTQsNy4xMTQsMCwwLDAtMy44LTYuMzhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzODcgMzU0LjkzOSkiIGZpbGw9IiM4MjQ3ZTUiLz4NCiAgICA8L2c+DQogIDwvZz4NCjwvc3ZnPg0K"
    },
    // "43114": {
    //     symbol: "AVAX",
    //     name: "Avalanche C Chain",
    //     slug: "avalanche",
    //     block_explorer_url: "https://snowtrace.io/"
    // }
}