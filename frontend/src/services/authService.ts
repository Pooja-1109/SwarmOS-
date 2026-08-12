import API from "./api";

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  whatsappNumber?: string;
  whatsappOptIn?: boolean;
}) => {
  const res = await API.post("/auth/register", userData);
  return res.data;
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  const res = await API.post("/auth/login", userData);
  return res.data;
};

export const googleSignIn = async () => {
  const googleUser = {
    name: `Google User ${Date.now() % 10000}`,
    email: `google-${Date.now()}@gmail.com`,
    password: "google123",
  };

  try {
    return await loginUser({
      email: googleUser.email,
      password: googleUser.password,
    });
  } catch {
    await registerUser(googleUser);
    return await loginUser({
      email: googleUser.email,
      password: googleUser.password,
    });
  }
};

export const getProfile = async () => {
  const res = await API.get("/auth/profile");
  return res.data;
};

export const updateProfile = async (data: {
  name?: string;
  bio?: string;
  avatar?: string;
  password?: string;
}) => {
  const res = await API.put("/auth/profile", data);
  return res.data;
};