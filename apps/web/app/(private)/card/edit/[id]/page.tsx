'use client'
import { useParams } from "next/navigation";

export default function EditSnippet() {
  const { id } = useParams();
  const getSnippetDetails  = async()=>{
    try {
    } catch (error) {
        console.log("error creating snippets.", error);
    }
  };
  return <div>{id}</div>;
}
