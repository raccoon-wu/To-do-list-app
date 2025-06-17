// client-side API functions to interact with backend

// fetches all tasks from server through GET
export async function fetchTasks() {
  const res = await fetch("/api/dbFunctions", { method: "GET" });
  return res;
}

// adds new tasks to server with default status as 'Pending', through POST
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

// deletes tasks through passed id, through DELETE
export async function deleteTask(id) {
  const res = await fetch("/api/dbFunctions", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res;
}

// updates task status through passed id, through PATCH
export async function updateTaskStatus(id, status) {
  const res = await fetch("/api/dbFunctions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
    return res;
}

// updates one or more fields through passed id, through PATCH
// !! WILL THROW ERROR IF NONE ARE PASSED
export async function editTask(id, { title, description, due_date }) {
  const res = await fetch("/api/dbFunctions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title, description, due_date }),
  });
    return res;
}
