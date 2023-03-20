import styled from 'styled-components'

export const DottedBackground = styled.div.attrs(
  (props: { overflow?: string }) => ({
    overflow: props.overflow || 'scroll',
  })
)`
  flex-grow: 1;
  width: 100%;
  height: auto;
  background: linear-gradient(
        90deg,
        var(--chakra-colors-lightgray-200) 14px,
        transparent 1%
      )
      center,
    linear-gradient(var(--chakra-colors-lightgray-200) 14px, transparent 1%)
      center,
    #9dadc3 !important;
  background-size: 15px 15px !important;
  background-position: top left !important;
  padding: var(--chakra-space-1);
  overflow-y: ${(props) => props.overflow};
`
