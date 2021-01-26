import { Box } from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import CourseLabel from '@/components/ShoppingPanel/CourseLabel'

interface PropsType {
  course: {
    id: number
    name: string
    credit: number
    color: string
    category: string | null
  }
}

const CourseList = (props: PropsType) => {
  const { id, name, credit, color, category } = props.course
  return (
    <Box display="flex" alignItems="center" my={0.5} width={1}>
      <Box display="flex" alignItems="center" justifyContent="space-between" width={3 / 4}>
        <Box mr={0.5} color="gray">
          <Delete />
        </Box>
        <Box mx={0.5}>{id}</Box>
        <Box mx={0.5}>{name}</Box>
        <Box mx={0.5}>{credit} Credits</Box>
      </Box>

      <Box display="flex" justifyContent="center" width={1 / 4} ml={0.5}>
        <CourseLabel color={color} category={category} />
      </Box>
    </Box>
  )
}

export default CourseList
