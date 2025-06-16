"use client"
import { useEffect, useState } from "react";
import { Box, Table, TextInput, Button, Checkbox } from '@mantine/core';
import "./globals.css"
export default function Home() {

  const [message, setMessage] = useState("What");
  //.json string fetched from db
  const [list, setList] = useState(null);

  // tracks and stores user input for new tasks to add
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dateError, setDateError] = useState("");

  // allow edits and stores updates to existing tasks
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {       //async so application is not frozen whilst script is running

      const response = await fetch("/api/dbFunctions", { method: "GET" });
      // await - makes javascript wait for result of promise (to resolve or reject, ) before continuing
      // fetch makes HTTP requests, returns a promise that resolves to the request response
      // await and fetch are used together to make async code behave like synchronous code

      const data = await response.json();
      if (Array.isArray(data)) {
        setList(data);
      } else {
        console.error("Unexpected data from server:", data);
        setMessage("Failed to load data");
      }
    };
    fetchData();
  }, []);

  // If shit isn't loaded, just return a basic loading screen
  if (!list) {
    return <p className="text-white text-center mt-10">Loading...</p>;
  }

  const isValidDate = (newDate) => {
    // if (!/^\d+$/.test(dueDate)) return (setDateError("Please use only numbers?"))
    // Checks if date is in dd-mm-yyyy format, only digits and dashes are allowed
    if (newDate == "") return (setDateError("Date required"));
    if (!/^\d{2}-\d{2}-\d{4}$/.test(newDate)) return (setDateError("Date required in dd-mm-yyyy format"));

    // splits input string into ["xx", "xx", "xx"] as sperated by "-", converts each string into a number, then assigns through array descructuring
    const [day, month, year] = newDate.split("-").map(Number);
    // 'Date' object allows JavaScript to parse reliably, can only be created if all values are valid, otherwise Date returns 'Invalid date'
    //  .padStart(2, '0') ensures it's always 2 digits
    const date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

    if (
      // isNaN = is Not a Number and is a boolean check for whether the inserted value is a number or not
      // if date = 'Invalid date', isNan = true
      isNaN(date.getTime()) ||
      date.getDate() !== day ||
      date.getMonth() + 1 !== month ||
      date.getFullYear() !== year
    ) {
      return setDateError("Date does not exist");
    }
    setDateError(null);
  };

  const handleSubmit = async () => {
    // prevent submit if required fields aren't filled
    if (!title.trim() || !dueDate.trim() || dateError) {
      return (setMessage("Required fields are not filled in!!"));
    }

    const res = await fetch("/api/dbFunctions", {
      method: "POST",
      headers: { "Content-Type": "application/json", }, // informs server that body of the request ontains JSON data
      body: JSON.stringify({                            // converts Javascript objects into JSON data
        title: title,
        description: description,
        due_date: dueDate,
        status: "Pending", // default status
      }),
    });

    if (res.ok) { //Checks if HTTP response status is in the range 200-299 (successful request)
      const updated = await res.json();

      setTitle("");
      setDescription("");
      setDueDate("");
      setDateError("");
      if (Array.isArray(updated)) { // checks whether given value is array
        setList(updated);
        setMessage("Task added successfully!");
      } else {
        setMessage("An error has occoured during the updates:(");
      }
    } else {
      console.error("Failed to add response");
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch("/api/dbFunctions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      const updated = await res.json();
      if (Array.isArray(updated)) {
        setList(updated);
        setMessage("Task was deleted!");
      } else {
        setMessage("Error during delete");
      }
    } else {
      console.error("Failed to generate delete response");
    }
  }

  const handleComplete = async (id, currentStatus) => {
    // allows unchecking
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";

    const res = await fetch("/api/dbFunctions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      const updated = await res.json();
      if (Array.isArray(updated)) {
        setList(updated);
        setMessage("Task is marked complete");
      } else {
        setMessage("An error has occoured during UPDATE");
      }
    } else {
      console.error("Failed to generate response for marking complete");
    }
  }

  const handleEdit = async (id) => {
    const res = await fetch("/api/dbFunctions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: editTitle,
        description: editDescription,
        due_date: editDueDate,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      if (Array.isArray(updated)) {
        setList(updated);
        setMessage("Task updated!");
      } else {
        setMessage("Update failed");
      }
    } else {
      console.error("Failed to generate response for edit");
    }

    setEditingId(null); 
  };

  if (!list) {
    return <p>loading...</p>
  }

  const rows = list.map((task) => (
    <Table.Tr key={task.id}>
      <Table.Td>
        <Checkbox
          checked={task.status === "Completed"}
          onChange={() => handleComplete(task.id, task.status)} />
      </Table.Td>
      <Table.Td>
        {editingId === task.id ? (
          <TextInput
            placeholder="Enter task title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.currentTarget.value)}
            error={!editTitle.trim() ? "Task required :(" : false}            // error validation where .trim() ensures white spaces don't count as valid input
          />
        ) : (
          <p>{task.title}</p>
        )}
      </Table.Td>

      <Table.Td>
        {editingId === task.id ? (
          <TextInput
            value={editDescription}
            placeholder="(Optional) Enter task description"
            onChange={(e) => setEditDescription(e.currentTarget.value)}
          />
        ) : (
          <p>{task.description}</p>
        )}</Table.Td>

      <Table.Td>
        {editingId === task.id ? (
          <TextInput
            placeholder="Enter due date"
            value={editDueDate}
            onChange={(e) => {
              const newDate = e.currentTarget.value;  //setState is asynchronous, ensures setState get the latest value
              setEditDueDate(newDate)
              isValidDate(newDate);
            }}
            error={dateError} />
        ) : (
          <p>{task.due_date}</p>
        )}
      </Table.Td>

      <Table.Td>{task.status}</Table.Td>
      <Table.Td>
        {editingId === task.id ? (
          <>
            <Button onClick={() => handleEdit(task.id)} color="green">Save</Button>
            <Button onClick={() => setEditingId(null)} color="red">Cancel</Button>
          </>
        ) : (
          <>
            <Button color="red" onClick={() => handleDelete(task.id)}>Delete</Button>
            <Button
              onClick={() => {
                setEditingId(task.id);
                setEditTitle(task.title);
                setEditDescription(task.description);
                setEditDueDate(task.due_date);
              }}>Edit</Button>
          </>
        )}

      </Table.Td>
    </Table.Tr>

  ))


  return (
    <div className=" w-full h-full justify-center items-center" >
      <Table withRowBorders={false} verticalSpacing="md" className="bg-slate-300">
        <Table.Thead className="bg-slate-500">
          <Table.Tr >
            <Table.Th className="bg-slate-300"> </Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows}
          <Table.Tr className="bg-white align-top h-16 ">
            <Table.Td></Table.Td>
            <Table.Td >
              <TextInput
                required                                                      // adds asterisk, prevents submission ONLY if wrapped in <form onSubmit> if field is empty
                withAsterisk
                label="Title"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                error={!title.trim() ? "Task required :(" : false}            // error validation where .trim() ensures white spaces don't count as valid input
              />
            </Table.Td>
            <Table.Td>
              <TextInput
                classNames={{ input: "w-5/6" }}                                   // mantine styling
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                placeholder="(Optional) Enter task description" />
            </Table.Td>
            <Table.Td>
              <TextInput
                required
                label="Due Date"
                placeholder="Enter due date"
                value={dueDate}
                onChange={(e) => {
                  const newDate = e.currentTarget.value;  //setState is asynchronous, ensures setState get the latest value
                  setDueDate(newDate)
                  isValidDate(newDate);
                }}
                error={dateError} />
            </Table.Td>
            <Table.Td>
              <Button className="mt-5" color="green" onClick={handleSubmit}>
                Submit New Task
              </Button>
            </Table.Td>
          </Table.Tr>

        </Table.Tbody>

      </Table>
      <p>{message}</p>
    </div>
  );
}
