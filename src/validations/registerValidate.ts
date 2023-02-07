import { RegisterInput } from '../types/input';

const validateRegisterInput = (registerInput: RegisterInput) => {
    const { email, username, password, fullName, phoneNumber } = registerInput;

    const emailRegex =
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
    const userRegex = /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/g;
    const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
    const fullNameRegex =
        /(?:[A-ZẮẰẲẴẶĂẤẦẨẪẬÂÁÀÃẢẠĐẾỀỂỄỆÊÉÈẺẼẸÍÌỈĨỊỐỒỔỖỘÔỚỜỞỠỢƠÓÒÕỎỌỨỪỬỮỰƯÚÙỦŨỤÝỲỶỸỴ][a-zắằẳẵặăấầẩẫậâáàãảạđếềểễệêéèẻẽẹíìỉĩịốồổỗộôớờởỡợơóòõỏọứừửữựưúùủũụýỳỷỹỵ]{1,}\s)+[A-ZẮẰẲẴẶĂẤẦẨẪẬÂÁÀÃẢẠĐẾỀỂỄỆÊÉÈẺẼẸÍÌỈĨỊỐỒỔỖỘÔỚỜỞỠỢƠÓÒÕỎỌỨỪỬỮỰƯÚÙỦŨỤÝỲỶỸỴ][a-zắằẳẵặăấầẩẫậâáàãảạđếềểễệêéèẻẽẹíìỉĩịốồổỗộôớờởỡợơóòõỏọứừửữựưúùủũụýỳỷỹỵ]+/g;
    const phoneNumberRegex =
        /^(0|\+84)(\s|\.)?((3[3-9])|(5[689])|(7[06-9])|(8[1-6789])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/gm;

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

export default validateRegisterInput;
