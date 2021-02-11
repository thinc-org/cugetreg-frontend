import { OnSubmit } from '@/components/AnnouncementSearch'
import { GenEdType } from '@thinc-org/chula-courses'
import { useState } from 'react'
import Fuse from 'fuse.js'
import { ALL_CATEGORIES, ALL_FACULTIES, FACULTIES, CATAGORIES, mockAnnouncements } from './const'

import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'

export type TagType = GenEdType | 'open' | 'close' | 'chula' | 'other'

export interface Announcement {
  _id: string
  title: string
  description: string
  content: string
  date: Date
  tags: TagType[]
  faculties: string[]
  thumbnail: string
}

const useAnnouncement = () => {
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>(mockAnnouncements)

  const search: OnSubmit = (keyword, date, category, faculty) => {
    let filtered = mockAnnouncements.filter((announcement) => {
      const dateMatch = date === null || differenceInCalendarDays(announcement.date, date) === 0
      const categoryMatch = category == ALL_CATEGORIES || announcement.tags.includes(category)
      const facultyMatch = faculty == ALL_FACULTIES || announcement.faculties.includes(faculty)
      return dateMatch && categoryMatch && facultyMatch
    })

    if (keyword.length !== 0) {
      const options = {
        keys: ['title', 'description', 'content'],
      }
      const fuse = new Fuse(filtered, options)
      filtered = fuse.search(keyword).map((item) => item.item)
    }

    setFilteredAnnouncements(filtered)
  }

  return { announcements: filteredAnnouncements, search, categories: CATAGORIES, faculties: FACULTIES }
}

export default useAnnouncement
