const request = require("supertest");
const cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("List the todo items", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  // add todo test
  test("create a todo", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    console.log(res.text);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  // mark todo as complete test
  test("Mark a todo as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedTodosResponse.today.length;
    const latestTodo = parsedGroupedTodosResponse.today[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        completed: true,
        _csrf: csrfToken,
      });

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  // update todo test
  test("Update a todo", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedTodosResponse.today.length;
    const latestTodo = parsedGroupedTodosResponse.today[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        completed: true,
        _csrf: csrfToken,
      });

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  // delete todo test
  test("Delete todo using Id", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedTodosResponse.today.length;
    const latestTodo = parsedGroupedTodosResponse.today[dueTodayCount - 1];

    const id = latestTodo.id;

    // const todo = await agent.post("/todos").send({
    //   title: "delete",
    //   dueDate: new Date().toISOString(),
    //   completed: false,
    // });

    // await agent.post("/todos");

    // const parsedResponse = JSON.parse(todo.text);
    // const todoID = parsedResponse.id;

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const deleteTodo = await agent
      .delete(`/todos/${id}`)
      .send({ _csrf: csrfToken });

    const deleteTodoResponse = JSON.parse(deleteTodo.text);

    expect(deleteTodoResponse.success).toBe(true);
  });
});
