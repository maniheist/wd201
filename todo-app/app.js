"use strict";
const express = require("express");
const csrf = require("csurf");
const app = express();
const db = require("./models"); // Import the Sequelize instance and models

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("some_secret"));

app.use(csrf({ cookie: true }));
const path = require("path");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async function (request, response) {
  try {
    const overdueItems = await db.Todo.overdue();
    const dueTodayItems = await db.Todo.dueToday();
    const dueLaterItems = await db.Todo.dueLater();
    const completedItems = await db.Todo.completedItems();

    if (request.accepts("html")) {
      response.render("index", {
        overdueItems,
        dueTodayItems,
        dueLaterItems,
        completedItems,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        overdueItems,
        dueTodayItems,
        dueLaterItems,
        completedItems,
        csrfToken: request.csrfToken(),
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).send('Something went wrong!');
  }
});

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todos = await db.Todo.findAll();
    response.send(todos);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await db.Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    await db.Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    return response.redirect("/");
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/", async function (request, response) {
  try {
    const todo = await db.Todo.findByPk(request.params.id);
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("Deleting a Todo with ID: ", request.params.id);
  try {
    await db.Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
