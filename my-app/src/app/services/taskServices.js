// external I/O API calls to server

export async function fetchTasks() {
  const res = await fetch("/api/dbFunctions", { method: "GET" });
  return res;
}

export async function addTask({ title, description, due_date }) {
  const res = await fetch("/api/dbFunctions", {
    method: "POST",
      headers: { "Content-Type": "application/json", }, // informs server that body of the request ontains JSON data
      body: JSON.stringify({                            // converts Javascript objects into JSON data
      title,
      description,
      due_date,
      status: "Pending",
    }),
  });
  return res;
}

export async function deleteTask(id) {
  const res = await fetch("/api/dbFunctions", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res;
}

export async function updateTaskStatus(id, status) {
  const res = await fetch("/api/dbFunctions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
    return res;
}

export async function editTask(id, { title, description, due_date }) {
  const res = await fetch("/api/dbFunctions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title, description, due_date }),
  });
    return res;
}
