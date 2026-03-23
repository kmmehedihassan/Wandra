import { useState, useEffect } from 'react';

import React from 'react'

export  function UseLikedPost() {
    const [postsLiked, setPostsLiked] = useState([
        {
            UserName: "Fahim",
            LikedPosts: [
                {
                    postid: 1,
                    isLiked: false
                },
                {
                    postid: 3,
                    isLiked: false
                },
                {
                    postid: 4,
                    isLiked: false
                },
                {
                    postid: 2,
                    isLiked: false
                },
            ]
        }

    ])
    return { postsLiked, setPostsLiked };
}
