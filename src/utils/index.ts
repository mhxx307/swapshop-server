export { default as sendEmail } from './sendEmail';

export const showError = (error: unknown) => {
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

interface IHasCreatedDate {
    createdDate: Date;
}

interface IHasMorePaginated<T extends IHasCreatedDate> {
    cursor?: string;
    currentDataList: T[];
    lastItem: T;
    totalCount: number;
}

export function hasMorePaginated<T extends IHasCreatedDate>({
    cursor,
    currentDataList,
    lastItem,
    totalCount,
}: IHasMorePaginated<T>): boolean {
    if (cursor) {
        return (
            currentDataList[
                currentDataList.length - 1
            ].createdDate.toString() !== lastItem.createdDate.toString() ?? true
        );
    } else {
        return currentDataList.length !== totalCount ?? true;
    }
}
