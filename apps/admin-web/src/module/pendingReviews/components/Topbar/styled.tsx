import { styled } from '@mui/material'

export const GenEdTableHeaderContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '160px 70px 280px 1fr',
  borderBottom: '2px solid #e5e7eb',
  columnGap: '30px',
  alignItems: 'center',
  justifyItems: 'center',
  padding: '16px 88px 16px 24px',
  fontStyle: 'normal',
  fontWeight: '700',
  fontSize: '16px',
})

export const TopbarContainer = styled(`div`)({
  display: 'flex',
  justifyContent: 'space-between',
  alignContent: 'center',
  padding: '36px 24px',
  backgroundColor: '#F2F5F8',
})

export const LeftContainer = styled(`div`)({
  display: 'flex',
  columnGap: '24px',
  justifyContent: 'space-between',
  alignContent: 'center',
})

export const RightContainer = styled(`div`)({
  display: 'flex',
  columnGap: '24px',
  alignContent: 'center',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
})
