export { default as sendEmail } from './sendEmail';

const showError = (error: any) => {
    if (error instanceof Error) {
        console.log(error.message);
        return {
            code: 500,
            success: false,
            message: `Internal server error: ${error.message}`,
        };
    } else {
        console.log('Unexpected error', error);
        return {
            code: 500,
            success: false,
            message: `Internal server error: ${error}`,
        };
    }
};

export default showError;
