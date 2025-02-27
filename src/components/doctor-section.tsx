"use client";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function ForumPost({ post, onSelect }: { post; onSelect: () => void }) {
    const [likes, setLikes] = useState(0); 
  
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-blue-600 font-semibold">{post.title.length > 100 ? post.title.slice(0, 100) + "..." : post.title}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{post.content.length > 100 ? post.content.slice(0, 100) + "..." : post.content}</p>
        {post.content.length > 100 && (
          <button onClick={onSelect} className="text-blue-500 underline text-sm">
            Voir plus
          </button>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <Image
              src={post.authorImage}
              alt="Author"
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
            <div className="ml-2">
              <p className="font-semibold text-blue-700">{post.authorName}</p>
              <p className="text-sm text-gray-500">{post.date}</p>
            </div>
          </div>
          <button
            onClick={() => setLikes(likes + 1)}
            className="flex items-center text-gray-600 dark:text-gray-300"
          >
            <ThumbsUp className="w-5 h-5 mr-1" /> {likes}
          </button>
        </div>
      </div>
    );
  };