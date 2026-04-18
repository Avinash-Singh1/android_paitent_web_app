export type ErrorTypes =
  | "required"
  | "email"
  | "minlength"
  | "invalidDate"
  | "invalidYear"
  | "maxlength";

export const ERROR_MESSAGES: { [key: string]: (...args: any) => string } = {
  required: (formControlName: string) => `${formControlName} is required.`,

  email: () => `This is not a valid email address.`,
  minlength: (formControlName, requirement) =>
    `${formControlName} should be at least ${requirement} characters.`,
  maxlength: (formControlName, requirement) =>
    `${formControlName} should at equal to or less than ${requirement} charcters.`,
  invalidDate: () => `This is not a valid date.`,
  invalidYear: () => `Date of Birth should be after year 1900.`,
};
