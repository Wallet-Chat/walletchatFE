import {
   extendTheme,
   withDefaultColorScheme,
   ThemeConfig,
} from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/700.css'

const breakpoints = createBreakpoints({
   sm: '300px',
   md: '650px',
   lg: '900px',
   xl: '1200px',
   '2xl': '1536px',
})

const config: ThemeConfig = {
   initialColorMode: 'light',
   useSystemColorMode: false,
}

export const theme = extendTheme(
   {
      config,
      breakpoints,
      fonts: {
         heading:
            'Roboto, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
         body: 'Roboto, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
         code: '"Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace',
      },
      fontSizes: {
         xs: '0.70rem',
         sm: '0.75rem',
         md: '.875rem',
         lg: '1rem',
         xl: '1.125rem',
         '2xl': '1.25rem',
         '3xl': '1.5rem',
         '4xl': '1.875rem',
         '5xl': '2.25rem',
         '6xl': '3rem',
         '7xl': '3.75rem',
         '8xl': '4.5rem',
         '9xl': '6rem',
      },
      styles: {
         global: {
            body: {
               pos: 'relative',
               initialColorMode: 'light',
               bg: 'utility.light80',
               color: 'black',
               minHeight: '100vh',
            },
         },
      },
      colors: {
         success: {
            100: '#EBFCD5',
            200: '#D4F9AC',
            300: '#B1EE80',
            400: '#8FDE5D',
            500: '#5FC92E',
            600: '#44AC21',
            700: '#2D9017',
            800: '#1A740E',
            900: '#0D6008',
         },
         information: {
            100: '#D3E5FE',
            200: '#A7C9FD',
            300: '#7BA8F9',
            400: '#598CF4',
            500: '#2561ED',
            600: '#1B4ACB',
            700: '#1236AA',
            800: '#0B2589',
            900: '#071971',
         },
         warning: {
            100: '#FFF5CE',
            200: '#FFE89E',
            300: '#FFD76D',
            400: '#FFC749',
            500: '#FFAD0D',
            600: '#DB8C09',
            700: '#B76F06',
            800: '#935404',
            900: '#7A4102',
         },
         error: {
            100: '#FFE3D6',
            200: '#FFC0AD',
            300: '#FF9783',
            400: '#FF6F65',
            500: '#FF3236',
            600: '#DB2438',
            700: '#B71938',
            800: '#930F35',
            900: '#7A0933',
         },
         lightgray: {
            100: '#FAFAFB',
            200: '#F5F6F7',
            300: '#EEEFF2',
            400: '#E2E4E8',
            500: '#CACDD5',
            600: '#B2B7C2',
            700: '#A4A9B6',
            800: '#959CAB',
            900: '#8C93A3',
         },
         darkgray: {
            100: '#747c90',
            200: '#656E85',
            300: '#5C657D',
            400: '#525C76',
            500: '#49536E',
            600: '#3A4662',
            700: '#2C3857',
            800: '#192648',
            900: '#0F1D40',
         },
      },
      space: {
         micro: '4px',
         xs: '8px',
         small: '12px',
         medium: '16px',
         large: '24px',
         xl: '40px',
         xxl: '64px',
         jumbo: '128px',
         4: '1rem',
         5: '1.25rem',
         6: '1.5rem',
         7: '1.75rem',
         8: '2rem',
         9: '2.25rem',
         10: '2.5rem',
         12: '3rem',
         14: '3.5rem',
         16: '4rem',
         20: '5rem',
         24: '6rem',
         28: '7rem',
         32: '8rem',
         36: '9rem',
         40: '10rem',
         44: '11rem',
         48: '12rem',
         52: '13rem',
         56: '14rem',
         60: '15rem',
         64: '16rem',
         72: '18rem',
         80: '20rem',
         96: '24rem',
      },
      components: {
         Divider: {
            baseStyle: {
               borderColor: 'lightgray.400',
               opacity: 1,
            },
         },
         Badge: {
            variants: {
               black: {
                  background: 'darkgray.800',
                  color: 'lightgray.200'
               }
            }
         },
         Text: {
            variants: {
               micro: {
                  fontSize: '0.5rem',
                  color: 'lightgray.400',
                  fontWeight: 'semibold',
               },
               caption: {
                  fontSize: '0.75rem',
                  color: 'lightgray.400',
                  fontWeight: 'semibold',
               },
               body4: {
                  fontSize: '1rem',
                  color: 'lightgray.700',
                  fontWeight: 'semibold',
               },
               body3: {
                  fontSize: '1.25rem',
                  color: 'lightgray.700',
                  fontWeight: 'semibold',
               },
               body2: {
                  fontSize: '1.5rem',
                  color: 'lightgray.900',
                  fontWeight: 'semibold',
               },
               body1: {
                  fontSize: '1.75rem',
                  color: 'lightgray.900',
                  fontWeight: 'semibold',
               },
            },
         },
         Heading: {
            variants: {
               subheader: {
                  color: 'lightgray.400',
                  fontWeight: 'semibold',
                  fontSize: '1.5rem',
                  letterSpacing: '4px',
               },
               header6: {
                  fontSize: '1.25rem',
                  fontWeight: 'semibold',
                  color: 'lightgray.900',
               },
               header5: {
                  fontSize: '1.5rem',
                  fontWeight: 'semibold',
                  color: 'lightgray.900',
               },
               header4: {
                  fontSize: '1.75rem',
                  fontWeight: 'semibold',
                  color: 'lightgray.900',
               },
               header3: {
                  fontSize: '2rem',
                  fontWeight: 'semibold',
                  color: 'lightgray.900',
               },
               header2: {
                  fontSize: '2.25rem',
                  fontWeight: 'semibold',
                  color: 'lightgray.900',
               },
               header1: {
                  fontSize: '2.5rem',
                  fontWeight: 'semibold',
                  color: 'lightgray.900',
               },
               big2: {
                  fontSize: '4rem',
                  fontWeight: 'semibold',
                  color: 'lightgray.900',
               },
               big1: {
                  fontSize: '5rem',
                  fontWeight: 'semibold',
                  color: 'lightgray.900',
               },
               huge: {
                  fontSize: '8rem',
                  fontWeight: 'extrabold',
               },
            },
         },
         Button: {
            baseStyle: {
               fontWeight: 'normal',
               _hover: {
                  boxShadow: '0px 0px 0px 1px var(--chakra-colors-darkgray-100)',
                  _disabled: {
                     boxShadow: 'none'
                  }
               },
            },
            variants: {
               success: {
                  bg: 'success.700',
                  color: 'white',
                  _hover: { bg: 'success.600' },
               },
               info: {
                  bg: 'info.700',
                  color: 'white',
                  _hover: { bg: 'info.600' },
               },
               danger: {
                  bg: 'danger.700',
                  color: 'white',
                  _hover: { bg: 'danger.600' },
               },
               warning: {
                  bg: 'warning.700',
                  color: 'white',
                  _hover: { bg: 'warning.600' },
               },
               lightgray: {
                  bg: 'lightgray.300',
                  color: 'darkgray.600',
                  _hover: {
                     bg: 'lightgray.400',
                     _disabled: {
                        bg: 'lightgray.400'
                     },
                  }
               },
               black: {
                  bg: 'black',
                  color: 'white',
                  _hover: {
                     bg: 'darkgray.900',
                     _disabled: {
                        bg: 'darkgray.900',
                     },
                  },
               },
               white: {
                  bg: 'white',
                  color: 'darkgray.800',
                  _hover: { bg: 'lightgray.200' },
               },
               outline: {
                  borderColor: 'darkgray.400'
               },
               morePadding: {
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 6,
                  paddingBottom: 6,
               },
            },
         },
      },
   },
   withDefaultColorScheme({ colorScheme: 'gray' })
)
