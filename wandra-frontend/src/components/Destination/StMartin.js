import React from "react";
import "./comment_style.css";
import "./dest_details.css";
import "./destinations.css";

const StMartin = () => {
  return (
    <div>
      <div>
        <img
          src="images/st_intro.jpg"
          width="100%"
          style={{
            filter: "brightness(90%)",
            height: "635px",
            "margin-bottom": "30px",
          }}
          alt="st_intro"
        />
        <div className="centered">
          <h1
            style={{
              color: "white",
              "font-size": "125px",
              "font-weight": "bold",
            }}
          >
            Saint Martin's Island
          </h1>
        </div>
      </div>

      <div className="main_container">
        <div className="text_box" style={{ width: "70%" }}>
          <p
            style={{
              color: "#DC582A",
              "font-weight": "bold",
              "font-size": "40px",
            }}
          >
            OVERVIEW:
          </p>
          <p>
            Saint Martin is situated in the southeast part of Bangladesh and is
            the only coral island of the country. This tiny island is called
            "Narikel Jinjira" by the local people as abundant coconut grows
            here. It is one of the best places to visit in Bangladesh that
            harbors some of the most picturesque beaches in Bangladesh, where
            you can enjoy beach sports, a bonfire, and beach parties.
            <br />
            You can also go scuba diving or hire a speed boat and take a tour
            around the island. There are many restaurants and beach shacks here
            where you can enjoy local fresh seafood.
          </p>
          <p
            style={{
              color: "#DC582A",
              "font-weight": "bold",
              "font-size": "30px",
            }}
          >
            Things to know:
          </p>

          <div className="accordion" id="accordionExample">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="false"
                  aria-controls="collapseOne"
                >
                  <p
                    style={{
                      color: "#DC582A",
                      "font-weight": "bold",
                      "font-size": "25px",
                    }}
                  >
                    How to go to this place
                  </p>
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse"
                aria-labelledby="headingOne"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <strong>This is the first item's accordion body.</strong> It
                  is shown by default, until the collapse plugin adds the
                  appropriate classes that we use to style each element. These
                  classes control the overall appearance, as well as the showing
                  and hiding via CSS transitions. You can modify any of this
                  with custom CSS or overriding our default variables. It's also
                  worth noting that just about any HTML can go within the{" "}
                  <code>.accordion-body</code>, though the transition does limit
                  overflow.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingTwo">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="false"
                  aria-controls="collapseTwo"
                >
                  <p
                    style={{
                      color: "#DC582A",
                      "font-weight": "bold",
                      "font-size": "25px",
                    }}
                  >
                    When is the best time to go there
                  </p>
                </button>
              </h2>
              <div
                id="collapseTwo"
                className="accordion-collapse collapse"
                aria-labelledby="headingTwo"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <strong>This is the second item's accordion body.</strong> It
                  is hidden by default, until the collapse plugin adds the
                  appropriate classes that we use to style each element. These
                  classes control the overall appearance, as well as the showing
                  and hiding via CSS transitions. You can modify any of this
                  with custom CSS or overriding our default variables. It's also
                  worth noting that just about any HTML can go within the{" "}
                  <code>.accordion-body</code>, though the transition does limit
                  overflow.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingThree">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="false"
                  aria-controls="collapseThree"
                >
                  <p
                    style={{
                      color: "#DC582A",
                      "font-weight": "bold",
                      "font-size": "25px",
                    }}
                  >
                    What are the activities that can be done there
                  </p>
                </button>
              </h2>
              <div
                id="collapseThree"
                className="accordion-collapse collapse"
                aria-labelledby="headingThree"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <strong>This is the third item's accordion body.</strong> It
                  is hidden by default, until the collapse plugin adds the
                  appropriate classes that we use to style each element. These
                  classes control the overall appearance, as well as the showing
                  and hiding via CSS transitions. You can modify any of this
                  with custom CSS or overriding our default variables. It's also
                  worth noting that just about any HTML can go within the{" "}
                  <code>.accordion-body</code>, though the transition does limit
                  overflow.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingfour">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapsefour"
                  aria-expanded="false"
                  aria-controls="collapsefour"
                >
                  <p
                    style={{
                      color: "#DC582A",
                      "font-weight": "bold",
                      "font-size": "25px",
                    }}
                  >
                    What are the activities that can be done there
                  </p>
                </button>
              </h2>
              <div
                id="collapsefour"
                className="accordion-collapse collapse"
                aria-labelledby="headingfour"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <strong>This is the third item's accordion body.</strong> It
                  is hidden by default, until the collapse plugin adds the
                  appropriate classes that we use to style each element. These
                  classes control the overall appearance, as well as the showing
                  and hiding via CSS transitions. You can modify any of this
                  with custom CSS or overriding our default variables. It's also
                  worth noting that just about any HTML can go within the{" "}
                  <code>.accordion-body</code>, though the transition does limit
                  overflow.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingfive">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapsefive"
                  aria-expanded="false"
                  aria-controls="collapsefive"
                >
                  <p
                    style={{
                      color: "#DC582A",
                      "font-weight": "bold",
                      "font-size": "25px",
                    }}
                  >
                    What are the activities that can be done there
                  </p>
                </button>
              </h2>
              <div
                id="collapsefive"
                className="accordion-collapse collapse"
                aria-labelledby="headingfive"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <strong>This is the third item's accordion body.</strong> It
                  is hidden by default, until the collapse plugin adds the
                  appropriate classes that we use to style each element. These
                  classes control the overall appearance, as well as the showing
                  and hiding via CSS transitions. You can modify any of this
                  with custom CSS or overriding our default variables. It's also
                  worth noting that just about any HTML can go within the{" "}
                  <code>.accordion-body</code>, though the transition does limit
                  overflow.
                </div>
              </div>
            </div>
          </div>

          <p
            style={{
              color: "#DC582A",
              "font-weight": "bold",
              "font-size": "25px",
              "margin-top": "10px",
            }}
          >
            Gallery:
          </p>

          <div>
            <img
              src="images/st_intro.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
            <img
              src="images/st_intro.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
            <img
              src="images/saintmartin.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
            <img
              src="images/saintmartin.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
            <img
              src="images/st_intro.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
            <img
              src="images/saintmartin.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
            <img
              src="images/st_intro.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
            <img
              src="images/saintmartin.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
            <img
              src="images/st_intro.jpg"
              width="250px"
              height="250px"
              style={{ margin: "30px" }}
            />
          </div>

          <div className="side_container" style={{ width: "30%" }}>
            <div className="form">
              <div className="form-text">
                <h1>
                  <span>
                    <img src="art-1.png" alt="" />
                  </span>
                  Plan a tour here
                  <span>
                    <img src="art-1.png" alt="" />
                  </span>
                </h1>
              </div>
              <div className="main-form">
                <form action="index.php" method="get">
                  <div>
                    <span>Your full name ?</span>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Write your name here..."
                      required
                    />
                  </div>
                  <div>
                    <span>Your email address ?</span>
                    <input
                      type="email"
                      name="name"
                      id="name"
                      placeholder="Write your email here..."
                      required
                    />
                  </div>
                  <div>
                    <span>How many persons?</span>
                    <input
                      type="number"
                      name="prson"
                      id="person"
                      placeholder="No. of persons"
                      required
                    />
                  </div>
                  <div>
                    <span>What is the arrival date ?</span>
                    <input
                      type="date"
                      name="date1"
                      id="date1"
                      placeholder="arrival-date"
                      required
                    />
                  </div>
                  <div>
                    <span>What is the departure date ?</span>
                    <input
                      type="date"
                      name="date2"
                      id="date2"
                      placeholder="departure-date"
                      required
                    />
                  </div>
                  <div>
                    <span>Your phone number ?</span>
                    <input
                      type="number"
                      name="number"
                      id="number"
                      placeholder="Write your number here..."
                      required
                    />
                  </div>
                  <div id="submit">
                    <input type="search" value="SEARCH" id="submit" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <p
          style={{
            color: "#DC582A",
            "font-weight": "bold",
            "font-size": "30px",
          }}
        >
          Comment:{" "}
        </p>

        <form action="/action_page.php">
          <textarea
            name="message"
            rows="2"
            cols="93"
            style={{ border: "solid 2px #DC582A" }}
          >
            I recently visited the place and I love it.
          </textarea>
          <br />
          <input
            type="submit"
            value="Post"
            style={{ color: "#DC582A", "font-weight": "bold" }}
          />
        </form>

        <div className="comment-thread">
          <div className="comment" id="comment-1">
            <a href="#comment-1" className="comment-border-link">
              <span className="sr-only">Jump to comment-1</span>
            </a>
            <div className="comment-heading">
              <div className="comment-voting">
                <button type="button">
                  <span aria-hidden="true">&#9650;</span>
                  <span className="sr-only">Vote up</span>
                </button>
                <button type="button">
                  <span aria-hidden="true">&#9660;</span>
                  <span className="sr-only">Vote down</span>
                </button>
              </div>
              <div className="comment-info">
                <a href="#" className="comment-author">
                  someguy14
                </a>
                <p className="m-0">30 points &bull; 4 days ago</p>
              </div>
            </div>

            <div className="comment-body">
              <p>
                This is really great! I fully agree with what you wrote, and
                this is sure to help me out in the future. Thank you for posting
                this.
              </p>
              <button type="button" style={{ color: "#DC582A" }}>
                Reply
              </button>
              <button type="button" style={{ color: "#DC582A" }}>
                Report
              </button>
            </div>

            <div className="replies">
              <div className="comment" id="comment-2">
                <a href="#comment-2" className="comment-border-link">
                  <span className="sr-only">Jump to comment-2</span>
                </a>
                <div className="comment-heading">
                  <div className="comment-voting">
                    <button type="button">
                      <span aria-hidden="true">&#9650;</span>
                      <span className="sr-only">Vote up</span>
                    </button>
                    <button type="button">
                      <span aria-hidden="true">&#9660;</span>
                      <span className="sr-only">Vote down</span>
                    </button>
                  </div>
                  <div className="comment-info">
                    <a href="#" className="comment-author">
                      randomperson81
                    </a>
                    <p className="m-0">4 points &bull; 3 days ago</p>
                  </div>
                </div>

                <div className="comment-body">
                  <p>Took the words right out of my mouth!</p>
                  <button type="button" style={{ color: "#DC582A" }}>
                    Reply
                  </button>
                  <button type="button" style={{ color: "#DC582A" }}>
                    Report
                  </button>
                </div>
              </div>

              <div className="comment" id="comment-3">
                <a href="#comment-3" className="comment-border-link">
                  <span className="sr-only">Jump to comment-3</span>
                </a>
                <div className="comment-heading">
                  <div className="comment-voting">
                    <button type="button">
                      <span aria-hidden="true">&#9650;</span>
                      <span className="sr-only">Vote up</span>
                    </button>
                    <button type="button">
                      <span aria-hidden="true">&#9660;</span>
                      <span className="sr-only">Vote down</span>
                    </button>
                  </div>
                  <div className="comment-info">
                    <a href="#" className="comment-author">
                      2edgy4u
                    </a>
                    <p className="m-0">-19 points &bull; 3 days ago</p>
                  </div>
                </div>

                <div className="comment-body">
                  <p>
                    Wow, are you serious? You have some pretty low standards to
                    be able to enjoy this. Good for you I guess, but you should
                    honestly stop making these embarrassing comments.
                  </p>
                  <button type="button" style={{ color: "#DC582A" }}>
                    Reply
                  </button>
                  <button type="button" style={{ color: "#DC582A" }}>
                    Report
                  </button>
                </div>

                <div className="replies">
                  <div className="comment" id="comment-4">
                    <a href="#comment-4" className="comment-border-link">
                      <span className="sr-only">Jump to comment-4</span>
                    </a>
                    <div className="comment-heading">
                      <div className="comment-voting">
                        <button type="button">
                          <span aria-hidden="true">&#9650;</span>
                          <span className="sr-only">Vote up</span>
                        </button>
                        <button type="button">
                          <span aria-hidden="true">&#9660;</span>
                          <span className="sr-only">Vote down</span>
                        </button>
                      </div>
                      <div className="comment-info">
                        <a href="#" className="comment-author">
                          modpowertrip
                        </a>
                        <p className="m-0">9 points &bull; 2 days ago</p>
                      </div>
                    </div>

                    <div className="comment-body">
                      <p>
                        You are breaking <a href="#rule-687">Rule #687</a> with
                        that comment. Please avoid posting like this in the
                        future, or I will ban you.
                      </p>
                      <button type="button" style={{ color: "#DC582A" }}>
                        Reply
                      </button>
                      <button type="button" style={{ color: "#DC582A" }}>
                        Report
                      </button>
                    </div>
                  </div>

                  <div className="comment" id="comment-5">
                    <a href="#comment-5" className="comment-border-link">
                      <span className="sr-only">Jump to comment-5</span>
                    </a>
                    <div className="comment-heading">
                      <div className="comment-voting">
                        <button type="button">
                          <span aria-hidden="true">&#9650;</span>
                          <span className="sr-only">Vote up</span>
                        </button>
                        <button type="button">
                          <span aria-hidden="true">&#9660;</span>
                          <span className="sr-only">Vote down</span>
                        </button>
                      </div>
                      <div className="comment-info">
                        <a href="#" className="comment-author">
                          imemespam
                        </a>
                        <p className="m-0">3 points &bull; 2 days ago</p>
                      </div>
                    </div>

                    <div className="comment-body">
                      <p>Well, that's just like your opinion man.</p>
                      <button type="button" style={{ color: "#DC582A" }}>
                        Reply
                      </button>
                      <button type="button" style={{ color: "#DC582A" }}>
                        Report
                      </button>
                    </div>
                  </div>

                  <div className="comment" id="comment-6">
                    <a href="#comment-6" className="comment-border-link">
                      <span className="sr-only">Jump to comment-6</span>
                    </a>
                    <div className="comment-heading">
                      <div className="comment-voting">
                        <button type="button">
                          <span aria-hidden="true">&#9650;</span>
                          <span className="sr-only">Vote up</span>
                        </button>
                        <button type="button">
                          <span aria-hidden="true">&#9660;</span>
                          <span className="sr-only">Vote down</span>
                        </button>
                      </div>
                      <div className="comment-info">
                        <a href="#" className="comment-author">
                          lukerbro57
                        </a>
                        <p className="m-0">0 points &bull; 2 days ago</p>
                      </div>
                    </div>

                    <div className="comment-body">
                      <p>Lol I agree with you.</p>
                      <button type="button" style={{ color: "#DC582A" }}>
                        Reply
                      </button>
                      <button type="button" style={{ color: "#DC582A" }}>
                        Report
                      </button>
                    </div>
                  </div>

                  <a href="#load-more">Load more replies</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StMartin;
