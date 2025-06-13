"use client"
import { useEffect, useState } from "react";

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

  return (
    // <div className="bg-white width" >
    //   <p className="bg-white">{JSON.stringify(list)}</p>
    // </div>
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="p-10 bg-white rounded-lg shadow-lg">
        <p className="text-xl text-pink-600">Tailwind is now working!</p>
      </div>
    </div>
  );
}
