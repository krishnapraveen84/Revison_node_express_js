const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'goodreads.db')
let db = null
const intialzerDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('Server started at port 3000'))
  } catch (err) {
    console.log(`Error: ${err}`)
    process.exit(1)
  }
}

//GET ALL BOOKS
app.get('/books/', async (req, res) => {
  const query = `
    SELECT 
       *
    FROM
     book
    ORDER BY book_id;
  `
  const booksData = await db.all(query)
  res.send(booksData)
})
//Filter Books By search text and sorting and limit and offset
app.get('/books/', async (request, response) => {
  const {
    offset = 0,
    limit = 20,
    search_q = '',
    order_by = 'book_id',
    order = 'ASC',
  } = request.query

  const getBooksQuery = `SELECT
      *
    FROM
      book
    WHERE 
      title LIKE '%${search_q}%'
    ORDER BY  ${order_by} ${order}
    LIMIT ${limit} OFFSET ${offset};`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

//GET a Book By it's id
app.get('/books/:bookId/', async (req, res) => {
  const {bookId} = req.params
  const query = `
    SELECT
      *
    FROM 
      book
    WHERE book_id = ${bookId}
  `
  const bookData = await db.get(query)
  res.send(bookData)
})
//ADD a new book to the book db
app.post('/books/', async (req, res) => {
  const bookDeatils = req.body
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
  } = bookDeatils
  const insertQuery = `
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
      online_stores)
    VALUES(
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
        '${online_stores}'
    );
  `
  const dbResponse = await db.run(insertQuery)
  const bookId = dbResponse.lastID
  res.send(`BookID : ${bookId}`)
})
// UPDATE A book by it's id
app.put('/books/:bookId/', async (req, res) => {
  const {bookId} = req.params
  const bookDetails = req.body
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`
  await db.run(updateBookQuery)
  res.send('Book Updated Successfully...!')
})

intialzerDBServer()
