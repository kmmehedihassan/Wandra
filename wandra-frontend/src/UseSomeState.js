import { useState, useEffect } from 'react';

export function UseSomeState() {
    const [posts, setPosts] = useState([
        {
            id: 1,
            Author: "Fahim",
            title: "My First Post",
            datetime: "July 01, 2021 03:17:36 PM",
            date: "8",
            month: "NOVEM",
            likes: 3,
            catagory: [
                {
                    "categoryName": "Music"
                }],
            imgLink: false,
            imgOrVideoLink: "http://techslides.com/demos/sample-videos/small.ogv",
            comments: 3,
            body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!",
        },
        {
            id: 2,
            Author: "Sakib",
            title: "My 2nd Post",
            datetime: "July 01, 2021 11:17:36 AM",
            date: "8",
            month: "AUGUST",
            likes: 3,
            catagory: [
                {
                    "categoryName": "Music"
                }],
            imgLink: false,
            imgOrVideoLink:
                "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
            comments: 3,
            body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!",
        },
        {
            id: 3,
            Author: "Eshen",
            title: "My 3rd Post",
            datetime: "July 01, 2021 11:17:36 AM",
            date: "8",
            month: "AUGUST",
            likes: 3,
            catagory: [
                {
                    "categoryName": "Life"
                }],
            imgLink: true,
            imgOrVideoLink:
                "https://images.pexels.com/photos/6711867/pexels-photo-6711867.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
            comments: 3,
            body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!",
        },
        {
            id: 4,
            Author: "Taskin",
            title: "My Fourth Post",
            datetime: "July 01, 2021 11:17:36 AM",
            date: "9",
            month: "AUGUST",
            imgLink: true,
            likes: 3,
            catagory: [
                {
                    "categoryName": "Music"
                },
                {
                    "categoryName": "Life"
                }],
            imgOrVideoLink:
                "https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
            comments: 3,
            body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!",
        },
    ]);



    return { posts, setPosts };
}
