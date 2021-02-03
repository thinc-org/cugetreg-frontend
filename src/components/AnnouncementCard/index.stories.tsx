import React from 'react'
import { AnnouncementCard, AnnouncementCardPropTypes } from '.'
import { Meta, Story } from '@storybook/react/types-6-0'
import { makeStyles } from '@material-ui/core'

export default {
  title: 'Component/AnnouncementCard',
  component: AnnouncementCard,
  argTypes: {
    date: { control: 'date' },
  },
} as Meta

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    width: '100vw',
    height: '100vh',
    padding: theme.spacing(1.25),
  },
}))

export const AnnouncementCardStory: Story<AnnouncementCardPropTypes> = (args) => {
  const styles = useStyles()
  return (
    <div className={styles.root}>
      <AnnouncementCard {...args} />
    </div>
  )
}

AnnouncementCardStory.args = {
  date: new Date(),
  imageURL: 'https://foreignpolicy.com/wp-content/uploads/2020/07/Marine-Thailand-Exercise-GettyImages-1203838332.jpg',
  title: 'เปิดวิชาเรียนใหม่ 0201170 Military Science เสริมสร้างวินัยทหารในตัวคุณ',
  tags: ['เปิดวิชา1', 'เปิดวิชา2'],
  genEds: ['SO', 'HU'],
  body: 'เนื้อหาวิชา วิทยาการทหาร ยุทธศาสตร์ชาติ ประวัติศาสตร์การทหาร กองทัพบก กองทัพอากาศ กองทัพเรือ ...',
}
