import {z} from "zod";

const loginValidationSchema = z.object({
    body : z.object({
        id : z.string({required_error : "Id is required"}),
        password : z.string({required_error : "Passowrd is required"})
    })
})

const changePasswordValidationSchema = z.object({
    body : z.object({    
        oldPassword : z.string({required_error : "oldPassword is required"}),
        newPassword : z.string({required_error : "Passowrd is required"}),
    })
})
const refreshTokenValidationSchema = z.object({
    cookies : z.object({    
        refreshToken : z.string({required_error : "Refrsh token  is required"}), 
    })
})

export const AuthValidation = {
    loginValidationSchema,
    changePasswordValidationSchema,
    refreshTokenValidationSchema
}