"use client"
import { useEffect, useState } from "react";

export default function Home() {
  const [list, setList] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/route");
      const data = await res.json();
      setList(data);
    };

    fetchData();
  }, []);


   
  return (
    <div>
      <p>{JSON.stringify(list)}</p>
    </div>
  );
}
