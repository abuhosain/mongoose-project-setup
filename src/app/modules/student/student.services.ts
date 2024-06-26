import mongoose from 'mongoose'
import { Student } from './student.model'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import httpStatus from 'http-status'
import { TStudent } from './student.interface'
import QueryBuilder from '../../builder/QueryBuilder'
import { studentSearchAbleField } from './student.constant'

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  // // const queryObj = {...query}
  // let searchTerm = "";
  // if(query?.searchTerm){
  //   searchTerm = query?.searchTerm as string
  // }

  // const searchQuery = Student.find({
  //   $or : studentSearchAbleField.map(
  //     (field) => ({
  //       [field] : { $regex : searchTerm, $options : "i"}
  //     })
  //   )
  // // })

  // // filtering
  // const excludeField = ["searchTerm", "sort", "limit", "page", "fields"];
  // excludeField.forEach(el => delete queryObj[el]);

  // const filterQuery =  searchQuery.find(queryObj)
  //   .populate('admissiionSemester')
  //   .populate({
  //     path: 'academicDepartment',
  //     populate: {
  //       path: 'academicFaculty',
  //     },
  //   })

  // sorting
  // let sort = "-createdAt";
  // if(query.sort){
  //   sort = query.sort as string
  // }

  // const sortQuery =  filterQuery.sort(sort)

  // limit and page
  // let page = 1
  // let limit = 1;
  // let skip = 0;

  // if(query.limit){
  //   limit = Number(query.limit)
  // }

  // if(query?.page) {
  //   page = Number(query.page)
  //   skip =  (page-1) *limit
  // }
  // pagination query
  // const paginateQuery = sortQuery?.skip(skip)

  // limit query
  // const limitQuery =  paginateQuery.limit(limit);

  // fields
  //   let fields = "-__v";

  //   if(query?.fields){
  //     fields = (query.fields as string).split(",").join(" ")
  //   }

  //   const fieldQuery = await limitQuery.select(fields)

  // return fieldQuery

  const studentQuery = new QueryBuilder(Student.find()
  .populate('admissiionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    })
  , query)
    .search(studentSearchAbleField)
    .filter()
    .sort()
    .paginate()
    .fields()
  const result = await studentQuery.modelQuery
  return result
}

const getSingleStudentFromDb = async (id: string) => {
  // const result = await Student.findOne({id: id});
  const result = await Student.findById(id)
    .populate('admissiionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    })
  return result
}

const UpdatedStudentIntoDb = async (id: string, payload: Partial<TStudent>) => {
  // const result = await Student.findOne({id: id});
  const { name, localGuardian, gurdian, ...remainingStudentData } = payload

  const modifiedUpdateData: Record<string, unknown> = {
    remainingStudentData,
  }

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdateData[`name.${key}`] = value
    }
  }
  if (gurdian && Object.keys(gurdian).length) {
    for (const [key, value] of Object.entries(gurdian)) {
      modifiedUpdateData[`gurdian.${key}`] = value
    }
  }
  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedUpdateData[`localGuardian.${key}`] = value
    }
  }

  // console.log(modifiedUpdateData)
  const result = await Student.findByIdAndUpdate( id , modifiedUpdateData, {
    new: true,
    runValidators: true,
  })
    .populate('admissiionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    })
  return result
}

const deleteStudentFromDb = async (id: string) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()
    const deletedStudent = await Student.findByIdAndUpdate(
      id ,
      { isDeleted: true },
      {
        new: true,
        session,
      },
    )
    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Faild to delete student')
    }

    const userId = deletedStudent.user;

    const deletedUser = await User.findByIdAndUpdate(
       userId ,
      { isDeleted: true },
      { new: true, session },
    )

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Faild to deleted User')
    }

    await session.commitTransaction()
    await session.endSession()
    return deletedStudent
  } catch (err) {
    await session.abortTransaction()
    await session.endSession()
    throw new Error('Faild to delete student')
  }
}

export const StudentService = {
  getAllStudentsFromDB,
  getSingleStudentFromDb,
  deleteStudentFromDb,
  UpdatedStudentIntoDb,
}
