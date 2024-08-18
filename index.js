import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";
import "dotenv/config";

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkBooks() {
  const result = await db.query("SELECT * FROM books ORDER BY id ASC");
  let books = result.rows;
  return books;
}

app.get("/", (req, res) => {
  const existingBooks = checkBooks();
  res.render("index.ejs", { data: existingBooks });
});

app.get("/new", (req, res) => {
  res.render("new.ejs", { heading: "New Note", submit: "Create Note" });
});

app.get("/edit/:id", (req, res) => {
  const existingBooks = checkBooks();
  const id = parseInt(req.params.id);
  const bookToEdit = existingBooks.find((book) => book.id === id);
  res.render("new.ejs", {
    heading: "Edit Note",
    submit: "Update Note",
    data: bookToEdit,
  });
});

app.post("/new", async (req, res) => {
  const isbn = parseInt(req.body.isbn);
  const title = req.body.title;
  const author = req.body.author;
  const date = req.body.date;
  const rating = parseFloat(req.body.rating);
  const note = req.body.note;

  try {
    await db.query(
      "INSERT INTO books (isbn, title, author, date, rating, note) VALUES ($1, $2, $3, $4, $5, $6)",
      [isbn, title, author, date, rating, note]
    );

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.patch("/edit/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await db.query("SELECT * FROM books WHERE id = ($1)", [id]);
  const bookToEdit = result.rows[0];
  const editedIsbn = parseInt(req.body.isbn) || bookToEdit.isbn;
  const editedTitle = req.body.title || bookToEdit.title;
  const editedAuthor = req.body.author || bookToEdit.author;
  const editedDate = req.body.date || bookToEdit.date;
  const editedRating = parseFloat(req.body.rating) || bookToEdit.rating;
  const editedNote = req.body.note || bookToEdit.note;

  try {
    await db.query(
      "UPDATE books SET isbn = $1, title = $2, author = $3, date = $4, rating = $5, note = $6 WHERE id = $7",
      [
        editedIsbn,
        editedTitle,
        editedAuthor,
        editedDate,
        editedRating,
        editedNote,
        id,
      ]
    );

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.delete("/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.query("DELETE FROM books WHERE id = ($1)", [id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
