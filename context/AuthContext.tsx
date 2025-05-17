// contexts/AuthContext.tsx
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ProfilePic {
  public_id: string;
  url: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  phone: string;
  answer?: string;
  role: string;
  profilePic?: ProfilePic;
  createdAt: string;
  updatedAt: string;
  __v: number;
  storeName?: string;
  businessAddress?: string;
  businessDescription?: string;
  businessPhone?: string;
  productPayments?: number;
  USSDCode?: string;
}

interface AuthContextType {
  tokenAvailable: boolean;
  setTokenAvailable: (value: boolean) => void;
  signin: (identifier: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    city: string,
    address: string,
    phone: string,
    answer: string,
    country: string,
    storeName: string,
    businessAddress: string,
    businessDescription: string,
    businessPhone: string,
    USSDCode: string,
    otp: number
  ) => Promise<void>;
  signout: () => Promise<void>;
  userProfile: UserProfile | null;
  getUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokenAvailable, setTokenAvailable] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [storedOtp, setStoredOtp] = useState<number | null>(null);
  const [storedPhone, setStoredPhone] = useState<string | null>(null);
  const [newUser, setNewUser] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await SecureStore.getItemAsync("token");
      setTokenAvailable(!!token);
      if (token) await getUserProfile();
    };
    checkAuthStatus();
  }, []);

  // Handle SMS sending when OTP and phone are available
  useEffect(() => {
    const sendSMS = async () => {
      if (storedOtp && storedPhone && newUser) {
        try {
          await axios.post(
            "https://onemarketapi.xyz/api/twilio/send-sms",
            {
              to: storedPhone,
              body: `Your OTP Code is ${storedOtp}`,
            },
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          console.error("SMS error:", error);
        } finally {
          setStoredOtp(null);
          setStoredPhone(null);
          setNewUser(false);
        }
      }
    };
    sendSMS();
  }, [storedOtp, storedPhone, newUser]);

  const signin = async (identifier: string, password: string) => {
    try {
      const response = await fetch("https://onemarketapi.xyz/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const { token } = await response.json();
      if (!token) throw new Error("No token received");

      await SecureStore.setItemAsync("token", token);
      setTokenAvailable(true);
      await getUserProfile();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Let components handle the error
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    city: string,
    address: string,
    phone: string,
    answer: string,
    country: string,
    storeName: string,
    businessAddress: string,
    businessDescription: string,
    businessPhone: string,
    USSDCode: string,
    otp: number
  ) => {
    try {
      const isPrimaryEmail = !!email;
      const response = await fetch("https://onemarketapi.xyz/api/v1/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password,
          city,
          address,
          answer,
          country,
          storeName,
          businessAddress,
          businessDescription,
          businessPhone,
          email: isPrimaryEmail ? email : phone,
          phone: isPrimaryEmail ? phone : email,
          primarySignInMethod: isPrimaryEmail ? "email" : "phone",
          USSDCode,
          otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      setNewUser(true);
      setStoredPhone(phone);
      setStoredOtp(otp);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const signout = async () => {
    await SecureStore.deleteItemAsync("token");
    setTokenAvailable(false);
    setUserProfile(null);
    router.replace("/(tabs)");
  };

  const getUserProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        setUserProfile(null);
        return;
      }

      const response = await axios.get("https://onemarketapi.xyz/api/v1/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.success && response.data.user) {
        setUserProfile(response.data.user);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        tokenAvailable,
        setTokenAvailable,
        signin,
        signUp,
        signout,
        userProfile,
        getUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};