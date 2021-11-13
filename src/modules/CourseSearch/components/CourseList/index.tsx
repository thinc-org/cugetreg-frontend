import { Stack } from '@mui/material'
import React from 'react'

import { Error } from '@/common/components/Error'
import { Loading } from '@/modules/CourseSearch/components/Loading'

import { Courses } from './components/Courses'
import { useCourseList } from './hooks'

export interface CourseListProps {}

export const CourseList: React.FC<CourseListProps> = () => {
  const { courses, loading, error } = useCourseList()

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Courses loading={loading} courses={courses} />
      <Loading loading={loading} />
      {error && <Error message={error.message} />}
    </Stack>
  )
}
