"use client"
import { useEffect, useState } from "react";
import { Box, Table, TextInput, Button, Checkbox } from '@mantine/core';
import { fetchTasks, addTask, deleteTask, updateTaskStatus, editTask, } from "./services/taskServices.js"; //server API calls
import "./globals.css"

import { MdEdit, MdDeleteOutline, MdCheck, MdOutlineCancel, MdOutlineAdd } from "react-icons/md";

export default function Home() {

  const [message, setMessage] = useState("Hello User!");
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
        setMessage("Task added successfully :D");
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
        setMessage("Error during delete.");
      }
    } else {
      console.error("Failed to generate delete response.");
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
        setMessage("Task is marked complete :D");
      } else {
        setMessage("An error has occoured during the update :(");
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
        setMessage("Update failed.");
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
          className="m-2"
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
            <Button className="mr-2" onClick={() => handleEdit(task.id)} color="green">
              <MdCheck className="w-5 h-5" />
            </Button>
            <Button onClick={() => setEditingId(null)} color="red">
              <MdOutlineCancel className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              className="mr-2"
              onClick={() => {
                setEditingId(task.id);
                setEditTitle(task.title);
                setEditDescription(task.description);
                setEditDueDate(task.due_date);
              }}>
              <MdEdit size={"1.2rem"} className="w-5 h-5" />
            </Button>

            <Button color="red" onClick={() => handleDelete(task.id)}>
              <MdDeleteOutline size={"1.5rem"} className="w-5 h-5" />
            </Button>

          </>
        )}

      </Table.Td>
    </Table.Tr>

  ))

  // UI display + styling
  return (
    <div className=" w-screen h-screen flex flex-col justify-center items-center bg-stone-800" >
      <div className="w-5/6 h-full flex flex-col justify-center items-center">
        <p className="text-5xl mb-5 text-stone-100">TO DO LIST</p>
        <Table withRowBorders={false} verticalSpacing="sm" className="bg-stone-300"
          striped highlightOnHover highlightOnHoverColor="#e7e5e4" stripedColor="#bfbab7"
          styles={{
            table: {
              border: "3px solid white", // 5px white border
              borderRadius: "0.75rem",   // optional: rounded corners
              borderCollapse: "collapse", // optional: removes double borders between cells
            },
          }}
        >

          {/* table headers (titles) */}
          <Table.Thead >
            <Table.Tr >
              <Table.Th> </Table.Th>
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
              <Table.Th> </Table.Th>
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
                  <MdOutlineAdd className="mr-1 w-5 h-5" /> New task
                </Button>
              </Table.Td>
              <Table.Td></Table.Td>
            </Table.Tr>

          </Table.Tbody>

        </Table>
        <div className="mt-8 rounded-full w-3/4 bg-stone-200">
          <p className="py-4 px-6">System message: {message}</p>
        </div>
      </div>
    </div>
  );
}
