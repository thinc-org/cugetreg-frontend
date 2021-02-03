import { Button, makeStyles } from '@material-ui/core'
import { FlexContainer } from '../FlexContainer'
import chevronUp from '@/assets/images/chevronUp.svg'
import React from 'react'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  button: {
    ...theme.typography.subtitle1,
    color: theme.palette.primaryRange['100'],
  },
  buttonContainer: {
    position: 'absolute',
    top: 0,
    padding: theme.spacing(2.5, 5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  logo: {
    marginLeft: theme.spacing(2),
  },
}))

export function TopButton() {
  const { t } = useTranslation()
  const classes = useStyles()

  const scrollToTop = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }

  return (
    <FlexContainer className={classes.buttonContainer}>
      <Button className={classes.button} onClick={scrollToTop}>
        {t('footer:topButton')}
        <a className={classes.logo}>
          <img src={chevronUp} />
        </a>
      </Button>
    </FlexContainer>
  )
}
