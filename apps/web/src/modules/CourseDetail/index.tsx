import { useTranslation } from 'react-i18next'
import { MdEdit, MdStar } from 'react-icons/md'

import { ApolloError } from '@apollo/client'
import { Button, Grid, Stack, Typography } from '@mui/material'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { NextSeoProps } from 'next-seo/lib/types'
import dynamic from 'next/dynamic'

import defaultSEO from '@web/../next-seo.config'
import { BackButton } from '@web/common/components/BackButton'
import { useLinkBuilder } from '@web/common/hooks/useLinkBuilder'
import { Language } from '@web/common/i18n'
import { getExamDate } from '@web/common/utils/getExamDate'
import { getExamPeriod } from '@web/common/utils/getExamPeriod'
import { parseCourseNoFromQuery } from '@web/common/utils/parseCourseNoFromQuery'
import { PageMeta } from '@web/components/PageMeta'
import { ENABLE_COURSE_THUMBNAIL, SITE_URL } from '@web/env'
import { scrollToReviewForm } from '@web/modules/CourseDetail/components/ReviewForm/functions'
import { ReviewList } from '@web/modules/CourseDetail/components/ReviewList'
import { ReviewProvider } from '@web/modules/CourseDetail/context/Review'
import { generateThumbnailId } from '@web/modules/CourseThumbnailAPI/utils/generateThumbnailId'
import { createApolloServerClient } from '@web/services/apollo'

import { Review } from '@cgr/codegen'
import {
  Course,
  GetCourseInfoDocument,
  GetCourseInfoQuery,
  GetCourseInfoQueryVariables,
  GetReviewsDocument,
  GetReviewsQuery,
  GetReviewsQueryVariables,
} from '@cgr/codegen'
import { getFaculty } from '@cgr/course-utils'

import {
  Container,
  DescriptionTitle,
  GridContainer,
  GridEnd,
  SectionCardLayout,
  SectionContainer,
  Title,
} from './styled'
import { courseTypeStringFromCourse } from './utils/courseTypeStringFromCourse'
import { groupBy } from './utils/groupBy'

const ReviewForm = dynamic(
  async () =>
    (
      await import(
        /* webpackChunkName: "ReviewForm" */
        '@web/modules/CourseDetail/components/ReviewForm'
      )
    ).ReviewForm,
  { ssr: false }
)

interface CourseDetailPageProps {
  course: Course
  reviews: Review[]
  ogImageUrl: string
}

export function CourseDetailPage({ course, reviews, ogImageUrl }: CourseDetailPageProps) {
  const { i18n } = useTranslation()
  const { buildLink } = useLinkBuilder()

  const courseDesc = [course.courseDescTh, course.courseDescEn].filter((desc) => !!desc).join('\n')
  const SEOConfig: NextSeoProps = {
    ...defaultSEO,
    title: course.abbrName,
    description: courseDesc || defaultSEO.description,
    openGraph: {
      url: `${SITE_URL}${buildLink(`/courses/${course.courseNo}`)}`,
      title: `${course.abbrName} | CU Get Reg`,
      description: courseDesc || defaultSEO.openGraph.description,
      images: ENABLE_COURSE_THUMBNAIL
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: course.abbrName,
            },
          ]
        : undefined,
    },
    additionalMetaTags: [
      ...defaultSEO.additionalMetaTags,
      {
        property: 'keywords',
        content:
          defaultSEO.additionalMetaTags[0].content +
          [
            course.abbrName,
            course.genEdType,
            course.academicYear,
            course.faculty,
            course.courseNo,
          ].join(','),
      },
    ],
  }

  const CourseList = groupBy(course.sections, 'note', 'General').map((sectionGroup) => {
    const SectionGroup = sectionGroup.value.map((section) => (
      <SectionCardLayout key={section.sectionNo} section={section} course={course} />
    ))
    return (
      <SectionContainer key={sectionGroup.group}>
        <Typography variant="h5">Group: {sectionGroup.group}</Typography>
        {SectionGroup}
      </SectionContainer>
    )
  })

  const faculty = getFaculty(course.faculty)
  const { finalDate, midtermDate } = getExamDate(course)
  const { midtermPeriod, finalPeriod } = getExamPeriod(course)

  return (
    <Container>
      <PageMeta {...SEOConfig} />
      <Stack direction="row" justifyContent="space-between">
        <BackButton href={buildLink(`/courses`)} pathId={course.courseNo} />
        <Stack direction="row" spacing={[2, 4]} alignItems="center">
          {course.rating && (
            <Stack direction="row" spacing={1} alignItems="center">
              <MdStar size={24} />
              <Typography color="primary" variant="h5" sx={{ display: 'inline-block' }}>
                {course.rating}
              </Typography>
            </Stack>
          )}
          <Button variant="outlined" onClick={scrollToReviewForm} startIcon={<MdEdit />}>
            เขียนรีวิว
          </Button>
        </Stack>
      </Stack>
      <Title variant="h3">
        {course.courseNo} {course.abbrName}
      </Title>
      <Typography variant="h5">{course.courseNameTh}</Typography>
      <Typography variant="h5">{course.courseNameEn}</Typography>
      <GridContainer container>
        <Grid item xs={12} sm={6}>
          <DescriptionTitle variant="subtitle1">คณะ</DescriptionTitle>
          <Typography variant="h6">
            {i18n.language === Language.th ? faculty?.nameTh : faculty?.nameEn}
          </Typography>
        </Grid>
        <GridEnd item xs={12} sm={6}>
          <DescriptionTitle variant="subtitle1">ภาควิชา/กลุ่มวิชา/สาขาวิชา</DescriptionTitle>
          <Typography variant="h6">{course.department || '-'}</Typography>
        </GridEnd>
        <Grid item xs={12} sm={6}>
          <DescriptionTitle variant="subtitle1">รูปแบบรายวิชา</DescriptionTitle>
          <Typography variant="h6">{courseTypeStringFromCourse(course)}</Typography>
        </Grid>
        <GridEnd item xs={12} sm={6}>
          <DescriptionTitle variant="subtitle1">หน่วยกิต</DescriptionTitle>
          <Typography variant="h6">{course.credit}</Typography>
        </GridEnd>
        <Grid item xs={12} sm={6}>
          <DescriptionTitle variant="subtitle1">สอบกลางภาค</DescriptionTitle>
          <Typography variant="h6">
            {course.midterm?.date ? `${midtermDate} ${midtermPeriod}` : 'TBA'}
          </Typography>
        </Grid>
        <GridEnd item xs={12} sm={6}>
          <DescriptionTitle variant="subtitle1">สอบปลายภาค</DescriptionTitle>
          <Typography variant="h6">
            {course.final?.date ? `${finalDate} ${finalPeriod}` : 'TBA'}
          </Typography>
        </GridEnd>
        <Grid item xs={12} sm={6}>
          <DescriptionTitle variant="subtitle1">เงื่อนไขรายวิชา</DescriptionTitle>
          <Typography variant="h6">{course.courseCondition}</Typography>
        </Grid>
        <GridEnd item xs={12} sm={6}>
          <DescriptionTitle variant="subtitle1">วิธีการวัดผล</DescriptionTitle>
          <Typography variant="h6">
            {course.creditHours.includes('S/U') ? 'S/U Grade' : 'Letter Grade'}
          </Typography>
        </GridEnd>
        {course.courseDescTh && (
          <Grid item xs={12} sm={12}>
            <DescriptionTitle variant="subtitle1">คำอธิบายรายวิชา (ภาษาไทย)</DescriptionTitle>
            <Typography variant="h6">{course.courseDescTh}</Typography>
          </Grid>
        )}
        {course.courseDescEn && (
          <Grid item xs={12} sm={12}>
            <DescriptionTitle variant="subtitle1">คำอธิบายรายวิชา (ภาษาอังกฤษ)</DescriptionTitle>
            <Typography variant="h6">{course.courseDescEn}</Typography>
          </Grid>
        )}
      </GridContainer>
      {CourseList}
      <ReviewProvider courseNo={course.courseNo} initialReviews={reviews}>
        <ReviewForm />
        <ReviewList />
      </ReviewProvider>
    </Container>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<CourseDetailPageProps>> {
  try {
    const { courseNo, courseGroup } = parseCourseNoFromQuery(context.query)
    const client = createApolloServerClient()
    const { data: courseData } = await client.query<
      GetCourseInfoQuery,
      GetCourseInfoQueryVariables
    >({
      query: GetCourseInfoDocument,
      variables: {
        courseNo,
        courseGroup,
      },
    })
    const { data: reviewsData } = await client.query<GetReviewsQuery, GetReviewsQueryVariables>({
      query: GetReviewsDocument,
      variables: {
        courseNo,
        studyProgram: courseGroup.studyProgram,
      },
    })
    const course = courseData.course
    const urlParams = new URLSearchParams({
      id: generateThumbnailId(course),
      courseNo: course.courseNo,
      studyProgram: course.studyProgram,
      term: `${course.academicYear}/${course.semester}`,
    })
    return {
      props: {
        course: course,
        reviews: reviewsData.reviews,
        ogImageUrl: `${SITE_URL}/api/courseThumbnail?${urlParams.toString()}`,
      },
    }
  } catch (e) {
    if (e instanceof ApolloError) {
      console.warn(`CourseDetail not found query=${JSON.stringify(context.query)}`, e)
      return {
        notFound: true,
      }
    } else {
      throw e
    }
  }
}
