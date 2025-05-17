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
  
  // WebSocket
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const roomId = selectedProduct && userProfile 
    ? `${selectedProduct._id}_${userProfile._id}_${selectedProduct.sellerId}`
    : "";

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

  // Handle chat modal from URL param
  useEffect(() => {
    if (model === "true") {
      setChatModal(true);
    }
  }, [model]);

  // WebSocket connection management
  useEffect(() => {
    if (!roomId || !userProfile) return;

    const connect = () => {
      ws.current = new WebSocket("wss://onemarketapi.xyz/api/v1");

      ws.current.onopen = () => {
        setIsConnected(true);
        joinRoom();
        fetchMessages();
      };

      ws.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "chat") {
          handleNewMessage(data);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [roomId, userProfile]);

  const joinRoom = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "join",
        roomId,
        userId: userProfile?._id
      }));
    }
  };

  const fetchMessages = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "fetch_messages",
        roomId
      }));
    }
  };

  const handleNewMessage = (message: any) => {
    setMessages(prev => [...prev, {
      content: message.content,
      userId: message.userId,
      timestamp: new Date().toLocaleTimeString(),
      isFromCurrentUser: message.userId === userProfile?._id
    }]);
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !ws.current || !roomId || !userProfile) return;

    const message = {
      type: "chat",
      content: messageInput,
      roomId,
      userId: userProfile._id,
      timestamp: new Date().toISOString()
    };

    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      setMessageInput("");
    }
  };

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
          onPress={() => setChatModal(true)}
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
              {messages.map((msg, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.messageBubble,
                    msg.isFromCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                  ]}
                >
                  <Text>{msg.content}</Text>
                  <Text style={styles.messageTime}>{msg.timestamp}</Text>
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
                onPress={sendMessage}
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