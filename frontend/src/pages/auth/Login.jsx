import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiAuth } from "../../services/models/AuthModel";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  Alert,
  AlertTitle,
  Button,
  TextField,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import AuthLayout from "../../layout/AuthLayout";
import { PREFIX } from "../../constants";
import Cookies from "js-cookie";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
const Login = () => {
  const [isPasswordVisible, setisPasswordVisible] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleInputs = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  let userSchema = Yup.object({
    email: Yup.string()
      .email("must be a valid email")
      .required("email is required"),
    password: Yup.string().required("password is required"),
  });

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = () => {
    setIsLoading(true);

    userSchema
      .validate(user)
      .then(() => {
        localStorage.setItem(`${PREFIX}Email`, user.email);

        const body = user;

        apiAuth.post(body, "signin").then((res) => {
          // console.log(res);
          setIsLoading(false);

          if (res.status === "200") {
            // localStorage.setItem(`${PREFIX}Token`, res.token);
            Cookies.set(`${PREFIX}Token`, res.token, { expires: 6 / 24 });
            localStorage.setItem(`${PREFIX}UserId`, res.userId);
            localStorage.setItem(`${PREFIX}name`, res.name);
            localStorage.setItem(`${PREFIX}uname`, res.uname);
            // sucessNotify("Login succesfulll");
            toast.success("Login successfuly");
            navigate("/dashboard");
            location.reload();
          } else {
            toast.error(res.message);
          }
        });
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        toast.error(err.errors.toString());
      });
  };

  const matches = useMediaQuery("(min-width:600px)");

  return (
    <React.Fragment>
      <AuthLayout title="Login">
        <Alert severity="primary" variant="filled" sx={{ p: 0.25, mb: 2 }}>
          <AlertTitle>Demo Account</AlertTitle>
          <b>email:</b> anika.grant31@ethereal.email <br /> <b>password:</b>{" "}
          password
        </Alert>
        <TextField
          label="Email"
          variant="standard"
          sx={{ minWidth: matches ? 450 : 200 }}
          name="email"
          value={user.email}
          onChange={(e) => handleInputs(e)}
        />
        <br />
        <TextField
          label="Password"
          variant="standard"
          sx={{ minWidth: matches ? 450 : 200 }}
          className="mt-4"
          name="password"
          value={user.password}
          onChange={(e) => handleInputs(e)}
          type={`${isPasswordVisible ? "text" : "password"}`}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setisPasswordVisible(!isPasswordVisible)}
                  edge="end"
                >
                  {isPasswordVisible ? (
                    <VisibilityIcon style={{ color: "#4CAAF1" }} />
                  ) : (
                    <VisibilityOffIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <div className="text-center mt-4">
          {isLoading ? (
            <LoadingButton
              loading
              loadingIndicator="Loading..."
              variant="outlined"
              size="small"
            >
              Loading
            </LoadingButton>
          ) : (
            <Button onClick={onSubmit} variant="outlined" size="small">
              Login
            </Button>
          )}
        </div>
        <div className="text-center mt-5">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          Don't have an account? then <Link to="/signup">Signup</Link>
        </div>
      </AuthLayout>
    </React.Fragment>
  );
};

export default Login;
