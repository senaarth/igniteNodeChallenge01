const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const user = users.find((user) => user.username === request.headers.username);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Username already being used." });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  request.user.todos.push(newToDo);

  return response.status(201).json(newToDo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const toDo = request.user.todos.find((todo) => todo.id === request.params.id);

  if (!toDo) {
    return response.status(404).json({ error: "To-Do not found." });
  }

  toDo.title = title;
  toDo.deadline = new Date(deadline);

  return response.status(201).json(toDo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const toDo = request.user.todos.find((todo) => todo.id === request.params.id);

  if (!toDo) {
    return response.status(404).json({ error: "To-Do not found." });
  }

  toDo.done = true;

  return response.status(201).json(toDo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {

  const toDo = request.user.todos.find((todo) => todo.id === request.params.id);

  if (!toDo) {
    return response.status(404).json({ error: "To-Do not found." });
  }

  request.user.todos.splice(toDo, 1);

  return response.status(204).send();
});

module.exports = app;
