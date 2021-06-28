import { collectLogEvent } from '@/utils/network/logging'
import { Course } from '@thinc-org/chula-courses'
import { action, computed, makeObservable, observable } from 'mobx'
import { computedFn } from 'mobx-utils'

export interface CourseCartItem extends Course {
  selectedSectionNo: string
  isSelected: boolean
  isHidden: boolean
}

export type CourseCartState = 'default' | 'delete'

export interface CourseCartProps {
  shopItems: CourseCartItem[]
  state: CourseCartState
}

export class CourseCart implements CourseCartProps {
  @observable shopItems: CourseCartItem[] = []
  @observable state: CourseCartState = 'default'
  @observable isInitialized = false
  @observable isInitializedLocal = false

  constructor() {
    makeObservable(this)
  }

  /**
   * Use to find the first section of given course
   * @param {Course} course - the chula's course
   */
  private findFirstSectionNo(course: Course) {
    const sections = course.sections.sort((sectionA, sectionB) => (sectionA.sectionNo < sectionB.sectionNo ? -1 : 1))
    return sections[0].sectionNo
  }

  /**
   * Use to convert CourseCartItem to Course
   * @param shopItem - the store's item
   */
  private convertToCourse(shopItem: CourseCartItem): Course {
    const { selectedSectionNo, isSelected, ...rest } = shopItem // eslint-disable-line
    return rest
  }

  /**
   * Use to get the shopping item by given courseNo.
   * @param courseNo - the unique course number
   */
  item = computedFn((courseNo: string): CourseCartItem | undefined => {
    const foundIndex = this.shopItems.findIndex((item) => item.courseNo == courseNo)
    if (foundIndex != -1) return this.shopItems[foundIndex]
    return undefined
  })

  /**
   * Use to add interested course to the store
   * @param course - the chula's course
   * @param selectedSectionNo - the selected section of the course
   */
  @action
  addItem(course: Course, selectedSectionNo?: string) {
    // TO DO: remove and use analytics instead
    collectLogEvent({
      kind: 'track',
      message: 'user add course',
    })

    if (this.currentProgram !== null && course.studyProgram !== this.currentProgram) {
      return false
    }

    if (!selectedSectionNo) selectedSectionNo = this.findFirstSectionNo(course)
    const newItem: CourseCartItem = { ...course, selectedSectionNo, isSelected: false, isHidden: false }
    const foundIndex = this.shopItems.findIndex((item) => item.courseNo == course.courseNo)
    if (foundIndex != -1) this.shopItems[foundIndex] = newItem
    else this.shopItems.push(newItem)
    return true
  }

  @action
  removeCourse(course: Course): void {
    // TO DO: remove and use analytics instead
    collectLogEvent({
      kind: 'track',
      message: 'user remove course',
    })

    this.shopItems = this.shopItems.filter((item) => item.courseNo !== course.courseNo)
  }

  /**
   * Use to select or deselect the items; select for removing the item from the store.
   * @param courseNo - the unique course number
   */
  @action
  toggleSelectedItem(courseNo: string): void {
    const foundIndex = this.shopItems.findIndex((item) => item.courseNo == courseNo)
    if (foundIndex == -1) return
    this.shopItems[foundIndex].isSelected = !this.shopItems[foundIndex].isSelected
    let hasSelectedItem = false
    this.shopItems.forEach((item) => {
      hasSelectedItem = hasSelectedItem || item.isSelected
    })
    this.state = hasSelectedItem ? 'delete' : 'default'
  }

  /**
   * Use to hidden or show the items for timetable.
   * @param courseNo - the unique course number
   */
  @action
  toggleHiddenItem(courseNo: string): void {
    const foundIndex = this.shopItems.findIndex((item) => item.courseNo == courseNo)
    if (foundIndex == -1) return
    this.shopItems[foundIndex].isHidden = !this.shopItems[foundIndex].isHidden
  }

  /**
   * Use to remove all selected items
   */
  @action
  removeItems(): void {
    if (this.state === 'default') return
    this.shopItems = this.shopItems.filter((item) => item.isSelected === false)
    this.state = 'default'
  }

  /**
   * Use to swap the order of two courses
   * @param courseNoA - the unique courseA number
   * @param courseNoB - the unique courseB number
   */
  @action
  swapOrder(courseNoA: string, courseNoB: string) {
    const indexA = this.shopItems.findIndex((item) => item.courseNo == courseNoA)
    const indexB = this.shopItems.findIndex((item) => item.courseNo == courseNoB)
    if (indexA == -1 || indexB == -1) return
    const temp = this.shopItems[indexA]
    this.shopItems[indexA] = this.shopItems[indexB]
    this.shopItems[indexB] = temp
  }

  @action
  reorder(from: number, to: number) {
    const result = Array.from(this.shopItems)
    const [removed] = result.splice(from, 1)
    result.splice(to, 0, removed)
    this.shopItems = result
  }

  /**
   * get one course by the given courseNo. from the store
   * @param courseNo - the unique course number
   */
  course = computedFn((courseNo: string): Course | undefined => {
    const foundIndex = this.shopItems.findIndex((item) => item.courseNo == courseNo)
    if (foundIndex == -1) return
    return this.convertToCourse(this.shopItems[foundIndex])
  })

  /**
   * get all course from the store
   */
  @computed
  get courses(): Course[] {
    return this.shopItems.map((item) => this.convertToCourse(item))
  }

  /**
   * get all course from the store
   */
  @computed
  get currentProgram() {
    return this.shopItems[0] ? this.shopItems[0].studyProgram : null
  }
}
export const courseCartStore = new CourseCart()
