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

// Define types for the user profile structure
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  answer: string;
  role: string;
  profilePic?: ProfilePic;
  createdAt: string;
  updatedAt: string;
  __v: number;
  storeName: string;
  businessAddress: string;
  businessDescription: string;
  businessPhone: string;
  productPayments: number;
  USSDCode: string;
}

// Define types for the context value, including userProfile
interface AuthContextType {
  tokenAvailable: boolean;
  setTokenAvailable: (value: boolean) => void;
  signin: (email: string, password: string) => Promise<void>;
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
  ) => Promise<void>; // Added signUp function
  signout: () => Promise<void>;
  userProfile: UserProfile | null;
  getUserProfile: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a dummy guest profile
const guestProfile: UserProfile = {
  _id: "guest",
  name: "Guest",
  email: "",
  address: "",
  city: "",
  country: "",
  phone: "",
  answer: "",
  role: "guest",
  storeName: "",
  businessAddress: "",
  businessDescription: "",
  businessPhone: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __v: 0,
  productPayments: 0,
  USSDCode: "",
};

// Create a provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tokenAvailable, setTokenAvailable] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    guestProfile
  );
  const [storedOtp, setStoredOtp] = useState<number | null>(null);
  const [storedPhone, setStoredPhone] = useState<string | null>(null);
  const [newUser, setNewUser] = useState(false);
  // On mount, check if the token is available using SecureStore
  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("token");
      setTokenAvailable(!!token); // Set tokenAvailable to true if token is found

      // If token is available, fetch the user profile
      if (token) {
        await getUserProfile();
      }
    };

    checkToken();
  }, []);

  // Signin function that makes an API call to authenticate the user
  const signin = async (identifier: string, password: string) => {
    try {
      // Construct requestBody with loginId and password
      const loginId = identifier; // This can be either email or phone, depending on the form field
      console.log("Login ID:", loginId);
      const response = await fetch(
        "https://onemarketapi.xyz/api/v1/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loginId: loginId, // Pass the identifier as loginId
            password: password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const token = data.token;

      if (token) {
        await SecureStore.setItemAsync("token", token);
        setTokenAvailable(true);
        await getUserProfile();
        router.replace("/(tabs)"); // Navigate to the main app screen
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error || "Login failed. Please try again.");
    }
  };

  const url = "https://onemarketapi.xyz/api/twilio/send-sms";

  // Modify sendSMS to accept OTP as parameter
  const sendSMS = async () => {
    try {
      const payload = {
        to: storedPhone,
        body: `Your OTP Code is ${storedOtp}`, // Use the passed OTP
      };

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("SMS sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending SMS:", error);
      alert("Failed to send SMS. Please try again.");
    }
  };

  // This useEffect will only run when storedOtp and storedPhone change
  useEffect(() => {
    const sendSMS = async () => {
      if (storedOtp && storedPhone && newUser) {
        try {
          const payload = {
            to: storedPhone,
            body: `Your OTP Code is ${storedOtp}`,
          };

          const response = await axios.post(url, payload, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("SMS sent successfully:", response.data);
        } catch (error) {
          console.error("Error sending SMS:", error);
          alert("Failed to send SMS. Please try again.");
        } finally {
          // Reset the values after sending
          setStoredOtp(null);
          setStoredPhone(null);
          setNewUser(false);
        }
      }
    };

    sendSMS();
  }, [storedOtp, storedPhone, newUser]);

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
      // Determine the primary identifier and its type
      const isPrimaryEmail = !!email;
      const primaryIdentifier = isPrimaryEmail ? email : phone;
      const secondaryIdentifier = isPrimaryEmail ? phone : email;

      // Construct the request body with both email and phone
      const requestBody = {
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
        email: isPrimaryEmail ? primaryIdentifier : secondaryIdentifier,
        phone: isPrimaryEmail ? secondaryIdentifier : primaryIdentifier,
        primarySignInMethod: isPrimaryEmail ? "email" : "phone",
        USSDCode,
        otp,
      };

      const response = await fetch(
        "https://onemarketapi.xyz/api/v1/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Check if the response status is 200 (success)
      if (response.status === 200) {
        // "await sendOtp(phone, otp);"
        setNewUser(true);
        setStoredPhone(phone);
        setStoredOtp(otp);
        const responseData = await response.json();

        // Check if the success flag is true in the response data
        if (responseData.success) {
          // Once sign-up is successful, redirect to the SignIn page
          // router.push("/(auth)/AuthScreen");
        } else {
          // If success flag is false, throw an error with the message
          throw new Error(
            responseData.message || "Sign up failed. Please try again."
          );
        }
      } else {
        // If the status is not 200, throw an error with the response status
        const errorData = await response.text();
        throw new Error(
          errorData || `Sign up failed with status: ${response.status}`
        );
      }
    } catch (error) {
      // Log the error and show an alert with a friendly message
      console.error("Sign up error:", error);
      alert(error || "Sign up failed. Please try again.");
    }
  };

  // Signout function that removes the token from SecureStore and sets guest profile
  const signout = async () => {
    await SecureStore.deleteItemAsync("token"); // Remove token from SecureStore
    setTokenAvailable(false); // Set token state to false
    setUserProfile(guestProfile); // Reset user profile to guest

    // Trigger a page reload by navigating to the root screen
    router.replace("/(tabs)"); // Redirect to the home or default screen
  };

  // Get user profile using axios
  const getUserProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      // If no token is available, set the user profile to the guest profile
      if (!token) {
        setUserProfile(guestProfile);
        return;
      }

      // Using axios to make the GET request
      const response = await axios.get(
        "https://onemarketapi.xyz/api/v1/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Check if the response was successful and contains valid user data
      if (response.data.success && response.data.user) {
        setUserProfile(response.data.user); // Store the user profile in the state
      } else {
        // If the response is successful but no valid user data is found, set the guest profile
        setUserProfile(guestProfile);
      }
    } catch (error) {
      // If there's an error (e.g., network issue, invalid token), set the guest profile
      setUserProfile(guestProfile);

      // Optionally, show an alert to the user
    }
  };

  return (
    <AuthContext.Provider
      value={{
        tokenAvailable,
        setTokenAvailable,
        signUp,
        signin,
        signout,
        userProfile,
        getUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
