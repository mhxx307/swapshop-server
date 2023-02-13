import { ChangePasswordInput } from '../types/input';

const validateChangePasswordInput = (
    changePasswordInput: ChangePasswordInput
) => {
    const { newPassword } = changePasswordInput;

    const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

    const isPasswordValidate = passwordRegex.test(newPassword);

    if (!isPasswordValidate) {
        console.log(isPasswordValidate);
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

    return null;
};

export default validateChangePasswordInput;
