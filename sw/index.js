const { app, html } = await include("app");
const todos = await include("stores/todos");

const layout = await include("fragments/layout");
const todoList = await include("fragments/todoList");
const todoItem = await include("fragments/todoItem");
const todoItemEdit = await include("fragments/todoItemEdit");

function button() {
  return html`<button hx-post="/click" hx-swap="outerHTML">${count}</button>`;
}

app.get("/", async () => {
  return layout({
    title: "Todo List",
    children: html`
      <header>
        <h1>Client-Side HATEOAS</h1>
        <h2>HTMX + Service Workers</h2>
      </header>
      ${todoList(todos.getAll())}
    `,
  });
});

app.post("/todos", async (req) => {
  const { task } = await req.body();
  todos.create(task);

  return todoList(todos.getAll());
});

app.put("/todos/:id", async (req) => {
  const { id } = req.params;
  const body = await req.body();
  const delta = {};

  if (body.completed !== undefined) delta.completed = body.completed === "true";
  if (body.task !== undefined) delta.task = body.task;

  const todo = todos.update(id, delta);
  console.log(todo, todos.getAll());

  return todoItem(todo);
});

app.get("/todos/:id/edit", async (req) => {
  const { id } = req.params;
  const todo = todos.get(id);
  if (!todo) return new Response(null, { status: 404 });

  return todoItemEdit(todos.get(id));
});

app.delete("/todos/:id", async (req) => {
  const { id } = req.params;
  const deletedTodo = Boolean(todos.delete(id));
  if (deletedTodo === null) return new Response(null, { status: 404 });
  return html``;
});
