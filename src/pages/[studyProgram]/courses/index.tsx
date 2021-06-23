import { useContext, useState } from 'react'
import { Box, Stack as MuiStack, Typography } from '@material-ui/core'
import { CourseList } from '@/components/CourseList'
import { SearchField } from '@/components/SearchField'
import { FilterIconButton } from '@/components/FilterIconButton'
import { SelectedCoursesButton } from '@/components/SelectedCoursesButton'
import { CourseSearchContext } from '@/context/CourseSearch'
import { FilterBar } from '@/components/FilterBar'
import styled from '@emotion/styled'
import { TagList } from '@/components/TagList'

const Stack = styled(MuiStack)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`

const StickyStack = styled(Stack)`
  position: sticky;
  top: 32px;
  z-index: 10;

  button {
    background: ${({ theme }) => theme.palette.background.default};
  }
`

function CourseSearchPage() {
  const [openFilterBar, setOpenFilterBar] = useState(false)

  return (
    <Box padding="2em">
      <Stack spacing={2} direction="row">
        <Typography variant="h2">ค้นหาวิชาเรียน</Typography>
      </Stack>
      <StickyStack spacing={2} direction="row">
        <SearchField />
        <FilterIconButton onClick={() => setOpenFilterBar((open) => !open)} />
        <SelectedCoursesButton />
      </StickyStack>
      <TagList />
      <Stack spacing={3} direction="row">
        <CourseList />
        {openFilterBar && <FilterBar />}
      </Stack>
    </Box>
  )
}

export default CourseSearchPage
