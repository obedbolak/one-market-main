import { useAuth } from "@/context/AuthContext";
import { addToCart, removeFromCart } from "@/store/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Interfaces for data structures
interface ProductImage {
  public_id: string;
  url: string;
}

interface Category {
  _id: string;
  category: string;
}

interface Product {
  id: string | string[];
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
  category: Category;
  sellerId: string;
}

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
}

interface UserMessage {
  conversationId: string;
  senderId: {
    name: string;
    profile_image: string;
    _id: string;
  };
  receiverId: {
    name: string;
    profile_image: string;
    _id: string;
  };
  productId: {
    title: string;
    images: ProductImage[];
  };
  content: string;
  createdAt: string;
}

// Type definitions
type Messagews = {
  id: string;
  text: string;
  isFromUser?: boolean;
  isSystem?: boolean;
};

type WebSocketRef = WebSocket | null;

const ProductDetails = () => {
  const { id, model } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [chatModal, setChatModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  const { userProfile, getUserProfile } = useAuth();
  const messagesScrollViewRef = useRef<ScrollView>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [messagews, setMessagews] = useState("");
  const [messagesws, setMessagesws] = useState<
    { content: string; userId: string }[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const [formattedMessages, setFormattedMessages] = useState<
    { content: string; timestamp: string; userId: string }[]
  >([]);

  // Fetch user profile on component mount
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

  // Open chat modal if model=true in search params
  useEffect(() => {
    if (model === "true") {
      setChatModal(true);
    }
  }, [model]);

  // Fetch messages for the selected product
  const fetchMessages = async () => {
    if (!selectedProduct || !userProfile) return;

    const conversationId = `${selectedProduct._id}_${userProfile._id}_${selectedProduct.sellerId}`;
    try {
      const response = await axios.get(
        `https://onemarketapi.xyz/api/v1/msg/messages/conversation/${conversationId}`
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch messages when user profile or selected product changes
  useEffect(() => {
    if (userProfile?._id && selectedProduct) {
      // fetchMessages();
      const intervalId = setInterval(fetchMessages, 5000); // Poll messages every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [userProfile, selectedProduct]);

  // Send a new message
  const sendMessage = async () => {
    if (!message.trim() || !selectedProduct || !userProfile) return;

    const messageData = {
      senderId: userProfile._id,
      receiverId: selectedProduct.sellerId,
      productId: selectedProduct._id,
      content: message,
      conversationId: `${selectedProduct._id}_${userProfile._id}_${selectedProduct.sellerId}`,
      senderType:
        selectedProduct.sellerId !== userProfile._id ? "buyer" : "seller",
    };

    try {
      await axios.post(
        "https://onemarketapi.xyz/api/v1/msg/messages",
        messageData
      );
      setMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://onemarketapi.xyz/api/v1/product/get-all"
        );
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Set selected product when ID or products change
  useEffect(() => {
    if (id && products.length) {
      const product = products.find((p) => p._id === id);
      if (product) {
        setSelectedProduct(product);
        setSelectedImage(product.images[0]?.url || "");
      }
    }
  }, [id, products]);

  // Fetch related products based on the selected product's category
  useEffect(() => {
    if (selectedProduct) {
      const related = products.filter(
        (p) =>
          p.category.category === selectedProduct.category.category &&
          p._id !== selectedProduct._id
      );
      setRelatedProducts(related);
    }
  }, [selectedProduct, products]);
  const userId = userProfile?._id || "guest";

  // Connect to WebSocket server
  const connectWebSocket = () => {
    if (ws.current) {
      ws.current.close(); // Close any existing connection before creating a new one
    }

    ws.current = new WebSocket("wss://onemarketapi.xyz/api/v1");

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      joinRoom();
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === "fetched_messages") {
          const messages = data.messages;

          setFormattedMessages(
            messages.map(
              (msg: {
                content: string;
                timestamp: string;
                userId: string;
              }) => ({
                content: msg.content,
                timestamp: new Date(msg.timestamp).toLocaleTimeString(),
                userId: msg.userId,
              })
            )
          );
          setMessagesws(data.messages);
        } else if (data.type === "chat") {
          setMessagesws((prev) => [
            ...prev,
            { content: data.content, userId: data.userId },
          ]);
        } else if (data.type === "error") {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.current.onclose = (e) => {
      console.warn("WebSocket disconnected:", e.code, e.reason);
      setIsConnected(false);
    };
  };

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (ws.current) {
        console.log("Closing WebSocket connection");
        ws.current.onclose = null; // Prevent triggering the reconnect logic
        ws.current.close();
      }
    };
  }, []);

  // Join a room
  const joinRoom = () => {
    if (!userId || !roomId) {
      alert("Please enter both user ID and room ID");
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Send a "join" request to the WebSocket server
      ws.current.send(
        JSON.stringify({
          type: "join",
          userId,
          roomId,
          name: selectedProduct?.images[0]?.url,
        })
      );

      console.log(`Joined room: ${roomId}`);

      // Fetch messages from the room after joining
      fetchMessagesws();
    } else {
      console.error("WebSocket is not open. Cannot join room.");
    }
  };

  // Fetch messages from the room
  const fetchMessagesws = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "fetch_messages",
          roomId, // Make sure `roomId` is defined at this point
        })
      );
    } else {
      console.error("WebSocket is not open. Cannot fetch messages.");
    }
  };
  // Send a chat message
  const sendMessagews = () => {
    if (!messagews.trim()) return;

    const sendMessage = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const newMessage = {
          content: messagews,
          userId,
          roomId,
          timestamp: new Date().toISOString(),
        };

        // Send the message to the WebSocket server
        ws.current.send(
          JSON.stringify({
            type: "chat",
            ...newMessage,
          })
        );

        // Update the chat on the screen immediately
        setFormattedMessages((prev) => [
          ...prev,
          {
            content: newMessage.content,
            timestamp: new Date(newMessage.timestamp).toLocaleTimeString(),
            userId: newMessage.userId,
          },
        ]);

        setMessagesws((prev) => [...prev, newMessage]);

        // Clear the input field
        setMessagews("");
      } else {
        console.error("WebSocket is not open. Message not sent.");
      }
    };

    // If disconnected, reconnect and send the message after connection is established
    if (
      !isConnected ||
      !ws.current ||
      ws.current.readyState !== WebSocket.OPEN
    ) {
      console.log("WebSocket is disconnected. Reconnecting...");
      connectWebSocket();

      // Wait for the connection to be established before sending the message
      const interval = setInterval(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          sendMessage();
        }
      }, 100); // Check every 100ms
    } else {
      // If already connected, send the message immediately
      sendMessage();
    }
  };

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Set roomId when selectedProduct and userProfile are available
  useEffect(() => {
    if (selectedProduct && userProfile) {
      const newRoomId = `${selectedProduct._id}_${userProfile._id}_${selectedProduct.sellerId}`;
      setRoomId(newRoomId);
      console.log(`Room ID set: ${newRoomId}`);
    }
  }, [selectedProduct, userProfile]);

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      if (roomId && ws.current?.readyState === WebSocket.OPEN) {
        fetchMessagesws();
      }
    }, 5000); // 5 seconds

    return () => clearInterval(fetchInterval);
  }, [roomId]);

  // Handle quantity changes
  const increaseQuantity = () => {
    if (quantity < (selectedProduct?.stock || 0)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Add or remove product from cart
  const addProductToCart = () => {
    if (selectedProduct) {
      dispatch(addToCart({ ...selectedProduct, quantity }));
    }
  };

  const removeProductFromCart = () => {
    if (selectedProduct) {
      dispatch(removeFromCart(selectedProduct._id));
    }
  };

  // Navigate back to the home screen
  const handleBack = () => {
    router.replace("/(tabs)");
  };

  // Render messages in the chat modal
  const renderMessages = () => {
    if (isLoadingMessages) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="skyblue" />
        </View>
      );
    }

    return (
      <ScrollView
        ref={messagesScrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isBuyerMessage = msg.senderType === "buyer";
          const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <View
              key={msg._id}
              style={[
                styles.messageBubble,
                isBuyerMessage ? styles.buyerMessage : styles.sellerMessage,
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.messageTime}>{timeString}</Text>
                {!msg.isRead && isBuyerMessage && (
                  <View style={styles.unreadIndicator} />
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  useEffect(() => {
    if (chatModal) {
      setTimeout(() => {
        messagesScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100); // Delay to ensure the modal is fully rendered
    }
  }, [chatModal]);

  if (!selectedProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  if (!userProfile) {
    return <Text>Loading profile...</Text>;
  }

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.productImageContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={23} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: selectedImage }}
              style={styles.productImage}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {selectedProduct.images.map((image) => (
              <TouchableOpacity
                key={image.public_id}
                onPress={() => setSelectedImage(image.url)}
                style={styles.thumbnailWrapper}
              >
                <Image
                  source={{ uri: image.url }}
                  style={styles.thumbnailImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.productDetails}>
            <View style={styles.titleContainer}>
              <Text style={styles.productTitle}>{selectedProduct.name}</Text>
              <TouchableOpacity>
                <Ionicons name="heart" size={23} color="skyblue" />
              </TouchableOpacity>
            </View>

            <View style={styles.priceQuantityContainer}>
              <View style={styles.priceContainer}>
                <Text>Price</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={styles.productPrice}>
                    {selectedProduct.price * quantity}
                  </Text>
                  <Text style={{ color: "gray", fontSize: 10 }}>XAF</Text>
                </View>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={decreaseQuantity}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text>{quantity}</Text>
                <TouchableOpacity
                  onPress={increaseQuantity}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text>Reviews</Text>
                <TouchableOpacity>
                  <Text style={styles.reviewText}>(243)</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text>
                In stock:
                <Text style={styles.stockText}>{selectedProduct.stock}</Text>
              </Text>
            </View>

            <View style={styles.categoryContainer}>
              <Text>Category:</Text>
              <Text style={styles.categoryText}>
                {selectedProduct.category.category}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.productDescription}>
              {selectedProduct.description}
            </Text>

            <View style={styles.relatedProductsHeader}>
              <Text style={styles.relatedProductsTitle}>Related Products</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {relatedProducts.map((item) => (
              <View key={item._id} style={styles.relatedProductContainer}>
                <TouchableOpacity
                  onPress={() => {
                    router.push(`/Product/${item._id}`);
                  }}
                >
                  <Image
                    source={{ uri: item.images[0]?.url }}
                    style={styles.relatedProductImage}
                  />
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          onPress={addProductToCart}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Add To Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            addProductToCart();
            router.push(`/Cart/Cart`);
          }}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {userProfile._id !== selectedProduct.sellerId &&
        userProfile._id !== "guest" && (
          <TouchableOpacity
            onPress={() => {
              setChatModal(true);
              connectWebSocket();
            }}
            style={styles.chatButton}
          >
            <Image
              source={require("@/assets/images/prodimg/chat.png")}
              style={styles.chatIcon}
            />
          </TouchableOpacity>
        )}

      <Modal
        visible={chatModal}
        onRequestClose={() => setChatModal(false)}
        animationType="slide"
        transparent={true}
      >
        <TouchableWithoutFeedback onPress={() => setChatModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chat</Text>
                <ScrollView
                  ref={messagesScrollViewRef}
                  style={styles.messagesContainer}
                  contentContainerStyle={styles.messagesContentContainer}
                  onContentSizeChange={() =>
                    messagesScrollViewRef.current?.scrollToEnd({
                      animated: true,
                    })
                  }
                >
                  {formattedMessages.map((message, index) => (
                    <View
                      key={message.timestamp + index}
                      style={{
                        flexDirection: "row",
                        justifyContent:
                          message.userId === userProfile._id
                            ? "flex-end"
                            : "flex-start", // Align right if it's a user message
                        marginVertical: 5,
                      }}
                    >
                      <View
                        style={{
                          maxWidth: "90%", // Restrict width for better design
                          padding: 10,
                          borderRadius: 10,
                          backgroundColor:
                            message.userId === userProfile._id
                              ? "#e8ffc4"
                              : "#f2f2f2", // User vs other message color
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 3,
                          elevation: 2, // Shadow for Android
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                          }}
                        >
                          {message.content}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginTop: 5,
                            textAlign: "right", // Timestamp aligned within bubble
                          }}
                        >
                          {message.timestamp}

                          {/* Format timestamp */}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={messagews}
                    onChangeText={setMessagews}
                    placeholder="Type a message..."
                  />
                  <TouchableOpacity
                    onPress={sendMessagews}
                    style={styles.sendButton}
                  >
                    <Ionicons name="send" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

// Stylesheet
const styles = StyleSheet.create({
  container: { marginBottom: 70 },
  productImageContainer: { position: "relative" },
  productImage: { width: "100%", height: 400, resizeMode: "cover" },
  backButton: {
    position: "absolute",
    top: 40,
    zIndex: 20,
    padding: 5,
    backgroundColor: "skyblue",
    width: 30,
    height: 30,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    left: 6,
  },
  thumbnailContainer: { flexDirection: "row", paddingVertical: 10 },
  thumbnailWrapper: { marginRight: 3 },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  productDetails: { paddingHorizontal: 12 },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "90%",
    gap: 35,
  },
  productTitle: { fontSize: 20, fontWeight: "bold", maxWidth: "90%" },
  priceQuantityContainer: {
    flexDirection: "row",
    gap: 30,
    marginTop: 10,
    marginBottom: 10,
  },
  priceContainer: { flexDirection: "row", maxWidth: 80, gap: 3 },
  productPrice: { fontSize: 25, color: "orange", fontWeight: "bold" },
  quantityContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButton: {
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    backgroundColor: "skyblue",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    fontWeight: "bold",
  },
  reviewText: { color: "orange" },
  stockText: { color: "green", fontWeight: "bold" },
  categoryContainer: { flexDirection: "row", maxWidth: 90, gap: 5 },
  categoryText: { color: "green", fontWeight: "bold" },
  sectionTitle: { fontSize: 20, fontWeight: "bold" },
  productDescription: { fontSize: 16, marginVertical: 10 },
  relatedProductsHeader: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  relatedProductsTitle: { fontWeight: "800", fontSize: 20 },
  relatedProductContainer: {
    backgroundColor: "rgba(0,0,0, 0.05)",
    paddingLeft: 18,
    borderRadius: 10,
    marginHorizontal: 10,
    paddingRight: 18,
    paddingTop: 10,
  },
  relatedProductImage: { width: "100%", height: 100, borderRadius: 5 },
  actionButtonsContainer: {
    position: "absolute",
    bottom: 20,
    justifyContent: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  actionButton: { backgroundColor: "skyblue", padding: 10, borderRadius: 10 },
  actionButtonText: { fontWeight: "bold" },
  chatButton: {
    position: "absolute",
    bottom: 40,
    right: 10,
  },
  chatIcon: { height: 40, width: 40 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    height: "60%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  messagesContainer: { flex: 1 },
  messagesContentContainer: { padding: 10, flexGrow: 1 },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    maxWidth: "80%",
  },
  buyerMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  sellerMessage: {
    backgroundColor: "#E8E8E8",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 16, lineHeight: 20 },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: { fontSize: 12, color: "#999999", marginRight: 4 },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34B7F1",
  },
  messageContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userMessage: {
    backgroundColor: "#e3f2fd",
    alignSelf: "flex-end",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  messagesList: {
    flex: 1,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "skyblue",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  systemMessage: {
    backgroundColor: "#f5f5f5",
    fontStyle: "italic",
  },
});

export default ProductDetails;
