import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { Model } from 'mongoose'

import { NotFoundError } from '@api/common/errors'

import { CourseDocument, Semester, StudyProgram } from '@cgr/schema'

@Injectable()
export class CourseService {
  constructor(@InjectModel('course') private courseModel: Model<CourseDocument>) {}

  async findOne(
    courseNo: string,
    semester: Semester,
    academicYear: string,
    studyProgram: StudyProgram
  ): Promise<CourseDocument> {
    const course = await this.courseModel.findOne({
      courseNo,
      semester,
      academicYear,
      studyProgram,
    })

    if (!course) {
      throw new NotFoundError(`Can't find a course with the given parameters ${JSON.stringify({courseNo, semester, academicYear, studyProgram})}`)
    }
    return course
  }

  async getAllCourseNos(): Promise<Record<StudyProgram, string[]>> {
    const courses = await this.courseModel.aggregate([
      {
        $group: {
          _id: { courseNo: '$courseNo', studyProgram: '$studyProgram' },
        },
      },
    ])
    const courseNos: Record<StudyProgram, string[]> = {
      S: [],
      T: [],
      I: [],
    }
    for (const course of courses) {
      courseNos[course._id.studyProgram].push(course._id.courseNo)
    }
    return courseNos
  }
}
