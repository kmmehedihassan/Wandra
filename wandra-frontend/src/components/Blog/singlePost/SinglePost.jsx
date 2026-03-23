import { Link, useHistory, useParams } from "react-router-dom";
import Post from "../post/Post";
import "./singlePost.css";
import { AiOutlineDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import formatDistance from "date-fns/formatDistance";
export default function SinglePost({ posts, handleDelete }) {
  const { id } = useParams();
  console.log({ id });
  const history = useHistory();
  const post = posts.find((post) => post.id.toString() === id);
  let timeDistance = (time) => {
    return formatDistance(new Date(), new Date(time));
  };

  // const createdAt = new Date(post.datetime);
  // const today = new Date();
  const differenceInTime = timeDistance(post.datetime);
  console.log(differenceInTime);
  return (
    <div className="singlePost">
      <div className="singlePostWrapper">
        {/* <img className="singlePostImg" src={post.imgOrVideoLink} alt="" /> */}

        {post.imgLink === true ? (
          <img className="singlePostImg" src={post.imgOrVideoLink} alt="" />
        ) : (
          <video className="singlePostImg" controls>
            <source src={post.imgOrVideoLink} type="video/mp4" />
          </video>
        )}

        <h1 className="singlePostTitle">
          {post.title}
          <div className="singlePostEdit">
            {/* <FaEdit size="1.5rem"/> */}
            <AiOutlineDelete
              size="1.5rem"
              onClick={() => {
                console.log(typeof handleDelete);

                handleDelete(post.id);
                history.push("/blog");
              }}
            />
          </div>
        </h1>
        <div className="singlePostInfo">
          <span>
            Author:
            <b className="singlePostAuthor">
              <Link className="link" to={`/blog/posts?username=${post.Author}`}>
                {post.Author}
              </Link>
            </b>
          </span>
          <span>{differenceInTime}</span>
        </div>
        <p className="singlePostDesc">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste error
          quibusdam ipsa quis quidem doloribus eos, dolore ea iusto impedit!
          Voluptatum necessitatibus eum beatae, adipisci voluptas a odit modi
          eos! Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste
          error quibusdam ipsa quis quidem doloribus eos, dolore ea iusto
          impedit! Voluptatum necessitatibus eum beatae, adipisci voluptas a
          odit modi eos! Lorem, ipsum dolor sit amet consectetur adipisicing
          elit. Iste error quibusdam ipsa quis quidem doloribus eos, dolore ea
          iusto impedit! Voluptatum necessitatibus eum beatae, adipisci voluptas
          a odit modi eos! Lorem, ipsum dolor sit amet consectetur adipisicing
          elit. Iste error quibusdam ipsa quis quidem doloribus eos, dolore ea
          iusto impedit! Voluptatum necessitatibus eum beatae, adipisci voluptas
          a odit modi eos! Lorem, ipsum dolor sit amet consectetur adipisicing
          elit. Iste error quibusdam ipsa quis quidem doloribus eos, dolore ea
          iusto impedit! Voluptatum necessitatibus eum beatae, adipisci voluptas
          a odit modi eos!
          <br />
          <br />
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste error
          quibusdam ipsa quis quidem doloribus eos, dolore ea iusto impedit!
          Voluptatum necessitatibus eum beatae, adipisci voluptas a odit modi
          eos! Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste
          error quibusdam ipsa quis quidem doloribus eos, dolore ea iusto
          impedit! Voluptatum necessitatibus eum beatae, adipisci voluptas a
          odit modi eos! Lorem, ipsum dolor sit amet consectetur adipisicing
          elit. Iste error quibusdam ipsa quis quidem doloribus eos, dolore ea
          iusto impedit! Voluptatum necessitatibus eum beatae, adipisci voluptas
          a odit modi eos! Lorem, ipsum dolor sit amet consectetur.
        </p>
      </div>
    </div>
  );
}
