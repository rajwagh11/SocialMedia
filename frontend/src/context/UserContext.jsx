import axiosInstance from "../api/axiosInstance.js";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";


const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Changed [] to null for better consistency
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

    async function registerUser(formdata, navigate, fetchPosts) {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/register", formdata);

      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      navigate("/");
      setLoading(false);
      fetchPosts();
    } catch (error) {
      toast.error(error.response.data.message);
      setLoading(false);
    }
  }

  async function loginUser(email, password, navigate,fetchPosts) {
    try {
      const { data } = await axiosInstance.post("/auth/login", { email, password });
      toast.success(data.message);
      setIsAuth(true); //user now authenticated
      setUser(data.user); // store user info
      navigate("/");
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  }

  async function fetchUser() { //currently loggedin user
    try {
      const { data } = await axiosInstance.get("/user/me");
      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function logoutUser(navigate) {
    try {
      await axiosInstance.get("/auth/logout");
      setIsAuth(false);
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  }

  async function followUser(id, fetchUser) {
    try {
      const { data } = await axiosInstance.post("/user/follow/" + id);

      toast.success(data.message);
      fetchUser();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

async function updateProfilePic(id, formdata, setFile) {
  try {
    const { data } = await axiosInstance.put("/user/" + id, formdata);
    toast.success(data.message);
    setFile(null);
    return data.updatedUser; // return updated user
  } catch (error) {
    toast.error(error.response.data.message);
    return null;
  }
}

  async function updateProfileName(id, name, setShowInput) {
    try {
      const { data } = await axiosInstance.put("/user/" + id, { name });
      toast.success(data.message);
      fetchUser();
      setShowInput(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{registerUser, loginUser, logoutUser, isAuth, setIsAuth, user, setUser, loading ,followUser,updateProfilePic,updateProfileName}}>
      {children}
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);

export default UserContextProvider;
