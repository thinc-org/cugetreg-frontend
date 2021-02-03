import ShoppingPanel from '@/components/ShoppingPanel'
import { mockData } from './mockData'
import { Meta } from '@storybook/react/types-6-0'

export default {
  title: 'Component/ShoppingPanel',
  component: ShoppingPanel,
} as Meta

export const ShoppingPanelStory = () => <ShoppingPanel data={mockData} />
