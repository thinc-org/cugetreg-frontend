import { Box, Grid, makeStyles, useTheme, Typography } from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import CourseLabel from '@/components/ShoppingPanel/CourseLabel'
import { lightTheme } from '@/configs/theme'

interface PropsType {
  course: {
    id: number
    name: string
    credit: number
    color: string
    category: string | null
  }
  deleteCourse: (id: number) => void
}
const useStyles = makeStyles({
  root: {
    cursor: 'pointer',
  },
})

const Course = ({ course: { id, name, credit, color, category }, deleteCourse }: PropsType) => {
  const classes = useStyles()
  const TRASH_ICON_COLOR = lightTheme.palette.primaryRange[100]

  return (
    <Box my={1}>
      <Grid container alignItems="center">
        <Grid item xs={1} sm={1}>
          <Box color={TRASH_ICON_COLOR} display="flex" justifyContent="start" alignItems="center">
            <Delete onClick={() => deleteCourse(id)} className={classes.root} />
          </Box>
        </Grid>
        <Grid item xs={5} sm={2}>
          <Typography variant="body1">{id}</Typography>
        </Grid>
        <Grid item xs={6} sm={5}>
          <Typography variant="body1">{name}</Typography>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Typography variant="body1">{credit} Credits</Typography>
        </Grid>
        <Grid item={true} container xs={6} sm={2}>
          <CourseLabel color={color} category={category} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Course
