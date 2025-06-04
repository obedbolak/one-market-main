import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useProduct } from "@/context/ProductContext";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import moment from "moment";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const screenHeight = Dimensions.get("window").height;

interface ProductImage {
  public_id: string;
  url: string;
}

interface OrderItem {
  image: string;
  name: string;
  price: number;
  product: string;
  quantity: number;
  sellerId: string;
  _id: {
    $oid: string;
  };
}

interface ShippingInfo {
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface PaymentInfo {
  mobileMoneyName: string;
  mobileMoneyNumber: string;
  mobileMoneyProvider: string;
  status: string;
}

interface Order {
  _id: string;
  Uid: string;
  itemPrice: number;
  orderItems: OrderItem[]; // <-- This line ensures orderItems exists on Order
  paymentInfo: PaymentInfo;
  paymentMethod: string;
  shippingCharges: number;
  shippingInfo: ShippingInfo;
  tax: number;
  totalAmount: number;
  createdAt: string;
  orderStatus: string;
}
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
}

interface Message {
  _id: string;
  content: string;
  conversationId: string;
  productId: string;
  receiverId: string;
  senderId: string;
  senderType: string;
  status: string;
  timestamp: string;
  buyerId: string;
}

interface GroupedMessages {
  [key: string]: Message[];
}

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSettingsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  settingsModalVisible?: boolean;
}
const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, setSettingsModalVisible, settingsModalVisible }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isModalNotificationVisible, setIsModalNotificationVisible] =
    useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>("");
  const cartItems = useSelector((state: any) => state.cart.items);
  const { userProfile, getUserProfile } = useAuth();
  const [isSeller, setIsSeller] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [showOrders, setShowOrders] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<Boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const lastFetchedRef = React.useRef<number>(0);

  const { t, changeLanguage } = useLanguage();

  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messagews, setMessagews] = useState<string>("");
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [formattedMessages, setFormattedMessages] = useState<
    { content: string; timestamp: string; userId: string }[]
  >([]);
  const [messagesws, setMessagesws] = useState<
    { content: string; userId: string; roomId: string }[]
  >([]);

  const [rooms, setRooms] = useState<
    { name: string; roomId: string; createdAt: string }[]
  >([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [formattedMessages]);

  const userProfileId = userProfile?._id;

  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      ws.current.close();
    }

    ws.current = new WebSocket("wss://onemarketapi.xyz/api/v1");

    ws.current.onopen = () => {
      console.log("Header Connected to WebSocket server");
      setIsConnected(true);

      if (userProfile?._id) {
        ws.current?.send(
          JSON.stringify({
            type: "fetch_rooms",
            userId: userProfile._id,
          })
        );
      }
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "fetched_rooms") {
          const rooms = data.rooms;
          const roomList = rooms.map(
            (room: { name: String; roomId: String; createdAt: String }) => ({
              name: room.name,
              roomId: room.roomId,
              createdAt: room.createdAt,
            })
          );
          setRooms(roomList);
        } else if (data.type === "fetched_messages") {
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
          setIsLoadingMessages(true);
        } else if (data.type === "error") {
          alert(data.message);
        } else  if (data.type === "room_deleted") {
    if (data.success) {
      // Confirmation from server - no need to do anything if optimistic update worked
      console.log("Room deleted successfully on server");
    } else {
      // Revert optimistic update if server deletion failed
      setRooms(prevRooms => [...prevRooms, data.room]);
      alert(`Failed to delete room: ${data.message}`);
    }
  }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onerror = (e) => {};

    ws.current.onclose = (e) => {
      console.warn("WebSocket disconnected:", e.code, e.reason);
      setIsConnected(false);
      let attemptCount = 0;
      const reconnectDelay = Math.min(10000, 5000 * (attemptCount || 1));
      setTimeout(() => {
        console.log("Reconnecting to WebSocket...");
        connectWebSocket();
        attemptCount = (attemptCount || 0) + 1;
      }, reconnectDelay);
    };
  };

  const joinRoom = (roomId: string, userId: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!userId || !roomId) {
        reject("User ID and Room ID are required");
        return;
      }

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const handleJoinResponse = (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === "join_success" && data.roomId === roomId) {
              ws.current?.removeEventListener("message", handleJoinResponse);
              resolve();
            } else if (data.type === "error" && data.roomId === roomId) {
              ws.current?.removeEventListener("message", handleJoinResponse);
              reject(data.message);
            }
          } catch (error) {
            ws.current?.removeEventListener("message", handleJoinResponse);
            reject("Error parsing join response");
          }
        };

        ws.current.addEventListener("message", handleJoinResponse);
        ws.current.send(
          JSON.stringify({
            type: "join",
            userId,
            roomId,
          })
        );
        fetchMessagesws(roomId);
      } else {
        reject("WebSocket is not connected");
      }
    });
  };

  const fetchMessagesws = (roomId: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "fetch_messages",
          roomId,
        })
      );
    } else {
      console.error("WebSocket is not open. Cannot fetch messages.");
    }
  };

  const [isSending, setIsSending] = useState(false);

  const sendMessagews = async (roomId: string, userId: string) => {
    if (!messagews.trim()) return;
   
    try {
      if (!isConnected || !selectedRoom || selectedRoom !== roomId) {
        await joinRoom(roomId, userId);
        setSelectedRoom(roomId);
      }

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const newMessage = {
          content: messagews,
          userId,
          roomId,
          timestamp: new Date().toISOString(),
        };

        ws.current.send(
          JSON.stringify({
            type: "chat",
            ...newMessage,
          })
        );

        setFormattedMessages((prev) => [
          ...prev,
          {
            content: newMessage.content,
            timestamp: new Date(newMessage.timestamp).toLocaleTimeString(),
            userId: newMessage.userId,
          },
        ]);
        setMessagews("");
      }
    } finally {
      
    }
  };

 const deleteRoom = (roomId: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "delete_room",
          roomId,
        })
      );
      setRooms((prevRooms) =>
        prevRooms.filter((room) => room.roomId !== roomId)
      );
    } else {
      console.error("WebSocket is not open. Cannot delete room.");
    }
  };
  

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      if (selectedRoom && ws.current?.readyState === WebSocket.OPEN) {
        fetchMessagesws(selectedRoom);
      }
    }, 3000);

    return () => clearInterval(fetchInterval);
  }, [selectedRoom]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        console.log("Closing WebSocket connection");
        ws.current.onclose = null;
        ws.current.close();
        ws.current = null;
      }
    };
  }, [userProfile?._id]);

  useEffect(() => {
    if (
      ws.current &&
      ws.current.readyState === WebSocket.OPEN &&
      userProfile?._id
    ) {
      ws.current.send(
        JSON.stringify({
          type: "fetch_rooms",
          userId: userProfile._id,
        })
      );
    }
  }, [userProfile?._id, isConnected]);

  const { products, orders } = useProduct();

  const userOrders = orders.filter((order) => order.Uid === userProfile?._id);
  const sellerOrders = orders.filter(order =>
    order.orderItems.some((item: { sellerId: string | undefined; }) => item.sellerId === userProfile?._id)
  );

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile?._id !== null) {
      const intervalId = setInterval(() => {}, 5000);
      return () => clearInterval(intervalId);
    }
  }, [userProfile?._id]);

  const groupMessages = useCallback(
    (messages: Message[]): GroupedMessages => {
      return {};
    },
    [userProfile?._id]
  );

  const groupedMessages = useMemo(
    () => groupMessages(messages),
    [messages, groupMessages]
  );

  const { sellerMessages, buyerMessages } = useMemo(() => {
    return { sellerMessages: [], buyerMessages: [] };
  }, [groupedMessages, userProfile?._id]);

  

  const performSearch = useCallback(
    (query: string) => {
      const results = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setIsModalVisible(true);
    },
    [products]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setModalSearchQuery(text);

      if (text.trim()) {
        performSearch(text);
      } else {
        setSearchResults([]);
        setIsModalVisible(false);
      }
    },
    [performSearch]
  );

 

  const totalNotificationsws = rooms.length !== 0 ? rooms.length : 0;

  const cancelOrder = async (orderId: string) => {
    try {
      setIsLoadingOrders(true);
      const response = await axios.delete(
        `https://onemarketapi.xyz/api/v1/orders/orders/${orderId}`
      );

      if (response.data.success) {
        
        alert("Order has been canceled successfully!");
      } else {
        alert("Failed to cancel the order. Please try again later.");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      alert("Error canceling the order. Please try again later.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const toggleShowOrders = () => {
    setShowOrders(!showOrders);
  };

  // Remove the unused moment function and use native date formatting instead.

  return (
    <BlurView intensity={90} tint="light" style={styles.headerContainer}>
      {/* Logo */}
      <TouchableOpacity onPress={() => router.push("/(tabs)")}>
        <Image
          source={require("@/assets/images/LOGO.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { borderColor: "#E5E7EB", borderWidth: 1, backgroundColor: "#FAFAFA" },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("Search_for_items")}
          placeholderTextColor="#888"
          onFocus={() => setIsModalVisible(true)}
          clearButtonMode="never" // We'll use our own clear button
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Action Icons */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setIsModalNotificationVisible(true);
            setShowOrders(true);
          }}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="notifications-outline" size={24} color="#555" />
            {totalNotificationsws > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{totalNotificationsws}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/Cart/Cart")}
        >
          <View style={styles.iconWrapper}>
            <AntDesign name="shoppingcart" size={24} color="#555" />
            {cartItems.length > 0 && (
              <View style={[styles.notificationBadge, styles.cartBadge]}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* 3-dots vertical menu */}
  <TouchableOpacity
    style={styles.iconButton}
    onPress={() => {
    if (setSettingsModalVisible) {
      setSettingsModalVisible(!settingsModalVisible);
    }
     
      
    }}
  >
    <Entypo name="dots-three-vertical" size={22} color="#555" />
  </TouchableOpacity>
      </View>

     

      {/* Notifications/Orders Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalNotificationVisible}
        onRequestClose={() => setIsModalNotificationVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsModalNotificationVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.notificationModalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setShowOrders(true);
                    setIsLoadingMessages(false);
                    setSelectedRoom("");
                  }}
                >
                  <Text style={styles.notificationHeaderText}>
                    {t("Your Conversations")}
                    {rooms.length > 0 && (
                      <Text style={{ color: "orange" }}>({rooms.length})</Text>
                    )}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleShowOrders}>
                  <Text style={styles.notificationHeaderText}>
                    <Text style={{ color: "orange" }}>({sellerOrders.length})</Text>
                    {t("Your Orders")}
                  </Text>
                </TouchableOpacity>
              </View>
              {showOrders ? (
                <>
                  <View style={styles.noMessagesContainer}>
                    {rooms.length > 0 && (
                      <>
                        {!isLoadingMessages ? (
                          <>
        {rooms.map((room) => {
          // Find the last message for this room
          const lastMessage = messagesws
            .filter((msg) => msg.roomId === room.roomId)
            .slice(-1)[0];
          // check if lastmessage senderId is equal to userProfileId
          

        
          return (
            <TouchableOpacity
              key={room.roomId}
              onPress={() => {
                joinRoom(room.roomId, userProfile?._id ?? "");
                setSelectedRoom(room.roomId);
              }}
            >
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <View style={{ flexDirection: "column" }}>
                  
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}  ><Text>Active chat on</Text>
                  <TouchableOpacity onPress={() => {
                    deleteRoom(room.roomId);
                  }}>
                    <Ionicons name="trash" size={20} color={"orange"} />
                  </TouchableOpacity>
                  </View>

                  {/* Last message and time */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: "gray" }}>
              {lastMessage
                ? lastMessage.userId === userProfileId
                  ? "You: "
                  : "Client: "
                : ""}
              {lastMessage && lastMessage.content
                ? `${lastMessage.content} `
                : `${moment(room.createdAt).format("LL")} ${moment(room.createdAt).format("LT")}`}
            </Text>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={20}
                      color={"green"}
                    />
                    
                  </View>
                </View>
                <Image
                  source={{ uri: room.name }}
                  style={{ width: 50, height: 50, borderRadius: 8, marginLeft: 10 }}
                  resizeMode="cover"
                />

              </View>
            </TouchableOpacity>
          );
        })}
                          </>
                        ) : (
                          <KeyboardAvoidingView
                            style={styles.chatContainer}
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            keyboardVerticalOffset={60} // Adjust this value as needed
                          >
                            <ScrollView
                              ref={scrollViewRef}
                              contentContainerStyle={styles.chatScrollContainer}
                              showsVerticalScrollIndicator={true}
                              keyboardShouldPersistTaps="handled"
                            >
                              {formattedMessages.map((message, index) => (
                                <View
                                  key={message.timestamp + index}
                                  style={[
                                    styles.messageBubble,
                                    message.userId === userProfileId
                                      ? styles.userMessage
                                      : styles.otherMessage,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.messageText,
                                      message.userId === userProfileId
                                        ? styles.userMessageText
                                        : styles.otherMessageText,
                                    ]}
                                  >
                                    {message.content}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.messageTime,
                                      message.userId === userProfileId
                                        ? styles.userMessageTime
                                        : styles.otherMessageTime,
                                    ]}
                                  >
                                    {message.timestamp}
                                  </Text>
                                </View>
                              ))}
                            </ScrollView>
                            <View style={styles.messageInputContainer}>
                              <TextInput
                                value={messagews}
                                onChangeText={setMessagews}
                                placeholder="Type a message..."
                                placeholderTextColor="#AAA"
                                style={styles.messageInput}
                              />
                              <TouchableOpacity
                                style={styles.sendButton}
                                onPress={() => {
                                  sendMessagews(
                                    selectedRoom,
                                    userProfile?._id ?? ""
                                  );
                                }}
                                disabled={!messagews.trim() }
                              >
                                <Ionicons name="send" size={20} color="#FFF" />
                              </TouchableOpacity>
                            </View>
                          </KeyboardAvoidingView>
                        )}
                      </>
                    )}
                  </View>
                </>
              ) : (
                <>
                  {userOrders.length > 0 ? (
                    <FlatList
                      data={userOrders}
                      keyExtractor={(item: Order) => item._id}
                      renderItem={({ item }) => (
                        <View style={styles.orderContainer}>
                          <Text style={{color: "green", fontSize: 16, marginBottom: 10, fontWeight: "bold"}}>
                            {t("Your have placed")} {userOrders.length === 1 ? `${t("an")}` : `${userOrders.length}`} {t("order")}{userOrders.length > 1 ? "s" : ""}
                          </Text>
                          <Text style={styles.orderTitle}>
                            {t("Order ID")} : {item._id}
                          </Text>
                          <View style={{ flexDirection: "row", gap: 2 }}>
                            <Text style={styles.orderInfo}>{t("Status")}:</Text>
                            <Text style={styles.orderStatus}>
                              {t(item?.orderStatus.toLocaleUpperCase())}
                            </Text>
                          </View>

                          <Text style={styles.orderInfo}>
                            {t("Payment Method")}: {t(item.paymentMethod)}
                          </Text>
                          <Text style={styles.orderInfo}>
                            {t("Total Amount")}: {item.totalAmount.toFixed(2)} XAF
                          </Text>

                          {item.orderItems.map((orderItem, index) => (
                            <View
                              key={orderItem._id + index.toString()}
                              style={styles.orderItemContainer}
                            >
                              <Image
                                source={{ uri: orderItem.image }}
                                style={styles.orderItemImage}
                              />
                              <Text style={styles.orderItemName}>
                                {orderItem.name} x{orderItem.quantity}
                              </Text>
                            </View>
                          ))}

                          {item.orderStatus === "processing" &&
                          item.paymentInfo.status === "processing" ? (
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() => cancelOrder(item._id)}
                              disabled={isLoadingOrders}
                            >
                              <Text style={styles.cancelButtonText}>
                                {t("Cancel Order")}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={styles.disabledCancelButton}
                              disabled={true}
                            >
                              <Text style={styles.cancelButtonText}>
                                {t("Cancel Order")}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {orders.length > 0 && (
                            <TouchableOpacity
                              style={styles.viewOrdersButton}
                              onPress={() => router.push("/(tabs)/settings")}
                            >
                              <Text style={styles.viewOrdersButtonText}>
                                {t(`view`)} {orders.length} {t("Clients Orders")}
                              </Text>
                              <Ionicons
                                name="arrow-forward"
                                size={16}
                                color="white"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                      ListEmptyComponent={
                        <View style={styles.noMessagesContainer}>
                          
                          
                        </View>
                      }
                      showsVerticalScrollIndicator={false}
                    />
                  ) : (
                    <View style={styles.noMessagesContainer}>
                      <Text style={styles.noMessagesText}>
                       {t("You Have Placed An Order successfully!")}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  logo: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 245, 245, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#333",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  iconButton: {
    padding: 6,
  },
  iconWrapper: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  cartBadge: {
    backgroundColor: "#007AFF",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBlurContainer: {
    flex: 1,
    paddingTop: 100,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  notificationModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    height: screenHeight * 0.8,
    marginTop: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchBar: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  resultItem: {
    padding: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  resultDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  resultHeaderText: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    color: "#888",
    fontWeight: "bold",
    borderRadius: 8,
    marginBottom: 8,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noResultsText: {
    color: "#888",
    fontSize: 16,
  },
  noMessagesContainer: {
    flex: 1,
  },
  noMessagesText: {
    fontSize: 16,
    color: "#888",
  },
  chatContainer: {
    flex: 1,
  },
  chatScrollContainer: {
    flexGrow: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0078FF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F1F1",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#FFF",
  },
  otherMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
  },
  userMessageTime: {
    color: "#D0E7FF",
  },
  otherMessageTime: {
    color: "#888",
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderRadius: 25,
    backgroundColor: "#F9F9F9",
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#0078FF",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  orderContainer: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderColor: "#eee",
    borderWidth: 1,
  },
  orderTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  orderStatus: {
    color: "green",
    fontWeight: "600",
  },
  orderItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledCancelButton: {
    backgroundColor: "#ccc",
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  viewOrdersButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  viewOrdersButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  notificationHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  clearButton: {
    position: "absolute",
    right: 10,
  },
});

export default Header;
