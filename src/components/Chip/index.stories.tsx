import React from 'react'
import Chip from '.'
import { Meta } from '@storybook/react/types-6-0'
import { text, select, withKnobs } from '@storybook/addon-knobs'
import { ThemeProvider } from '@material-ui/core'
import { lightTheme } from '@/configs/theme'
import { ChipShade } from './const'

export default {
  title: 'Component/Chip/Default',
  decorators: [withKnobs],
} as Meta

export const ChipStory = () => (
  <ThemeProvider theme={lightTheme}>
    <Chip
      shade={select('shade', Object.keys(ChipShade), ChipShade.primaryRange) as ChipShade}
      category={text('category', 'เปิดวิชา')}
    />
  </ThemeProvider>
)
