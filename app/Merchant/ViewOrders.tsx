import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Paragraph, Snackbar, Title } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

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
  status: string;
  _id: string;
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
  orderItems: OrderItem[];
  paymentInfo: PaymentInfo;
  paymentMethod: string;
  shippingCharges: number;
  shippingInfo: ShippingInfo;
  tax: number;
  totalAmount: number;
  createdAt: string;
  orderStatus: string;
}

interface OrderModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onMarkDelivered: (orderId: string, itemId: string) => Promise<void>;
}

const OrderModal: React.FC<OrderModalProps> = ({
  visible,
  order,
  onClose,
  onMarkDelivered,
}) => {
  if (!order) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Order Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Title>Order #{order._id}</Title>
            <View
              style={{
                flexDirection: "row",
                width: "90%",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.sectionHeader}>Items:</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text style={styles.sectionHeader}>Status:</Text>
                <TouchableOpacity>
                  <Text style={[styles.sectionHeader, { color: "green" }]}>
                    {order.orderStatus.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {order.orderItems.map((item: OrderItem) => (
              <Card key={item._id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <Title>{item.name}</Title>
                    <Text>{item.status}</Text>
                  </View>

                  {item.image && (
                    <Card.Cover
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                    />
                  )}

                  <Paragraph>Quantity: {item.quantity}</Paragraph>
                  <Paragraph>Price: XAF{item.price.toFixed(2)}</Paragraph>
                  <Paragraph>
                    Total: XAF{(item.price * item.quantity).toFixed(2)}
                  </Paragraph>

                  {item.status === "processing" && (
                    <Button
                      mode="contained"
                      onPress={() => onMarkDelivered(order._id, item._id)}
                      style={styles.deliveredButton}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))}

            <Text style={styles.sectionHeader}>Shipping Information:</Text>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Paragraph>{order.shippingInfo.address}</Paragraph>
                <Paragraph>
                  {order.shippingInfo.city}, {order.shippingInfo.country}
                </Paragraph>
                <Paragraph>
                  Postal Code: {order.shippingInfo.postalCode}
                </Paragraph>
              </Card.Content>
            </Card>

            <Text style={styles.sectionHeader}>Payment Information:</Text>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Paragraph>Method: {order.paymentMethod}</Paragraph>
                <Paragraph>
                  Provider: {order.paymentInfo.mobileMoneyProvider}
                </Paragraph>
                <Paragraph>Status: {order.paymentInfo.status}</Paragraph>
                <Paragraph>
                  Total Amount: ${order.totalAmount.toFixed(2)}
                </Paragraph>
                <Paragraph>Tax: ${order.tax.toFixed(2)}</Paragraph>
                <Paragraph>
                  Shipping: ${order.shippingCharges.toFixed(2)}
                </Paragraph>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const VendorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [shipped, setShipped] = useState<boolean>(false);

  const [successful, setSucessful] = useState<boolean>(false);

  const fetchOrders = async (): Promise<void> => {
    if (!userProfile?._id) {
      console.error("User profile is not available.");
      return;
    }

    setIsLoadingOrders(true);
    setOrdersError(null);

    try {
      const response = await axios.get<{
        filter(arg0: (order: any) => any): unknown;
        data: Order[];
      }>("https://onemarketapi.xyz/api/v1/orders/all-orders");

      if (response.data) {
        const vendorOrders = response.data.filter((order) =>
          order.orderItems.some(
            (item: OrderItem) => item.sellerId === userProfile._id
          )
        );
        setOrders(vendorOrders);
        setFilteredOrders(vendorOrders);
      } else {
        setOrdersError("No orders found or failed to fetch orders.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrdersError("An error occurred while fetching orders.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const markAsDelivered = async (
    orderId: string,
    itemId: string
  ): Promise<void> => {
    try {
      await axios.put(
        `https://onemarketapi.xyz/api/v1/orders/${orderId}/deliver/${itemId}`
      );
      await fetchOrders();
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      setOrdersError("Failed to mark order as delivered.");
    }
  };

  const filterOrdersByStatus = (status: string): void => {
    setFilterStatus(status);

    if (status === "") {
      setFilteredOrders(orders);
      setProcessing(false);
      setShipped(false);
    } else {
      const filtered = orders.filter((order) => {
        if (status === "processing") {
          setProcessing(true);
          setShipped(false);
          return (
            order.orderStatus === "processing" ||
            order.orderStatus === "shipped"
          );
        } else if (status === "delivered") {
          setProcessing(false);
          setSucessful(true);
          return order.orderStatus === "delivered";
        } else if (status === "failed") {
          setShipped(false);
          setProcessing(false);
          return order.paymentInfo.status === "failed";
        }
        return false;
      });
      setFilteredOrders(filtered);
    }
  };

  useEffect(() => {
    if (userProfile?._id) {
      fetchOrders();
    }
  }, [userProfile?._id]);

  const updateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      const response = await fetch(
        `https://onemarketapi.xyz/api/v1/orders/orders/${orderId}/status`,
        {
          method: "PUT", // Specify the HTTP method
          headers: {
            "Content-Type": "application/json", // Ensure the content type is JSON
          },
          body: JSON.stringify({ orderStatus }), // Pass the status in the request body
        }
      );

      const data = await response.json();

      if (response.ok) {
        // You can trigger a refetch of orders here
        await fetchOrders();
        setFilterStatus("");
      } else {
        console.log("Failed to update order status:", data);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Call the updateOrderStatus function when you want to update the order status
  const handleMarkAsShipped = (orderId: string) => {
    updateOrderStatus(orderId, "shipped");
  };

  const handleMarkAsDelivered = (orderId: string) => {
    updateOrderStatus(orderId, "delivered");
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "" && styles.activeFilter,
            ]}
            onPress={() => filterOrdersByStatus("")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "" && styles.activeFilterText,
              ]}
            >
              All Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "processing" && styles.activeFilter,
            ]}
            onPress={() => filterOrdersByStatus("processing")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "processing" && styles.activeFilterText,
              ]}
            >
              Processing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "successful" && styles.activeFilter,
            ]}
            onPress={() => filterOrdersByStatus("delivered")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "successful" && styles.activeFilterText,
              ]}
            >
              Successful
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "failed" && styles.activeFilter,
            ]}
            onPress={() => filterOrdersByStatus("failed")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "failed" && styles.activeFilterText,
              ]}
            >
              Failed
            </Text>
          </TouchableOpacity>
        </View>

        {isLoadingOrders && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        )}

        {ordersError && (
          <Snackbar
            visible={!!ordersError}
            onDismiss={() => setOrdersError(null)}
          >
            {ordersError}
          </Snackbar>
        )}

        {!isLoadingOrders && !ordersError && filteredOrders.length === 0 && (
          <Text style={styles.noOrdersText}>
            No orders available for the selected status.
          </Text>
        )}

        {filteredOrders.map((order) => (
          <Card
            key={order._id}
            style={styles.card}
            onPress={() => {
              setSelectedOrder(order);
              setModalVisible(true);
            }}
          >
            <Card.Content>
              <Title>Order #{order._id}</Title>
              <View style={styles.orderInfo}>
                <Paragraph style={styles.orderStatus}>
                  Status: {order.orderStatus.toLocaleUpperCase()}
                </Paragraph>
                <Paragraph style={styles.orderAmount}>
                  Amount: ${order.totalAmount.toFixed(2)}
                </Paragraph>
              </View>
              <Paragraph style={styles.orderDate}>
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </Paragraph>
              <View>
                {processing && order.orderStatus === "processing" && (
                  <TouchableOpacity
                    style={{
                      backgroundColor:
                        order.paymentMethod === "Payment_On_Delivery"
                          ? "green"
                          : "lightgray",
                      padding: 10,
                      alignSelf: "flex-end",
                      borderRadius: 10,
                    }}
                    onPress={() => handleMarkAsShipped(order._id)}
                    disabled={order.paymentMethod !== "Payment_On_Delivery"}
                  >
                    {order.paymentMethod === "Payment_On_Delivery" ? (
                      <Text style={styles.buttonText}>Mark As Shipped</Text>
                    ) : (
                      <Text style={styles.buttonText}>Waiting For Payment</Text>
                    )}
                  </TouchableOpacity>
                )}

                {processing && order.orderStatus === "shipped" && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "orange",
                      padding: 10,
                      alignSelf: "flex-start",
                      borderRadius: 10,
                    }}
                    onPress={() => handleMarkAsDelivered(order._id)}
                  >
                    <Text style={styles.buttonText}>Mark as Delivered</Text>
                  </TouchableOpacity>
                )}
                {successful && order.orderStatus === "delivered" && (
                  <View style={{}}>
                    <Ionicons name="checkmark-circle" size={24} color="green" />
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}

        <OrderModal
          visible={modalVisible}
          order={selectedOrder}
          onClose={() => {
            setModalVisible(false);
            setSelectedOrder(null);
          }}
          onMarkDelivered={markAsDelivered}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: "white", // Text color
    fontSize: 16, // Text size
    fontWeight: "bold", // Text weight
  },
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  header: {
    paddingBottom: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  activeFilter: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  card: {
    marginVertical: 10,
  },
  viewButton: {
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  itemCard: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemImage: {
    height: 200,
    marginVertical: 8,
  },
  deliveredButton: {
    marginTop: 8,
  },
  infoCard: {
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  orderStatus: {
    fontWeight: "500",
    color: "#666",
  },
  orderAmount: {
    fontWeight: "500",
  },
  orderDate: {
    color: "#666",
    fontSize: 12,
  },
});

export default VendorDashboard;
