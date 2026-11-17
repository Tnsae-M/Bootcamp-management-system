import { body } from "express-validator";

export const registerValidation = [
  body().custom((val) => {
    if (!val.fullName && !val.name) {
      throw new Error("Full name is required");
    }
    return true;
  }),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];
