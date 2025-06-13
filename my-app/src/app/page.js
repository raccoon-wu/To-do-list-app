"use client"
import { useEffect, useState } from "react";
import { Table } from '@mantine/core';

export default function Home() {

  const [list, setList] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api");
      const data = await res.json();
      setList(data);
    };
    fetchData();
  }, []);

  // const rows = list.map(() => (

  // ))
  return (
    <div className="bg-slate-700 w-screen h-screen justify-center items-center" >
      {/* <pre className="bg-blue">{JSON.stringify(list, null, 2)}</pre> */}
    <Table className="bg-slate-500 w-1/2 h-1/2">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Title</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      {/* <Table.Tbody>{list}</Table.Tbody> */}
    </Table>
    </div>
  );
}
