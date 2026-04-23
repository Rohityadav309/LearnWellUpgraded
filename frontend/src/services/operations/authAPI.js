import { toast } from "react-hot-toast";
import { setLoading, setSignupData, setToken } from "../../slices/authSlice";
import { resetCart } from "../../slices/cartSlice";
import { setUser } from "../../slices/profileSlice";
import { apiConnector } from "../apiconnector";
import { endpoints } from "../apis";

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  LOGOUT_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints;

export function sendOtp(email, accountType, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        accountType,
      });
      console.log("SENDOTP API RESPONSE...........", response);
      console.log(response.data.success);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      if (response.data.devOtp) {
        toast.success(
          `OTP Sent Successfully. Dev OTP: ${response.data.devOtp}`,
        );
      } else {
        toast.success("OTP Sent Successfully");
      }
      navigate("/verify-email");
    } catch (error) {
      console.log("SENDOTP API ERROR...........", error);
      toast.error(error?.response?.data?.message || "Could Not Send OTP");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  contactNumber,
  otp,
  navigate,
) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        contactNumber,
        otp,
      });

      console.log("SIGNUP API RESPONSE...........", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      toast.success("Signup Successful");
      dispatch(setSignupData(null));
      navigate("/login");
    } catch (error) {
      console.log("SIGNUP API ERROR.............", error);
      toast.error(error?.response?.data?.message || "Signup Failed");
      navigate("/signup");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      });
      // console.log("LOGIN API RESPONSE..............", response)
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      toast.success("Login Successful");

      dispatch(setToken(response.data.token));
      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
      const normalizedUser = { ...response.data.user, image: userImage };
      dispatch(setUser(normalizedUser));

      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      navigate("/dashboard/my-profile");
    } catch (error) {
      console.log("LOGIN API ERROR..............", error);
      toast.error(error?.response?.data?.message || "Login Failed");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function logout(navigate) {
  return async (dispatch) => {
    try {
      await apiConnector("POST", LOGOUT_API);
    } catch (error) {
      console.log("LOGOUT API ERROR..............", error);
    }

    dispatch(setToken(null));
    dispatch(setUser(null));
    dispatch(resetCart());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged Out");
    navigate("/");
  };
}

export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      });

      console.log("RESET PASSWORD TOKEN RESPONSE..........", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Reset Email Sent");
      setEmailSent(true);
    } catch (error) {
      console.log("RESET PASSWORD TOKEN ERROR", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed To Send Email For Resetting Password",
      );
    }
    dispatch(setLoading(false));
  };
}

export function resetPassword(password, confirmPassword, token) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      });

      console.log("RESET Password RESPONSE ... ", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Password Has Been Reset Successfully");
    } catch (error) {
      console.log("RESET PASSWORD TOKEN Error............", error);
      toast.error(error?.response?.data?.message || "Unable To Reset Password");
    }
    dispatch(setLoading(false));
  };
}
