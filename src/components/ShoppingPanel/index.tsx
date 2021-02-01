import Course from './Course'
import { useTranslation } from 'react-i18next'
import { Button, Typography, makeStyles } from '@material-ui/core'
import useShoppingPanel from '@/hooks/useShoppingPanel.ts'
import { GenEd } from '@/utils/types'
import TableChartIcon from '@material-ui/icons/TableChart'

const mockData = [
  {
    id: 12345,
    name: 'URBAN ENVIRONMENT',
    credit: 2,
    category: GenEd.HU,
  },
  {
    id: 123445,
    name: 'URBAN ENVIRONMENT',
    credit: 1,
    category: null,
  },
  {
    id: 43241234,
    name: 'JAPANESE DESIGN CONCEPT',
    credit: 3,
    category: GenEd.HU,
  },
]

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(6.25, 5.625, 3.75, 5.625),
    backgroundColor: 'white',
    width: '100%',
    maxWidth: theme.breakpoints.values.sm,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  course: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  makeScheduleButton: {
    marginTop: theme.spacing(8.25),
  },
  makeScheduleText: {
    marginLeft: theme.spacing(1.25),
  },
}))

const ShoppingPanel = () => {
  const { credit, courses, deleteCourse, makeSchedule } = useShoppingPanel(mockData)
  const { t } = useTranslation()
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Typography variant="h4">{t('shoppingPanel:selectedCourse')}</Typography>
        <Typography variant="h6"> {t('shoppingPanel:total') + ` ${credit} ` + t('shoppingPanel:credit')}</Typography>
      </div>
      <div>
        <Typography className={classes.course} variant="h6">
          {t('shoppingPanel:genedCourse')}
        </Typography>
        {courses.map((course) => {
          return course.category && <Course course={course} key={course.id} deleteCourse={deleteCourse} />
        })}
      </div>
      <div>
        <Typography className={classes.course} variant="h6">
          {t('shoppingPanel:otherCourse')}
        </Typography>
        {courses.map((course) => {
          return !course.category && <Course course={course} key={course.id} deleteCourse={deleteCourse} />
        })}
      </div>
      <div className={classes.makeScheduleButton}>
        <Button fullWidth variant="contained" color="primary" onClick={makeSchedule}>
          <TableChartIcon></TableChartIcon>
          <div className={classes.makeScheduleText}>
            <Typography variant="button">{t('shoppingPanel:makeSchedule')}</Typography>
          </div>
        </Button>
      </div>
    </div>
  )
}

export default ShoppingPanel
