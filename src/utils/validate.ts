import {
    emailRegex,
    fullNameRegex,
    passwordRegex,
    phoneNumberRegex,
    userRegex,
} from '../constants/regex';
import { RegisterInput } from '../types/input';

export const validateRegisterInput = (registerInput: RegisterInput) => {
    const { email, username, password, fullName, phoneNumber } = registerInput;

    const isEmailValidate = emailRegex.test(email);
    const isUserValidate = userRegex.test(username);
    const isPasswordValidate = passwordRegex.test(password);
    const isFullNameValidate = fullNameRegex.test(fullName);
    const isPhoneNumberValidate = phoneNumberRegex.test(phoneNumber);

    if (!isEmailValidate) {
        console.log(isEmailValidate);
        return {
            message: 'Invalid email',
            errors: [
                {
                    field: 'email',
                    message:
                        'Email Validation as per RFC2822 standards. Check: https://regexr.com/2rhq7',
                },
            ],
        };
    }

    if (!isUserValidate) {
        console.log(isUserValidate);
        return {
            message: 'Invalid username',
            errors: [
                {
                    field: 'username',
                    message:
                        'username is 8-20 characters long, not special characters, no _ or . at the beginning, no __ or _. or ._ or .. inside, no _ or . at the end. Check: https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username',
                },
            ],
        };
    }

    if (!isPasswordValidate) {
        console.log(isPasswordValidate);
        return {
            message: 'Invalid password',
            errors: [
                {
                    field: 'password',
                    message:
                        'at least 8 characters must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number Can contain special characters. Check: https://regexr.com/3bfsi',
                },
            ],
        };
    }

    if (!isFullNameValidate) {
        console.log(isFullNameValidate);
        return {
            message: 'Invalid full name',
            errors: [
                {
                    field: 'fullName',
                    message:
                        'Allow unicode, Vietnamese name. Check: https://regexr.com/61oop',
                },
            ],
        };
    }

    if (!isPhoneNumberValidate) {
        console.log(isPhoneNumberValidate);
        return {
            message: 'Invalid phone number',
            errors: [
                {
                    field: 'phoneNumber',
                    message:
                        'Vietnamese phone number. Check: https://completejavascript.com/mot-so-bieu-thuc-chinh-quy-regexp-hay/',
                },
            ],
        };
    }

    return null;
};
