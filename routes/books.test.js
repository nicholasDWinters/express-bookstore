process.env.NODE_ENV === "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db');


//seed test database with data.sql before testing
beforeEach(async function () {
    await db.query(`DROP TABLE IF EXISTS books;
   
   
    CREATE TABLE books (
        isbn TEXT PRIMARY KEY,
        amazon_url TEXT,
        author TEXT,
        language TEXT, 
        pages INTEGER,
        publisher TEXT,
        title TEXT, 
        year INTEGER
      );
   
   
   INSERT INTO books
     VALUES ('12345', 'http://www.amazon.com', 'Nick Winters', 'English', 240, 'Publishers Clearing House', 'Test Title', 2020),
     ('678910', 'http://www.google.com', 'John Winters', 'Spanish', 400, 'Test Publisher', 'Johns Epic Book', 2040);
   
 `)
})


afterAll(async function () {
    // close db connection
    await db.end();
});


describe("GET /books", () => {
    test("Get all books", async () => {
        const res = await request(app).get("/books");

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "books": [
                {
                    "amazon_url": "http://www.google.com",
                    "author": "John Winters",
                    "isbn": "678910",
                    "language": "Spanish",
                    "pages": 400,
                    "publisher": "Test Publisher",
                    "title": "Johns Epic Book",
                    "year": 2040
                },
                {
                    "amazon_url": "http://www.amazon.com",
                    "author": "Nick Winters",
                    "isbn": "12345",
                    "language": "English",
                    "pages": 240,
                    "publisher": "Publishers Clearing House",
                    "title": "Test Title",
                    "year": 2020
                }
            ]
        })
    })
})

describe("GET /books/:isbn", () => {
    test("Get book by isbn", async () => {
        const res = await request(app).get(`/books/12345`);
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "book": {
                "amazon_url": "http://www.amazon.com",
                "author": "Nick Winters",
                "isbn": "12345",
                "language": "English",
                "pages": 240,
                "publisher": "Publishers Clearing House",
                "title": "Test Title",
                "year": 2020
            }
        })
    })

    test("Responds with 404 for invalid book", async () => {
        const res = await request(app).get(`/books/sjflksd`);
        expect(res.statusCode).toBe(404)
    })
})


describe("POST /books", () => {
    test("Creating a new book", async () => {
        let book = {
            isbn: '2082394283', amazon_url: 'http://www.walmart.com', author: 'Test Author', language: 'French',
            pages: 100, publisher: 'Test Pub', title: 'New Title', year: 1990
        };

        const res = await request(app).post("/books").send(book);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ book: book });
    })
    test("Responds with 400 if isbn is missing", async () => {
        let book = {
            amazon_url: 'http://www.walmart.com', author: 'Test Author', language: 'French',
            pages: 100, publisher: 'Test Pub', title: 'New Title', year: 1990
        };
        const res = await request(app).post("/books").send(book);
        expect(res.statusCode).toBe(400);
    })
    test("Responds with 400 if amazon_url is not correct format", async () => {
        let book = {
            isbn: '2082394283', amazon_url: '22', author: 'Test Author', language: 'French',
            pages: 100, publisher: 'Test Pub', title: 'New Title', year: 1990
        };
        const res = await request(app).post("/books").send(book);
        expect(res.statusCode).toBe(400);
    })
})


describe("/PUT /books/:isbn", () => {
    let book = {
        amazon_url: 'http://www.walmart.com', author: 'Test Author', language: 'French',
        pages: 100, publisher: 'Test Pub', title: 'New Title', year: 1990
    };
    let book2 = {
        amazon_url: 'http://www.walmart.com', author: 'Test Author', language: 'French',
        pages: 100, publisher: 'Test Pub', year: 1990
    };
    test("Updating a book", async () => {

        const res = await request(app).put(`/books/12345`).send(book);
        expect(res.statusCode).toBe(200);
        book = {
            isbn: "12345", amazon_url: 'http://www.walmart.com', author: 'Test Author', language: 'French',
            pages: 100, publisher: 'Test Pub', title: 'New Title', year: 1990
        }
        expect(res.body).toEqual({ book: book });
    })

    test("Responds with 404 for invalid isbn in request", async () => {
        const res = await request(app).put(`/books/fake`).send(book);
        expect(res.statusCode).toBe(404);
    })
    test("Responds with 400 for missing title in request, missing any property", async () => {
        const res = await request(app).put(`/books/12345`).send(book2);
        expect(res.statusCode).toBe(400);
    })

})


describe("/DELETE /books/:isbn", () => {
    test("Deleting a book", async () => {
        const res = await request(app).delete(`/books/12345`);
        expect(res.body).toEqual({ message: "Book deleted" })
    })
    test("Responds with 404 for deleting invalid book", async () => {
        const res = await request(app).delete(`/books/skdfjsd`);
        expect(res.statusCode).toBe(404);
    })
})