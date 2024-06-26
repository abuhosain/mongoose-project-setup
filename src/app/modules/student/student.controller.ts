import { StudentService } from './student.services'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'

const getAllStudent = catchAsync(async (req, res) => {
  // console.log(req.query)
  const result = await StudentService.getAllStudentsFromDB(req.query)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student get successfully',
    data: result,
  })
})

const getSingleStudent = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await StudentService.getSingleStudentFromDb(id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get single student data successfully',
    data: result,
  })
})

const updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {student} = req.body
  const result = await StudentService.UpdatedStudentIntoDb(id, student)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'updated student successfully',
    data: result,
  })
})

const deleteStudent = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await StudentService.deleteStudentFromDb(id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'delete single student data successfully',
    data: result,
  })
})

export const StudentController = {
  getAllStudent,
  getSingleStudent,
  deleteStudent,
  updateStudent
}
