/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
import { TGuardian, TLocalGurdian, TStudent,   StudentModel, TUserName } from './student.interface';
import validator from 'validator';
import bcrypt from "bcrypt"
import config from '../../config';

const userNameSchema = new Schema<TUserName>({
  firstname: {
    type: String,
    required: [true, "first name lagbei"],
    trim: true,
    maxlength: 20,
    validate: {
      validator: function (value: string) {
        const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
        return firstNameStr === value;
      },
      message: '{VALUE} is not capitalize format'
    }
  },
  middleName: { type: String, required : false },
  lastName: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => validator.isAlpha(value),
      message: '{VALUE} is not valid'
    }
  },
});

const guardianSchema = new Schema<TGuardian>({
  fatherName: { type: String, required: true },
  fatherOccuption: { type: String, required: true },
  fatherContact: { type: String, required: true },
  motherName: { type: String, required: true },
  motherOccuption: { type: String, required: true },
  motherContact: { type: String, required: true },
});

const localGuardianSchema = new Schema<TLocalGurdian>({
  name: { type: String, required: true },
  occuption: { type: String, required: true },
  contactNo: { type: String, required: true },
  address: { type: String, required: true }
});

const studentSchema = new Schema<TStudent, StudentModel>({
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true,  maxlength:[20, "password can not be more than 20 charapters"] },
  name: {
    type: userNameSchema,
    required: true
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other'],
      message: "The gender field only be one of the following: 'male', 'female', and 'other'"
    },
    required: true
  },
  dateOfBirth: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: '{VALUE} is not a valid email type'
    }
  },
  contactNumber: { type: String, required: true },
  emergencyContatNo: { type: String, required: true },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  presentAddress: { type: String, required: true },
  permamentAddress: { type: String, required: true },
  gurdian: {
    type: guardianSchema,
    required: true
  },
  localGuardian: {
    type: localGuardianSchema,
    required: true
  },
  profileImg: { type: String },
  isActive: {
    type: String,
    enum: ["active", "inActive"],
    default: "active"
  },
  isDeleted : {
    type : Boolean,
    default : false
  }
}, {
  toJSON : {
    virtuals : true
  }
});


// Virtual
studentSchema.virtual("fullName").get(function(){
   return (
    `${this.name.firstname} ${this.name.middleName} ${this.name.lastName}`
   )
})


// pre save middleware/hook : will work on create() save()
studentSchema.pre("save", async function(next){
  // console.log(this, "pre hook: we will save the data")
  // hassing password and save into db
  const user = this;
  user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds))
  next()
})

// post save middlware/hook : wii work 
studentSchema.post('save', function(doc, next){
  doc.password = ""
  console.log(this, "we saved our data");
  next()
})


// query middlware 

studentSchema.pre("find", function(next){
   this.find( {isDeleted : {$ne : true}})
  next()
})

studentSchema.pre("findOne", function(next){
   this.find( {isDeleted : {$ne : true}})
  next()
})

studentSchema.pre("aggregate", function(next){
  this.pipeline().unshift({ $match : { isDeleted : { $ne : true}}});
  next()
})



// creating static instance method

studentSchema.statics.isUserExists = async function(id : string) {
  const existingUser = await Student.findOne({id})
  return existingUser
}


// crating a custom instance method

// studentSchema.methods.isUserExists = async function(id:string) {
//   const existingUser = await Student.findOne({id});
//   return existingUser;
// }

export const Student = model<TStudent, StudentModel>("Student", studentSchema);