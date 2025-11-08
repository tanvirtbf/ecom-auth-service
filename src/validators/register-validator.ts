import { checkSchema } from "express-validator";

export default checkSchema({
    firstName: {
        errorMessage: "First Name is Required!",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "Last Name is Required!",
        notEmpty: true,
        trim: true,
    },
    email: {
        errorMessage: "Email is required!",
        notEmpty: true,
        trim: true,
    },
    password: {
        errorMessage: "Password is Required!",
        notEmpty: true,
        trim: true,
        isLength: {
            errorMessage: "Password must be at least 6 characters!",
            options: { min: 6 },
        },
    },
});
// export default [body("email").notEmpty().withMessage("Email is required!")];
