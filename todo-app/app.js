const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const Sequelize = require("sequelize");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const Op = Sequelize.Op;
const path = require("path");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh! some secret string!"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todos = await Todo.findAll();
    const overdue = await Todo.getOverDue();
    const later = await Todo.getDueLater();
    const today = await Todo.getDueToday();
    const complete = await Todo.getCompleted();
    const tasks = todos;

    if (request.accepts("html")) {
      response.render("index", {
        tasks,
        overdue,
        later,
        today,
        complete,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({ overdue, today, later });
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  console.log("Looking for Todo with ID: ", request.params.id);
  try {
    const todo = await todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  console.log("Creating new Todo: ", request.body);
  try {
    await Todo.addTodo(request.body);
    return response.redirect("/"); // response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async function (request, response) {
  console.log("We have to update a Todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/", async function (request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todos = await Todo.findAll();
    const overdue = await Todo.getOverDue();
    const later = await Todo.getDueLater();
    const today = await Todo.getDueToday();
    const complete = await Todo.getCompleted();
    const tasks = todos;

    if (request.accepts("html")) {
      response.render("index", {
        tasks,
        overdue,
        later,
        today,
        complete,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({ overdue, today, later });
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
