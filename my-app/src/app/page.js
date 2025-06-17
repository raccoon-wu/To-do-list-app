"use client"
import { useEffect, useState } from "react";
import { Box, Table, TextInput, Button, Checkbox } from '@mantine/core';
import { fetchTasks, addTask, deleteTask, updateTaskStatus, editTask, } from "./services/taskServices.js"; //server API calls
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

  const [ascSort, setAscSort] = useState(true);
  const [statusSort, setStatusSort] = useState("Both");

  // initial data fetch from db on component mount
  useEffect(() => {
    const fetchData = async () => {       //async so application is not frozen whilst script is running

      const res = await fetchTasks();
      // await - makes javascript wait for result of promise (to resolve or reject, ) before continuing
      // fetch makes HTTP requests, returns a promise that resolves to the request response
      // await and fetch are used together to make async code behave like synchronous code

      if (res.ok) {
        const updated = await res.json();
        if (Array.isArray(updated)) {
          setList(updated);
        } else {
          console.log("Db data not an array");
        }
      } else {
        console.log("Failed to load updates from db")
      }
    };
    fetchData();
  }, []);

  // checks whether dates are not correct dd/mm/yyyy format, is a real valid date and not in the past
  const isValidDate = (newDate) => {
    // if (!/^\d+$/.test(dueDate)) return (setDateError("Please use only numbers?"))
    // Checks if date is in dd-mm-yyyy format, only digits and dashes are allowed
    if (newDate == "") return (setDateError("Date required"));
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(newDate)) { return setDateError("Date must be in dd/mm/yyyy format"); }

    // splits input string into ["xx", "xx", "xx"] as sperated by "-", converts each string into a number, then assigns through array descructuring
    const [day, month, year] = newDate.split("/").map(Number);
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return setDateError("Date must be today or later");
    }
    setDateError(null);
  };

  // ensures valid inputs prior to server api call for adding new task, refreshes list when successful, otherwise returns error messages
  const handleSubmit = async () => {
    // prevent submit if required fields aren't filled
    if (!title.trim() || !dueDate.trim() || dateError) {
      return (setMessage("Required fields are not filled in!!"));
    }

    const res = await addTask({ title, description, due_date: dueDate });

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

  // passes id to server in api call to delete, refreshes list when successful, otherwise returns error messages
  const handleDelete = async (id) => {
    const res = await deleteTask(id);

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

  // passes status to server to update, refreshes list when successful, otherwise returns error messages
  const handleComplete = async (id, currentStatus) => {
    // allows unchecking
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";

    const res = await updateTaskStatus(id, newStatus);

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

  // passes id, editted title, editted descrip, editted due date to server, refreshes list when successful, otherwise returns error messages
  const handleEdit = async (id) => {
    const res = await editTask(id, {
      title: editTitle,
      description: editDescription,
      due_date: editDueDate,
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

  // parses dates into <Date> objects which Javascript can handle, compares each value to the next
  const handleDateSort = () => {
    if (list) {
      const sortedDates = [...list].sort((a, b) => {
        const [aDay, aMonth, aYear] = a.due_date.split("/");
        const [bDay, bMonth, bYear] = b.due_date.split("/");

        const aDate = new Date(`${aYear}-${aMonth}-${aDay}`);
        const bDate = new Date(`${bYear}-${bMonth}-${bDay}`);

        return (
          ascSort ? (aDate - bDate) : (bDate - aDate)
        )
      });
      setList(sortedDates);
      setAscSort(!ascSort);
    } else { setMessage("No items to sort!") }
  }

  // filters new list based on status - condition ? () : (), condition can either be pending only, completedly only or allow both
  const filteredStatusList = Array.isArray(list)
    ? list.filter((task) => {
      if (statusSort === "PendingOnly") return task.status === "Pending";
      if (statusSort === "CompletedOnly") return task.status === "Completed";
      return true;
    })
    : []; // fallback to return empty array instead of crashing

  // instructions to user when list is empty
  useEffect(() => {
    if (list === null || list.length === 0) {
      setMessage("Add your first task to start!");
    } else {
      setMessage(""); // Clear message when tasks exist
    }
  }, [list]);

  // prevents crashing in case list is null
  if (!Array.isArray(list)) {
    return <p>Loading...</p>;
  }

  // maps new table rows for each task
  const rows = filteredStatusList.map((task) => (
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

      {/* editing buttons UI */}
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

        {/* table headers (titles) */}
        <Table.Thead className="bg-slate-500">


          <Table.Tr >
            <Table.Th className="bg-slate-300"> </Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th onClick={handleDateSort} className="cursor-pointer">Due Date {ascSort ? "↑" : "↓"}</Table.Th>
            <Table.Th onClick={() => {
              setStatusSort((prev) =>
                prev === "Both" ? "PendingOnly" :
                  prev === "PendingOnly" ? "CompletedOnly" :
                    "Both"
              );
            }}
              className="cursor-pointer">Status ({statusSort})</Table.Th>
          </Table.Tr>
        </Table.Thead>

        {/* table body */}
        <Table.Tbody>
          {rows}
          <Table.Tr className="bg-white align-top h-16 ">
            <Table.Td></Table.Td>

            {/* extra row for submitting new tasks */}
            {/* Input space for new title */}
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

            {/* Input space for new description */}
            <Table.Td>
              <TextInput
                classNames={{ input: "w-5/6" }}                                   // mantine styling
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                placeholder="(Optional) Enter task description" />
            </Table.Td>

            {/* Input space for new due date */}
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

            {/* Submit input button */}
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
