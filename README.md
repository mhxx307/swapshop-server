# swapshop-server

## What is the best way to store image
[quora.com](https://www.quora.com/PostgreSQL-How-can-I-store-images-in-a-database-What-existing-products-makes-it-easy-for-a-user-to-upload-photos-into-a-general-database "The best search engine for privacy").

````
Originally Answered: How can I store images in a database? What existing products makes it easy for a user to upload photos into a general database?
As a general rule, it's a bad idea to store images in a database. This is due to the large amount of space they take up, which can affect database read performance and will greatly increases the size of your backups, making them both take longer and cost more to store.

Instead, it's best to store the images elsewhere and then store a reference to them in your database. These days the easiest way of doing this is generally to use Amazon S3, which can cheaply and reliably store an unlimited number of images. Save them to S3, then store the S3 URL (or the bucket + key combination) in a string in your database row.

If you're determined to store them in a database you can do so using a BLOB field, or by base64 encoding them and storing them in a large text field (which will even further inflate the size of your tables).

-Simon Willison-
````
