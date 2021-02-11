import { ALL_CATEGORIES, ALL_FACULTIES } from '@/utils/const'
import { CategorySearchTag } from '@/utils/type'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import { FormEvent, useState } from 'react'
import { OnSubmit } from '.'

const useAnnouncementSearch = (onSubmit: OnSubmit) => {
  const [keyword, setKeyword] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [category, setCategory] = useState<CategorySearchTag>(ALL_CATEGORIES)
  const [faculty, setFaculty] = useState<string>(ALL_FACULTIES)

  const handleDateChange = (date: MaterialUiPickersDate) => {
    setDate(new Date(date || ''))
  }
  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setCategory(e.target.value as CategorySearchTag)
  }

  const handleFacultyChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFaculty(e.target.value as string)
  }

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(keyword, date, category, faculty)
  }

  return {
    keyword,
    date,
    category,
    faculty,
    handleDateChange,
    handleCategoryChange,
    handleFacultyChange,
    handleKeywordChange,
    submit,
  }
}

export default useAnnouncementSearch
