import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/context/ProductContext";
import { addToCart } from "@/store/cartSlice";
import { Ionicons } from "@expo/vector-icons";
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
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface ProductImage {
  public_id: string;
  url: string;
}

interface Category {
  _id: string;
  category: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
  category: Category;
  sellerId: string;
}

interface ChatMessage {
  content: string;
  userId: string;
  timestamp: string;
  isFromCurrentUser: boolean;
}

const ProductDetails = () => {
  const { id, model } = useLocalSearchParams();
  const { userProfile } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);

  // Product state
  // const [products, setProducts] = useState<Product[]>([]);
  const { products } = useProduct();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Chat state
  const [chatModal, setChatModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [messagews, setMessagews] = useState("");
    const [messagesws, setMessagesws] = useState<
      { content: string; userId: string }[]
    >([]);
    const [roomId, setRoomId] = useState<string>("");
  
  // WebSocket
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [formattedMessages, setFormattedMessages] = useState<
    { content: string; timestamp: string; userId: string }[]
  >([]);
  // const roomId = selectedProduct && userProfile 
  //   ? `${selectedProduct._id}_${userProfile._id}_${selectedProduct.sellerId}`
  //   : "";

  // Fetch products on mount
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://onemarketapi.xyz/api/v1/product/get-all"
  //       );
  //       if (response.data.success) {
  //         setProducts(response.data.products);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     }
  //   };

  //   fetchProducts();
  // }, []);

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

  // Set related products
  useEffect(() => {
    if (selectedProduct) {
      const related = products.filter(
        (p) => 
          p.category._id === selectedProduct.category._id &&
          p._id !== selectedProduct._id
      );
      setRelatedProducts(related);
    }
  }, [selectedProduct, products]);
  const userId = userProfile?._id || "guest";


  // Handle chat modal from URL param
  useEffect(() => {
    if (model === "true") {
      setChatModal(true);
    }
  }, [model]);

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
    if (!messageInput.trim()) return;

    const sendMessage = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const newMessage = {
          content: messageInput,
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
        setMessageInput("");
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



  // Product quantity handlers
  const adjustQuantity = (amount: number) => {
    setQuantity(prev => {
      const newQuantity = prev + amount;
      return newQuantity > 0 && newQuantity <= (selectedProduct?.stock || 1) 
        ? newQuantity 
        : prev;
    });
  };

  const addToCartHandler = () => {
    if (selectedProduct) {
      dispatch(addToCart({ ...selectedProduct, quantity }));
    }
  };

  const buyNowHandler = () => {
    addToCartHandler();
    router.push("/Cart/Cart");
  };

  if (!selectedProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={23} color="white" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: selectedImage }}
            style={styles.mainImage}
          />

          <ScrollView horizontal style={styles.thumbnailContainer}>
            {selectedProduct.images.map((image) => (
              <TouchableOpacity
                key={image.public_id}
                onPress={() => setSelectedImage(image.url)}
              >
                <Image
                  source={{ uri: image.url }}
                  style={styles.thumbnail}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{selectedProduct.name}</Text>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color="skyblue" />
            </TouchableOpacity>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>
                {selectedProduct.price * quantity} XAF
              </Text>
            </View>

            <View style={styles.quantityControls}>
              <TouchableOpacity 
                onPress={() => adjustQuantity(-1)}
                style={styles.quantityButton}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                onPress={() => adjustQuantity(1)}
                style={styles.quantityButton}
              >
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.stockRow}>
            <Text>In stock: <Text style={styles.stock}>{selectedProduct.stock}</Text></Text>
            <Text>Category: <Text style={styles.category}>{selectedProduct.category.category}</Text></Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{selectedProduct.description}</Text>

          <Text style={styles.sectionTitle}>Related Products</Text>
          <ScrollView horizontal>
            {relatedProducts.map(product => (
              <TouchableOpacity 
                key={product._id}
                onPress={() => router.push(`/Product/${product._id}`)}
                style={styles.relatedProduct}
              >
                <Image
                  source={{ uri: product.images[0]?.url }}
                  style={styles.relatedImage}
                />
                <Text>{product.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          onPress={addToCartHandler}
          style={styles.cartButton}
        >
          <Text>Add To Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={buyNowHandler}
          style={styles.buyButton}
        >
          <Text>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Button (only show if not seller) */}
      {userProfile && userProfile._id !== selectedProduct.sellerId && (
        <TouchableOpacity
          onPress={() => {setChatModal(true)
            connectWebSocket();
          }}
          style={styles.chatButton}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Chat Modal */}
      <Modal
        visible={chatModal}
        animationType="slide"
        transparent
        onRequestClose={() => setChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat with Seller</Text>
              <TouchableOpacity onPress={() => setChatModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatContainer}>

              {formattedMessages.map((message, index) => (
                                  <View
                                    key={message.timestamp + index}
                                    style={{
                                      flexDirection: "row",
                                      justifyContent:
                                        message.userId === userProfile?._id
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
                                          message.userId === userProfile?._id
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

            <View style={styles.messageInputContainer}>
              <TextInput
                value={messageInput}
                onChangeText={setMessageInput}
                placeholder="Type your message..."
                style={styles.messageInput}
              />
              <TouchableOpacity 
                onPress={sendMessagews}
                style={styles.sendButton}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Image section styles
  imageSection: {
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
    backgroundColor: 'skyblue',
    padding: 5,
    borderRadius: 20
  },
  mainImage: {
    width: '100%',
    height: 300
  },
  thumbnailContainer: {
    padding: 10
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 5
  },
  // Details section styles
  detailsSection: {
    padding: 15
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  priceLabel: {
    fontSize: 16,
    color: 'gray'
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'orange'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 18
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  stock: {
    fontWeight: 'bold',
    color: 'green'
  },
  category: {
    fontWeight: 'bold',
    color: 'blue'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20
  },
  relatedProduct: {
    marginRight: 15,
    width: 120
  },
  relatedImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 5
  },
  // Action buttons
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20
  },
  cartButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'skyblue',
    flex: 1,
    marginRight: 10,
    alignItems: 'center'
  },
  buyButton: {
    backgroundColor: 'skyblue',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center'
  },
  chatButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: 'skyblue',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  chatContainer: {
    flex: 1,
    marginBottom: 15
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%'
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6'
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC'
  },
  messageTime: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
    textAlign: 'right'
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10
  },
  sendButton: {
    backgroundColor: 'skyblue',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ProductDetails;