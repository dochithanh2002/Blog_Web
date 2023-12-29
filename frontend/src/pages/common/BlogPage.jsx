import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Fab,
  SwipeableDrawer,
  TextField,
  Tooltip,
  Avatar as MuiAvatar,
  Typography,
  ButtonGroup,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { apiBlog } from "../../services/models/BlogModel";
// import ModeCommentIcon from "@mui/icons-material/ModeComment";
import {
  ModeComment as ModeCommentIcon,
  FavoriteRounded as FavoriteRoundedIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import LoadingPage from "./LoadingPage";
import CustomBackToTop from "../../components/CustomScrollToTop";
import toast from "react-hot-toast";
import { apiUsers } from "../../services/models/UserModel";
import { convertSimpleDate } from "../../helpers/convertDate";
import { CYCLIC_BASE_URL /* LOCALHOST_URL*/ } from "../../services/api";
import parse from "html-react-parser";
import { Helmet } from "react-helmet";
import { PREFIX } from "../../constants";
import { editBlogStyle, fabStyle } from "../../components/CustomStylings";

const BlogPage = () => {
  const { id } = useParams();

  const [blog, setBlog] = useState({
    content: "",
    desc: "",
    likes: 0,
    tags: [],
    title: "",
    type: "DRAFT",
    userId: "",
    _id: "",
    comments: [],
  });

  const [loading, setLoading] = useState(true);

  const _getBlog = (id, signal) => {
    apiBlog.getSingle(id, signal).then((res) => {
      //   console.log(res);
      if (res.status === "200") {
        setBlog(res.message);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    const ac = new AbortController();
    _getBlog(id, ac.signal);

    return () => {
      ac.abort();
    };
  }, [id]);

  const [drawer, setDrawer] = useState(false);

  const navigate = useNavigate();

  const userId = localStorage.getItem(`${PREFIX}UserId`);

  const [user, setUser] = useState({
    name: "",
    avatar: {},
    date: "",
    likedBlogs: [],
  });

  const handleLike = () => {
    const userId = localStorage.getItem(`${PREFIX}UserId`);
    if (!userId) {
      toast.error("Only logged in users can like");
      return;
    }
    // console.log(blog);

    const response = {
      userId: userId,
      likes: [
        ...blog.likes,
        {
          userId: userId,
        },
      ],
      // eslint-disable-next-line no-unsafe-optional-chaining
      likedBlogs: [...user?.likedBlogs, blog._id],
    };
    // console.log(response);

    apiBlog.put(response, `likes/${blog._id}`).then((res) => {
      // console.log(res);
      if (res.status === "200") {
        toast.success(res.message);
        // fetchBlog();
        _getUser(blog.userId);
        _getBlog(id);
      } else {
        toast.error(res.message);
      }
    });
  };

  const _getUser = (id, signal) => {
    if (!blog.userId) {
      return;
    }
    apiUsers.getSingle(id, signal).then((res) => {
      if (res.status === "200") {
        setUser(res.message);
      }
    });
  };

  useEffect(() => {
    const ac = new AbortController();
    _getUser(blog.userId, ac.signal);

    return () => {
      ac.abort();
    };
  }, []);

  return loading ? (
    <LoadingPage />
  ) : (
    <>
      <img
        src={`${CYCLIC_BASE_URL}/blog/image/${blog?._id}`}
        alt=""
        // className="me-4"
        height={250}
        width={"100%"}
        style={{ objectFit: "cover" }}
        loading="lazy"
      />
      <section className="container p-5">
        <Helmet>
          <title>{blog.title}</title>
          <meta name="description" content={blog.desc} />
        </Helmet>
        <Box className="text-center mb-4">
          {/* {blog.image && ( */}

          {/* )} */}
        </Box>

        <Typography
          sx={{ fontSize: 28, fontWeight: 700 }}
          component="h1"
          id="blog-top"
          className="mb-4"
        >
          {blog.title}
        </Typography>
        <Typography className="text-muted mb-4" component="h2">
          {blog.desc}
        </Typography>
        {parse(blog.content)}
        <div style={fabStyle}>
          <ButtonGroup variant="contained" color="secondary">
            <Button
              // onClick={() => setDrawer(true)}
              aria-label="comments"
              sx={{
                borderTopLeftRadius: "50ex",
                borderBottomLeftRadius: "50ex",
              }}
              disabled
            >
              {/* <span style={{ fontSize: "0.7rem", lineHeight: "6.4px" }}>
                {blog.comments.length}
              </span> */}
              <ModeCommentIcon className="d-block" />
            </Button>
            <Button
              onClick={handleLike}
              sx={{
                borderTopRightRadius: "50ex",
                borderBottomRightRadius: "50ex",
              }}
            >
              {/* <span style={{ fontSize: "0.7rem", lineHeight: "6.4px" }}>
                {blog.likes?.length}
              </span> */}
              <FavoriteRoundedIcon sx={{
                color: blog?.likes?.some((like)=> like.userId===userId) ? "red" : "black"
              }}/>
            </Button>
          </ButtonGroup>
          {/* <Fab
            color="primary"
            aria-label="comments"
            className="me-2 flex-column"
            onClick={() => setDrawer(true)}
          >
            <ModeCommentIcon className="d-block" />
            <span style={{ fontSize: "0.7rem", lineHeight: "6.4px" }}>
              {blog.comments.length}
            </span>
          </Fab>
          <Fab
            color="error"
            aria-label="love"
            className="flex-column"
            onClick={handleLike}
          >
            <FavoriteRoundedIcon />
            <span style={{ fontSize: "0.7rem", lineHeight: "6.4px" }}>
              {blog.likes?.length}
            </span>
          </Fab> */}
        </div>
        {userId === blog.userId && (
          <div style={editBlogStyle}>
            <Tooltip title="Edit Blog">
              <Fab
                color="secondary"
                aria-label="edit"
                onClick={() => navigate(`/edit-blog/${blog._id}`)}
                variant="extended"
              >
                <EditIcon sx={{ mr: 1 }} /> Edit Blog
              </Fab>
            </Tooltip>
          </div>
        )}

        <CommentSection
          drawer={drawer}
          setDrawer={setDrawer}
          comments={blog.comments}
          setBlog={setBlog}
        />
      </section>
      <CustomBackToTop id="blog-top" />
    </>
  );
};

export default BlogPage;

const CommentSection = ({ drawer, setDrawer, comments, setBlog }) => {
  const toggleDrawer = (event) => {
    // console.log(event);

    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    if (event && event.type === "keydown") {
      return;
    }

    setDrawer(false);
  };

  const [comment, setComment] = useState("");

  const { id } = useParams();

  const userId = localStorage.getItem(`${PREFIX}UserId`);

  const addComment = () => {
    //   console.log("executed");
    const commentId = Date.now();
    const response = {
      comments: comments.concat({
        id: commentId,
        userId: userId,
        comment: comment,
      }),
    };

    apiBlog.put(response, `comments/${id}`).then((res) => {
      // console.log(res);
      if (res.status === "200") {
        toast.success(res.message);
        fetchBlog();
      } else {
        toast.error(res.message);
      }
    });
    setComment("");
  };

  const fetchBlog = () => {
    apiBlog.getSingle(id, undefined).then((res) => {
      //   console.log(res);
      if (res.status === "200") {
        setBlog(res.message);
        // setLoading(false);
      } else {
        // setLoading(false);
      }
    });
  };

  return (
    <SwipeableDrawer
      anchor={"right"}
      open={drawer}
      onClose={(event) => {
        // console.log(event);
        if (
          event &&
          event.type === "keydown" &&
          (event.key === "Tab" || event.key === "Shift")
        ) {
          return;
        }

        setDrawer(false);
      }}
      onOpen={() => setDrawer(true)}
    >
      <Box
        sx={{ width: 350, padding: 3 }}
        role="presentation"
        onClick={toggleDrawer}
        onKeyDown={toggleDrawer}
      >
        <TextField
          size="small"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addComment();
            }
          }}
          autoFocus={true}
          variant="standard"
          label="Comment"
          fullWidth
          className="mb-4"
          disabled={!localStorage.getItem(`${PREFIX}UserId`)}
        />
        {!localStorage.getItem(`${PREFIX}UserId`) && (
          <i className="text-muted mb-4">
            You have to login to make any comment and like any blog
          </i>
        )}
        {comments.map((comment, index) => (
          <Comment key={index} comment={comment} />
        ))}
      </Box>
    </SwipeableDrawer>
  );
};

const Comment = ({ comment }) => {
  const [user, setUser] = useState({
    name: "",
    avatar: {},
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    apiUsers
      .getSingle(comment.userId, ac.signal, "getnameavatar")
      .then((res) => {
        // console.log(res);
        if (res.status === "200") {
          // console.log(res.message);
          setUser(res.message);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });

    return () => {
      ac.abort();
    };
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center w-100">
        {/* <Tooltip title={user?.name}> */}
        {loading ? (
          <></>
        ) : user.avatar ? (
          <MuiAvatar src="/broke.img" sx={{ width: 30, height: 30 }} />
        ) : (
          <></>
        )}
        {/* </Tooltip> */}

        <div className="ms-2 w-100">
          <p>{comment.comment}</p>
          <div className="text-end w-100">
            <i className="text-muted" style={{ fontSize: "0.75rem" }}>
              {convertSimpleDate(comment.date)}
            </i>
          </div>
        </div>
      </div>
      <Divider
        // sx={{ marginLeft: 0, marginY: 2, borderColor: "#6c757d" }}
        className="text-muted"
      />
    </div>
  );
};
