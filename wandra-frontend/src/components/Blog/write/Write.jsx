import "./write.css";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { GrAddCircle } from "react-icons/gr";

export default function Write({ posts, setPosts }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [perviewFile, setpreviewFile] = useState(null);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [file, setFile] = useState(null);
  const [fileDataURL, setFileDataURL] = useState(null);
  const changeHandler = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFile(file);
  };
  useEffect(() => {
    let fileReader,
      isCancel = false;
    if (file) {
      fileReader = new FileReader();
      fileReader.onload = (e) => {
        const { result } = e.target;
        if (result && !isCancel) {
          setFileDataURL(result);
        }
      };
      fileReader.readAsDataURL(file);
    }
    return () => {
      isCancel = true;
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort();
      }
    };
  }, [file]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    const datetime = format(new Date(), "MMMM dd, yyyy pp");
    const postdate = format(new Date(), "dd");
    const postmonth = format(new Date(), "MMMM");
    console
      .log
      // datetime - format("July 01, 2021 11:17:36 AM", "MMMM dd, yyyy pp")
      ();
      const formData = new FormData();
        formData.append("title", "testing from react");

        formData.append("cover", selectedFile);

        fetch(`http://127.0.0.1:8000/upload/`, {
          method: 'POST',
          
        
          body: formData
      })
          .then(res => res.json())
          .then((result) => {
              alert(result);
          },
              (error) => {
                  alert('Failed');
              })
    console.log(selectedFile);
    const newPrev = URL.createObjectURL(selectedFile);
    setpreviewFile(URL.createObjectURL(selectedFile));
    const newPost = {
      id,
      Author: "Fahim",
      title: postTitle,
      datetime,
      date: postdate,
      month: postmonth,
      likes: 3,
      catagory: [
        {
          categoryName: "Life",
        },
      ],
      imgLink: true,
      imgOrVideoLink: newPrev,
      comments: 4,
      body: postBody,
    };
    const allPosts = [...posts, newPost];
    setPosts(allPosts);
    setPostTitle("");
    setPostBody("");
    setSelectedFile("");
  };

  return (
    <div className="write">
      <img className="writeImg" src={fileDataURL} alt="" />
      <form className="writeForm" onSubmit={handleSubmit}>
        <div className="writeFormGroup">
          
            <label htmlFor="fileInput">
              <GrAddCircle color="red" size="1.5rem" />
            </label>
            <input
              id="fileInput"
              type="file"
              required
              onChange={changeHandler}
              style={{ display: "none" }}
            />
          

          {/* {fileDataURL ? (
            <p className="img-preview-wrapper">
              {
                <img
                  width="400px"
                  height="400px"
                  src={fileDataURL}
                  alt="preview"
                />
              }
            </p>
          ) : null} */}

          <input
            className="writeInput"
            placeholder="Title"
            type="text"
            required
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            autoFocus={true}
          />
        </div>
        <div className="writeFormGroup">
          <textarea
            className="writeInput writeText"
            placeholder="Tell your story..."
            type="text"
            required
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
            autoFocus={true}
          />
        </div>
        <button className="writeSubmit" type="submit">
          Publish
        </button>
      </form>
    </div>
  );
}
