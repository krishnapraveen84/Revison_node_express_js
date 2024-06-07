const express = require('express')
const path = require('path')
const {open} = require('sqlite') //connects to sqlite database server  returns object to operate

const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'goodreads.db')
const app = express()
app.use(express.json())

let db = null

const intializerDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('SERVER RUNNING AT http:localhost:3000/')
    })
  } catch (error) {
    console.log(`DB ERROR: ${error.message}`)
    process.exit(1)
  }
}
// ALL BOOKS API
app.get('/', (request, response) => {
  response.send('GO To Books Page')
})
app.get('/books/', async (request, response) => {
  const getBookQuery = `
        SELECT * FROM book ORDER BY book_id;
    
    `
  const bookArray = await db.all(getBookQuery)
  response.send(bookArray)
})
// BOOK BY Book ID API
app.get('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const getBookById = `
    SELECT 
      *
    FROM 
      book
    WHERE book_id = ${bookId}
  `
  const book = await db.get(getBookById)
  response.send(book)
})
// Update The Books DB
app.post('/books', async (request, response) => {
  const booksDetails = request.body
  const {
    book_id,
    title,
    author_id,
    rating,
    rating_count,
    review_count,
    description,
    pages,
    date_of_publication,
    edition_language,
    price,
    online_stores,
  } = booksDetails
  const addBookQuery = `
    INSERT INTO 
      book(
        title,
      author_id,
      rating,
      rating_count,
      review_count,
      description,
      pages,
      date_of_publication,
      edition_language,
      price,
      online_stores,)
    VALUES
      (
        '${title}',
        '${author_id}',
        '${rating}',
        '${rating_count}',
        '${review_count}',
        '${description}',
        '${pages}',
        '${date_of_publication}',
        '${edition_language}',
        '${price}',
        '${online_stores}',
      )
  `
  const addBook = await db.run(addBookQuery)
  const bookId = addBook.lastID
  response.send({bookId: bookId})
})
// Updating the Book
app.put('/books/', async (request, response) => {
  const {bookId} = request.params
  const {bookDetails} = request.body
  const {
    title,
    author_id,
    rating,
    rating_count,
    review_count,
    description,
    pages,
    date_of_publication,
    edition_language,
    price,
    online_stores,
  } = bookDetails
  const updateBookQuery = `
    UPDATE
        book
    SET
        title='${title}'
        author_id='${author_id}'
        rating='${rating}'
        rating_count='${rating_count}'
        review_count='${review_count}'
        description='${description}'
        pages='${pages}'
        date_of_publication='${date_of_publication}'
        edition_language='${edition_language}'
        price='${price}'
        online_stores='${online_stores}'
    WHERE 
        book_id = ${bookId};
  `
  const updateBook = await db.run(updateBookQuery)
  response.send(`Book with ${bookId} Successfully Updated!`)
})
intializerDBAndServer()
