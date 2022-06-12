import { DialogProps, DialogTitle, Fade, Dialog, DialogContent, Button } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'

import { ChangeEventHandler, forwardRef } from 'react'

import { ConsentMode } from '../..'
import { Consents } from '../../types'
import { SettingBlock } from '../SettingBlock'

interface CookieSettingsProps extends DialogProps {
  consents?: Consents
  setConsents: (consents: Consents) => void
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

export const CookieSettings = ({ consents, setConsents, ...props }: CookieSettingsProps) => {
  const handleConsentChange =
    (mode: ConsentMode): ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      setConsents({ ...consents, [mode]: event.target.checked })
    }

  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick') return
    setConsents({ ...consents, checked: true })
    props.onClose?.(event, 'escapeKeyDown')
  }

  return (
    <Dialog
      {...props}
      onClose={handleClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: { width: '100%', maxWidth: '500px' },
      }}
    >
      <DialogTitle variant="h4" align="center">
        ตั้งค่าความเป็นส่วนตัว
      </DialogTitle>
      <DialogContent>
        <SettingBlock title="คุกกี้ที่จำเป็น">
          คุกกี้มีความจำเป็นสำหรับการทำงานของเว็บไซต์ เพื่อให้คุณสามารถใช้ได้อย่างเป็นปกติ และเข้าชมเว็บไซต์
          คุณไม่สามารถปิดการทำงานของคุกกี้นี้ในระบบเว็บไซต์ของเราได้
        </SettingBlock>
        <SettingBlock
          title="คุกกี้โฆษณาและการตลาด"
          onChange={handleConsentChange(ConsentMode.AD_STORAGE)}
          checked={consents?.[ConsentMode.AD_STORAGE]}
        >
          คุกกี้ประเภทนี้จะทำการจัดเก็บตัวเลือกการเข้าถึงเว็บไซต์ของผู้ใช้
          เพื่อใช้เป็นพื้นฐานในการปรับแต่งหน้าของเว็บไซต์เพื่อนำเสนอโฆษณาที่เหมาะสมกับคุณมากที่สุด
          การป้องกันหรือจำกัดจำนวนครั้งที่โฆษณาจะปรากฏบนหน้าเว็บไซต์เพื่อให้สามารถประเมินประสิทธิภาพของโฆษณาได้ดียิ่งขึ้น
        </SettingBlock>
        <SettingBlock
          title="คุกกี้เพื่อการวิเคราะห์"
          onChange={handleConsentChange(ConsentMode.ANALYTICS_STORAGE)}
          checked={consents?.[ConsentMode.ANALYTICS_STORAGE]}
        >
          คุกกี้ประเภทนี้จะทำการเก็บข้อมูลการใช้งานเว็บไซต์ของคุณ เพื่อเป็นประโยชน์ในการวัดผล
          ปรับปรุงและพัฒนาประสบการณ์ที่ดีในการใช้งานเว็บไซต์ ถ้าหากท่านไม่ยินยอมให้เราใช้คุกกี้นี้เราจะไม่สามารถวัดผล
          ปรังปรุงและพัฒนาเว็บไซต์ได้
        </SettingBlock>
        <Button onClick={(event) => handleClose(event, 'escapeKeyDown')} variant="contained" fullWidth>
          ยืนยัน
        </Button>
      </DialogContent>
    </Dialog>
  )
}
