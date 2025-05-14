import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Message {
  __v: number;
  _id: string;
  content: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  productId: string;
  receiverId: string;
  senderId: string;
  senderType: string;
  timestamp: string;
}
const Chat = () => {
  const { conversationId, productId, buyerId } = useLocalSearchParams();
  const { userProfile, getUserProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const flatListRef = useRef<FlatList>(null); // Create a ref for the FlatList

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getUserProfile();
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Fetch messages for this conversation
  const fetchConversationMessages = async () => {
    try {
      const response = await axios.get(
        `https://onemarketapi.xyz/api/v1/msg/messages/conversation/${conversationId}`
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        conversationId: conversationId as string,
        senderId: buyerId,
        receiverId: userProfile?._id, // Assuming you want to send to the buyer
        productId: productId as string,
        senderType: `${userProfile?.role === "admin" ? "seller" : "buyer"}`,
        isRead: false, // Set the `isRead` field to `false` by default
      };

      await axios.post(
        "https://onemarketapi.xyz/api/v1/msg/messages",
        messageData
      );
      console.log("message sent by seller");
      // Clear input and refetch messages
      setNewMessage("");
      fetchConversationMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch messages on component mount and set up polling
  useEffect(() => {
    fetchConversationMessages();

    const intervalId = setInterval(fetchConversationMessages, 5000);
    return () => clearInterval(intervalId);
  }, [conversationId]);

  // Scroll to the end of the list after new messages are fetched
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]); // Run this effect whenever `messages` state changes

  // Render individual message
  const renderMessage = ({ item }: { item: Message }) => {
    // Check if the sender is the current user or the seller
    const isCurrentUserSender =
      item.senderId === userProfile?._id || item.senderType === "seller";

    const messageDate = new Date(item.createdAt);
    const timeString = messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUserSender ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>{timeString}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <FlatList
        ref={flatListRef} // Attach the ref to the FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newMessage.trim() ? "#007AFF" : "#CCC"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6", // Green color for the sent message
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF", // White color for the received message
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Chat;
