### Thông tin API

URL: http://localhost:4000/graphql

### Format trả về

Với mutation thì:

```
@ObjectType({ implements: IMutationResponse })
export default class UserRoleMutationResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field(() => UserRole, { nullable: true })
    userRole?: UserRole;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
```

Ví dụ:

```
update-profile

{
  "data": {
    "updateProfile": {
      "success": true,
      "message": "Delete successfully",
      "user": {
        "username": "anhtiday1",
        "address": "quan 2",
        "phoneNumber": "0334773211",
        "fullName": "Hoang Tran",
        "birthday": null
      },
      "code": 200,
      "errors": null
    }
  }
}
```

Rules for register & login:

-   Email: Email Validation as per RFC2822 standards. Check: https://regexr.com/2rhq7

-   Username: username is 2-20 characters long, not special characters, no _ or . at the beginning, no \_\_ or _. or ._ or .. inside, no _ or . at the end. Check: https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username

-   Password: at least 8 characters must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number Can contain special characters. Check: https://regexr.com/3bfsi

-   Fullname: allow unicode, Vietnamese name. Check: https://regexr.com/61oop

Ví dụ: articles?page=1&limit=30 Method: GET

Query Params:

-   page: number. Số trang. Mặc định là 1
-   limit: number. Số articles trên 1 trang. Mặc định là 30
-   order: 'desc' || 'asc'. Sắp xếp theo thứ tự. Mặc định là 'desc'
-   sort_by: 'createdAt' || 'price'. Sắp xếp theo trường. Mặc định là 'createdAt'.
-   categories: categoryId list. Lọc sản phẩm theo category
-   price_max: number. Giá cao nhất
-   price_min: number. Giá thấp nhất
-   name: string. Tên sản phẩm

### Filter

-   [ ] user rating
-   [ ] exclude
-   [ ] article by userId
