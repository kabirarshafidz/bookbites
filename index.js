import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";
import "dotenv/config";
import pool from "./database.js";

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";

const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM books ORDER BY id ASC");
  const books = result.rows;
  console.log(books);
  res.render("index.ejs", { books: books });
});

app.get("/new", (req, res) => {
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  let currentDate = `${year}-${month}-${day}`;
  res.render("new.ejs", {
    heading: "New Note",
    submit: "Create Note",
    date: currentDate,
  });
});

app.get("/edit/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM books ORDER BY id ASC");
  const existingBooks = result.rows;
  const id = parseInt(req.params.id);
  const bookToEdit = existingBooks.find((book) => book.id === id);
  res.render("new.ejs", {
    heading: "Edit Note",
    submit: "Update Note",
    book: bookToEdit,
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
    await pool.query(
      "INSERT INTO books (isbn, title, author, date, rating, note) VALUES ($1, $2, $3, $4, $5, $6)",
      [isbn, title, author, date, rating, note]
    );

    console.log("Added!");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await pool.query("SELECT * FROM books WHERE id = ($1)", [id]);
  const bookToEdit = result.rows[0];
  const editedIsbn = parseInt(req.body.isbn) || bookToEdit.isbn;
  const editedTitle = req.body.title || bookToEdit.title;
  const editedAuthor = req.body.author || bookToEdit.author;
  const editedDate = req.body.date || bookToEdit.date;
  const editedRating = parseFloat(req.body.rating) || bookToEdit.rating;
  const editedNote = req.body.note || bookToEdit.note;
  try {
    await pool.query(
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
    console.log("Updated!");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query("DELETE FROM books WHERE id = ($1)", [id]);
    console.log("Deleted!");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
