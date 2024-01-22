/* eslint-disable no-undef */
const express = require("express");
const app = express();
var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
app.use(flash());
const saltRounds = 10;
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "its-my-secret-key1010",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
  }),
);
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) return done(null, user);
          else return done(null, false, { message: "Invalid password" });
        })
        .catch((error) => {
          return done(error);
        });
    },
  ),
);
passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});
app.get("/", async (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("index", {
    title: "Todo List",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    try {
      const allTodos = await Todo.getTodos(loggedInUser);
      const overdue = await Todo.overdue(loggedInUser);
      const dueToday = await Todo.dueToday(loggedInUser);
      const dueLater = await Todo.dueLater(loggedInUser);
      const completed = await Todo.completed(loggedInUser);
      if (request.accepts("html")) {
        response.render("todo", {
          allTodos,
          overdue,
          dueToday,
          dueLater,
          completed,
          csrfToken: request.csrfToken(),
        });
      } else {
        response.json({
          allTodos,
          overdue,
          dueToday,
          dueLater,
          completed,
        });
      }
    } catch (error) {
      console.log(error);
      response.status(422).json(error);
    }
  },
);

app.get("/signup", (request, response) => {
  response.render("signup", { csrfToken: request.csrfToken() });
});
app.get("/login", (request, response) => {
  response.render("login", { csrfToken: request.csrfToken() });
});
app.get("/signout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});
app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    console.log(request.user);
    if (request.body.email.length == 0) {
      request.flash("error", "Email can not be empty!");
      return response.redirect("/login");
    }

    if (request.body.password.length < 8) {
      request.flash("error", "Password length should be minimun 8");
      return response.redirect("/login");
    }
    response.redirect("/todos");
  },
);

app.post("/users", async (request, response) => {
  if (request.body.firstName.length == 0) {
    request.flash("error", "First name can not be empty!");
    return response.redirect("/signup");
  }
  if (request.body.email.length == 0) {
    request.flash("error", "Email can not be empty!");
    return response.redirect("/signup");
  }

  if (request.body.password.length < 8) {
    request.flash("error", "Password length should be minimun 8");
    return response.redirect("/signup");
  }
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedPwd);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      password: hashedPwd,
      email: request.body.email,
    });
    request.login(user, (err) => {
      if (err) console.log(err);
      response.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
  }
});
app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("Processing list of all Todos ...");
    try {
      const todos = await Todo.findAll();
      return response.json(todos);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  },
);

app.get(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      if (!todo) {
        return response.status(404).json({ error: "Todo not found" });
      }
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  },
);

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todos");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      if (!todo) {
        return response.status(404).json({ error: "Todo not found" });
      }
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed,
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (req, response) {
    console.log("We must delete a Todo with ID: ", req.params.id);
    const loggedInUser = req.user.id;

    try {
      await Todo.remove(req.params.id, loggedInUser);
      response.json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

module.exports = app;
