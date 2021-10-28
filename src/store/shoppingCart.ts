import { Course, Semester, StudyProgram } from '@thinc-org/chula-courses'
import { BroadcastChannel } from 'broadcast-channel'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { computedFn } from 'mobx-utils'

import { Storage } from '@/common/storage'
import { StorageKey } from '@/common/storage/constants'
import { client } from '@/services/apollo'
import { GetCourseResponse, GetCourseVars, GET_COURSE } from '@/services/apollo/query/getCourse'
import { GET_COURSE_CART, MODIFY_COURSE_CART } from '@/services/apollo/query/user'
import { collectLogEvent, collectErrorLog } from '@/services/logging'
import { userStore } from '@/store/userStore'

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

interface CourseCartStoreItem {
  studyProgram: string
  academicYear: string
  courseNo: string
  semester: string
  selectedSectionNo: string
}

export interface CourseCartStore {
  syncToStore(items: CourseCartStoreItem[]): Promise<void>
  syncFromStore(): Promise<CourseCartStoreItem[]>
  online: boolean
}

class DummyCourseCartStore implements CourseCartStore {
  online = false

  async syncFromStore() {
    return []
  }
  async syncToStore() {
    return
  }
}

class LocalStorageCourseCartStore implements CourseCartStore {
  online = false

  async syncToStore(items: CourseCartStoreItem[]) {
    new Storage('localStorage').set(StorageKey.ShoppingCart, items)
  }

  async syncFromStore() {
    return new Storage('localStorage').get<CourseCartItem[]>(StorageKey.ShoppingCart) || []
  }
}

class OnlineCourseCartStore implements CourseCartStore {
  online = true

  async syncToStore(items: CourseCartStoreItem[]) {
    await client.mutate({ mutation: MODIFY_COURSE_CART, variables: { items } })
  }

  async syncFromStore() {
    const { data } = await client.query<{ courseCart: CourseCartStoreItem[] }>({
      query: GET_COURSE_CART,
      fetchPolicy: 'network-only',
    })
    return data.courseCart
  }
}

export enum CourseCartSyncState {
  SYNCING,
  SYNCED,
  FAIL,
  OFFLINE,
}

const unknownCourse: Course = {
  studyProgram: 'S',
  semester: '1',
  academicYear: '0',
  courseNo: 'UNK',
  abbrName: 'UNK',
  courseNameTh: 'UNK',
  courseNameEn: 'UNK',
  faculty: 'UNK',
  department: 'UNK',
  credit: -1,
  creditHours: 'UNK',
  courseCondition: 'UNK',
  genEdType: 'NO',
  sections: [],
}

export class CourseCart implements CourseCartProps {
  @observable shopItems: CourseCartItem[] = []
  @observable state: CourseCartState = 'default'
  @observable source: CourseCartStore = new DummyCourseCartStore()
  @observable syncState: CourseCartSyncState = CourseCartSyncState.OFFLINE
  private channel: BroadcastChannel
  constructor() {
    const COURSE_CART_CHANGES_CHANNEL = 'coursecart-change'
    this.channel = new BroadcastChannel(COURSE_CART_CHANGES_CHANNEL)
    this.channel.onmessage = () => this.pullFromStore()

    makeObservable(this)
  }

  @action
  async upgradeSource() {
    if (userStore.accessToken !== null) {
      this.source = new OnlineCourseCartStore()
      this.syncState = CourseCartSyncState.SYNCING
    } else if (localStorage) {
      this.source = new LocalStorageCourseCartStore()
      this.syncState = CourseCartSyncState.OFFLINE
    } else {
      this.source = new DummyCourseCartStore()
      this.syncState = CourseCartSyncState.OFFLINE
    }
    await this.pullFromStore()
  }

  private async pullFromStore() {
    runInAction(() => {
      if (this.source.online) this.syncState = CourseCartSyncState.SYNCING
    })
    try {
      const courses = await this.source.syncFromStore()
      const fullCourses: (Course & { selectedSectionNo: string })[] = []
      for (const course of courses) {
        let detail
        try {
          const { data } = await client.query<GetCourseResponse, GetCourseVars>({
            query: GET_COURSE,
            variables: {
              courseNo: course.courseNo,
              courseGroup: {
                academicYear: course.academicYear,
                studyProgram: course.studyProgram as StudyProgram,
                semester: course.semester,
              },
            },
          })
          detail = { ...data.course, selectedSectionNo: course.selectedSectionNo }
        } catch (e) {
          detail = {
            ...unknownCourse,
            selectedSectionNo: course.selectedSectionNo,
            studyProgram: course.studyProgram as StudyProgram,
            semester: course.semester as Semester,
            academicYear: course.academicYear,
            courseNo: course.courseNo,
          }
        }
        fullCourses.push(detail)
      }
      runInAction(() => {
        this.shopItems = fullCourses.map((course) => ({ ...course, isSelected: false, isHidden: false }))
      })
      setTimeout(
        action('Delayed sync icon', () => {
          if (this.source.online) this.syncState = CourseCartSyncState.SYNCED
        }),
        1000
      )
    } catch (e) {
      collectErrorLog('Fail to pull course cart', e)
      console.error('Fail to pull course cart', e)
      runInAction(() => {
        if (this.source.online) this.syncState = CourseCartSyncState.FAIL
      })
    }
  }

  private async onChange() {
    runInAction(() => {
      if (this.source.online) this.syncState = CourseCartSyncState.SYNCING
    })
    try {
      await this.source.syncToStore(
        this.shopItems.map((item) => ({
          studyProgram: item.studyProgram,
          academicYear: item.academicYear,
          semester: item.semester,
          courseNo: item.courseNo,
          selectedSectionNo: item.selectedSectionNo,
        }))
      )
      setTimeout(
        action('Delayed sync icon', () => {
          if (this.source.online) this.syncState = CourseCartSyncState.SYNCED
        }),
        1000
      )
    } catch (e) {
      collectErrorLog('Fail to push course cart', e)
      console.error('Fail to push course cart', e)
      runInAction(() => {
        if (this.source.online) this.syncState = CourseCartSyncState.FAIL
      })
    }
    setTimeout(() => this.channel.postMessage('sync'), 1000)
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
      additionalData: {
        courseNo: course.courseNo,
        selectedSectionNo: selectedSectionNo || 'NONE',
        acaedemicYear: course.academicYear,
        semester: course.semester,
        studyProgram: course.studyProgram,
      },
    })

    if (this.currentProgram !== null && course.studyProgram !== this.currentProgram) {
      return false
    }

    if (!selectedSectionNo) selectedSectionNo = this.findFirstSectionNo(course)
    const newItem: CourseCartItem = { ...course, selectedSectionNo, isSelected: false, isHidden: false }
    const foundIndex = this.shopItems.findIndex((item) => item.courseNo == course.courseNo)
    if (foundIndex != -1) this.shopItems[foundIndex] = newItem
    else this.shopItems.push(newItem)

    this.onChange()
    return true
  }

  @action
  removeCourse(course: Course): void {
    this.shopItems = this.shopItems.filter((item) => item.courseNo !== course.courseNo)

    this.onChange()
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

    this.onChange()
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
