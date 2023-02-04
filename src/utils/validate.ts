import { RegisterInput } from '../types';

export const validateRegisterInput = ({
    email,
    username,
    password,
}: RegisterInput) => {
    // TODO: this is a test, need validate again
    if (!email.includes('@'))
        return {
            message: 'Invalid email',
            errors: [
                { field: 'email', message: 'Email must include @ symbol' },
            ],
        };

    if (username.length <= 2)
        return {
            message: 'Invalid username',
            errors: [
                { field: 'username', message: 'Length must be greater than 2' },
            ],
        };

    if (password.length <= 2)
        return {
            message: 'Invalid password',
            errors: [
                { field: 'password', message: 'Length must be greater than 2' },
            ],
        };

    return null;
};
