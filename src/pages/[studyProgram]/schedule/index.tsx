import React, { useState, createRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Typography } from '@material-ui/core'
import styled from '@emotion/styled'
import { Schedule } from '@/components/Schedule'
import { useDaysCount, useOverlappingCourses, useScheduleClass, useTimetableClasses } from '@/components/Schedule/utils'
import { ScheduleTable } from '@/components/ScheduleTable'
import { observer } from 'mobx-react'
import { Theme } from '@emotion/react'
import { courseCartStore } from '@/store'
import { ExamSchedule } from '@/components/ExamSchedule'
import SaveImgButton from '@/components/SaveImgButton'
import { useExamClasses } from '@/components/ExamSchedule/utils'
import { useCourseGroup } from '@/utils/hooks/useCourseGroup'
import Link from 'next/link'

const PageContainer = styled.div`
  padding-top: 32px;
`

const Title = styled(Typography)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`

interface ScheduleContainerProps {
  enabled: boolean
}

const ScheduleContainer = styled.div`
  ${({ enabled }: ScheduleContainerProps) => !enabled && `display: none`};

  @media (max-width: 747px) {
    overflow-x: scroll;
    overflow-y: hidden;
  }

  > div {
    overflow: visible;
    min-width: 700px;
  }
`

const InfoBar = styled.div`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 36px;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: initial;
  }
`

const ButtonBar = styled.div`
  display: flex;
  align-items: center;

  a,
  button {
    margin-right: 16px;
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-top: 16px;
    a,
    button {
      margin-right: 8px;
    }
  }
`

const InfoSpacer = styled.div`
  flex: 1;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
  }
`

const TabContainer = styled.div`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: flex;
    justify-content: center;

    > button {
      width: 50%;
    }
  }
`

type TabButtonProps = {
  current: number
  theme?: Theme
}

const TabButton = styled(Button)`
  width: 150px;
  ${({ current, theme }: TabButtonProps) => current && `background-color: ${theme?.palette.primaryRange[10]}`};
`

const ExamContainer = styled.div<{ enabled: boolean }>`
  display: ${({ enabled }) => (!enabled ? 'none' : 'block')};
`

function SchedulePage() {
  const { t } = useTranslation('schedulePage')
  const shopItems = courseCartStore.shopItems
  const classes = useTimetableClasses(shopItems)
  const scheduleClasses = useScheduleClass(classes)
  const daysCount = useDaysCount(scheduleClasses)
  const { midtermClasses, finalClasses } = useExamClasses(shopItems)
  const overlappingCourses = useOverlappingCourses(scheduleClasses, midtermClasses, finalClasses)

  const [isExamTable, setExamTable] = useState(false)
  const credits = shopItems.reduce((credits, item) => credits + item.credit, 0)
  const ref = createRef<HTMLDivElement>()

  const { studyProgram } = useCourseGroup()

  return (
    <PageContainer>
      <TitleContainer>
        <Title variant="h2">{t('title')}</Title>
        <TabContainer>
          <TabButton
            current={isExamTable ? 1 : 0}
            onClick={() => setExamTable(false)}
            variant={!isExamTable ? 'contained' : undefined}
            color={!isExamTable ? 'primary' : undefined}
          >
            {t('classSchedule')}
          </TabButton>
          <TabButton
            current={!isExamTable ? 1 : 0}
            onClick={() => setExamTable(true)}
            variant={isExamTable ? 'contained' : undefined}
            color={isExamTable ? 'primary' : undefined}
          >
            {t('examSchedule')}
          </TabButton>
        </TabContainer>
      </TitleContainer>
      <ScheduleContainer enabled={!isExamTable}>
        <div ref={ref}>
          <Schedule classes={scheduleClasses} daysCount={daysCount} />
        </div>
      </ScheduleContainer>
      <ExamContainer enabled={isExamTable}>
        <ExamSchedule midtermClasses={midtermClasses} finalClasses={finalClasses} />
      </ExamContainer>
      <InfoBar>
        <div style={{ display: 'flex' }}>
          <Typography variant="subtitle1" style={{ marginRight: 16 }}>
            {t('sumCreditsDesc')}
          </Typography>
          <Typography variant="h6">{t('sumCredits', { credits })}</Typography>
        </div>
        <InfoSpacer />
        <ButtonBar>
          <SaveImgButton imageRef={ref} />
          <Button variant="outlined">{t('addToCalendar')}</Button>
          <Link href={`/${studyProgram}/schedule/cr11`} passHref>
            <Button style={{ marginRight: 0 }} variant="outlined">
              {t('showCR11')}
            </Button>
          </Link>
        </ButtonBar>
      </InfoBar>
      <ScheduleTable courseCart={courseCartStore} overlappingCourses={overlappingCourses} />
    </PageContainer>
  )
}

export default observer(SchedulePage)
