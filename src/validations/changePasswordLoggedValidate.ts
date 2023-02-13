import { ChangePasswordLoggedInput } from '../types/input';

const validateChangePasswordLoggedInput = (
    changePasswordLoggedInput: ChangePasswordLoggedInput
) => {
    const { newPassword, oldPassword } = changePasswordLoggedInput;

    const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

    const oldPasswordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

    const isNewPasswordValidate = passwordRegex.test(newPassword);
    const isOldPasswordValidate = oldPasswordRegex.test(oldPassword);

    if (!isNewPasswordValidate) {
        console.log(isNewPasswordValidate);
        return {
            message: 'Invalid password',
            errors: [
                {
                    field: 'newPassword',
                    message:
                        'at least 8 characters must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number Can contain special characters. Check: https://regexr.com/3bfsi',
                },
            ],
        };
    }

    if (!isOldPasswordValidate) {
        console.log(isOldPasswordValidate);
        return {
            message: 'Invalid password',
            errors: [
                {
                    field: 'oldPassword',
                    message:
                        'at least 8 characters must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number Can contain special characters. Check: https://regexr.com/3bfsi',
                },
            ],
        };
    }

    return null;
};

export default validateChangePasswordLoggedInput;
