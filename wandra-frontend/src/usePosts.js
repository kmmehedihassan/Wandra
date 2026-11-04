// Blog posts, saved in localStorage so new posts and likes survive a reload.
import { useEffect, useState } from "react";

export const CATEGORIES = ["Beach", "Nature", "Culture", "Adventure", "Food", "Tips"];

const STORAGE_KEY = "BlogPosts:v3";

const DEFAULT_POSTS = [
  {
    id: 1,
    Author: "Fahim",
    title: "Three slow days on St. Martin's Island",
    createdAt: "2026-10-02T09:30:00.000Z",
    categories: ["Beach", "Tips"],
    image: "/images/st2.jpg",
    likedBy: ["Sakib", "Eshen"],
    body:
      "We took the morning ship from Teknaf and arrived to turquoise water and a sky full of gulls. St. Martin's is small enough to walk end to end, so we rented bicycles and spent the first day circling the island, stopping for coconut water whenever we got thirsty.\n\nThe best moment was sunset at the western beach, where the coral rocks turn gold. If you go, stay at least two nights so you can visit Chera Dwip at low tide, and carry cash — card machines are rare on the island.",
  },
  {
    id: 2,
    Author: "Sakib",
    title: "Into the mangroves: a Sundarbans boat trip",
    createdAt: "2026-09-18T07:00:00.000Z",
    categories: ["Nature", "Adventure"],
    image: "/images/su3.jpg",
    likedBy: ["Fahim"],
    body:
      "Our boat left Khulna before dawn and by mid-morning we were drifting through narrow channels lined with sundari trees. We didn't see a tiger, but we did spot spotted deer, kingfishers and a crocodile sunning itself on the bank.\n\nBook with a licensed operator, pack mosquito repellent and a light rain jacket, and keep your voice low on the smaller creeks — that's when the wildlife comes out.",
  },
  {
    id: 3,
    Author: "Eshen",
    title: "Tea, rain and lemon tea in Srimangal",
    createdAt: "2026-08-30T11:15:00.000Z",
    categories: ["Nature", "Food"],
    image: "/images/sr2.jpeg",
    likedBy: [],
    body:
      "Srimangal is the tea capital of Bangladesh, and the rolling green estates look unreal after a monsoon shower. We walked through Lawachara National Park in the morning and spent the afternoon trying the famous seven-layer tea.\n\nIt's an easy train ride from Dhaka, and the cooler hill air is a welcome break from the city.",
  },
  {
    id: 4,
    Author: "Taskin",
    title: "A walk through old Dhaka and Ahsan Manzil",
    createdAt: "2026-08-12T15:45:00.000Z",
    categories: ["Culture"],
    image: "/images/a1.jpeg",
    likedBy: ["Fahim", "Sakib", "Eshen"],
    body:
      "The pink palace of Ahsan Manzil sits right on the Buriganga river, and the museum inside tells the story of the Nawabs of Dhaka. Afterwards we wandered the lanes of old Dhaka, eating biryani and watching rickshaws squeeze through impossibly narrow streets.\n\nGo early in the day to avoid the heat, and take a short boat ride across the river for the best view of the palace.",
  },
];

function load() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) {
    // fall through to defaults
  }
  return DEFAULT_POSTS;
}

export function usePosts() {
  const [posts, setPosts] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      // Storage full (e.g. a very large image); keep the posts in memory.
    }
  }, [posts]);

  return { posts, setPosts };
}
