import { Meta, Story } from '@storybook/react/types-6-0'

import { CustomButton, CustomButtonProps } from '@/components/common/CustomButton'

export default {
  title: 'Component/CustomButton',
  component: CustomButton,
} as Meta

export const CustomButtonStory: Story<CustomButtonProps> = (args) => (
  <CustomButton variant="contained" color="primary" {...args}>
    Custom Button
  </CustomButton>
)

CustomButtonStory.args = {
  loading: false,
}
