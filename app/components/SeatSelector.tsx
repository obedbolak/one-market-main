import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SeatSelectorProps {
  onSeatsSelected: (seats: string[]) => void; // Ensure this matches usage
  initialSelected: string[]; // Remove optional if always provided
  rows?: number;
  seatsPerRow?: number;
}
const SeatSelector: React.FC<SeatSelectorProps> = ({
  onSeatsSelected,
  initialSelected = [],
  rows = 10,
  seatsPerRow = 4,
}) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>(initialSelected);
  const [showModal, setShowModal] = useState(false);

  // Generate seat layout (e.g., A1, A2, B1, B2, etc.)
  const generateSeats = () => {
    const seats = [];
    const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    for (let row = 0; row < rows; row++) {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        seats.push(`${rowLetters[row]}${seatNum}`);
      }
    }
    return seats;
  };

  const seats = generateSeats();

  const toggleSeatSelection = (seat: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      } else {
        return [...prev, seat];
      }
    });
  };

  const handleAccept = () => {
    onSeatsSelected(selectedSeats);
    setShowModal(false);
  };

  const handleClear = () => {
    setSelectedSeats([]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.triggerButtonText}>
          {selectedSeats.length > 0
            ? `Selected: ${selectedSeats.join(", ")}`
            : "Select Seats"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Seats</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Add ScrollView to wrap the entire content */}
            <ScrollView contentContainerStyle={styles.scrollableContent}>
              <View style={styles.busLayout}>
                {/* Bus driver area */}
                <View style={styles.driverArea}>
                  <View style={styles.steeringWheel} />
                  <Text style={styles.driverText}>Driver</Text>
                </View>

                {/* Seat grid */}
                <View style={styles.seatGrid}>
                  {Array.from({ length: rows }).map((_, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.seatRow}>
                      <Text style={styles.rowLabel}>
                        {String.fromCharCode(65 + rowIndex)}
                      </Text>

                      <View style={styles.seatGroup}>
                        {Array.from({ length: seatsPerRow }).map(
                          (_, seatIndex) => {
                            const seatNumber = seatIndex + 1;
                            const seatId = `${String.fromCharCode(
                              65 + rowIndex
                            )}${seatNumber}`;
                            const isSelected = selectedSeats.includes(seatId);
                            const isAisle =
                              seatNumber === Math.ceil(seatsPerRow / 2);

                            return (
                              <React.Fragment key={seatId}>
                                <TouchableOpacity
                                  style={[
                                    styles.seat,
                                    isSelected && styles.selectedSeat,
                                    isAisle && styles.aisleSpace,
                                  ]}
                                  onPress={() =>
                                    !isAisle && toggleSeatSelection(seatId)
                                  }
                                  disabled={isAisle}
                                >
                                  {!isAisle && (
                                    <>
                                      <Ionicons
                                        name={
                                          isSelected
                                            ? "checkmark-circle"
                                            : "person-outline"
                                        }
                                        size={20}
                                        color={isSelected ? "#fff" : "#64748b"}
                                      />
                                      <Text
                                        style={[
                                          styles.seatText,
                                          isSelected && styles.selectedSeatText,
                                        ]}
                                      >
                                        {seatNumber}
                                      </Text>
                                    </>
                                  )}
                                </TouchableOpacity>

                                {/* Add aisle after the middle seat */}
                                {seatNumber === Math.floor(seatsPerRow / 2) && (
                                  <View style={styles.aisle} />
                                )}
                              </React.Fragment>
                            );
                          }
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Footer with action buttons */}
              <View style={styles.footer}>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.availableColor]} />
                    <Text>Available</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.selectedColor]} />
                    <Text>Selected</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.aisleColor]} />
                    <Text>Aisle</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                  >
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={handleAccept}
                    disabled={selectedSeats.length === 0}
                  >
                    <Text style={styles.acceptButtonText}>
                      Accept ({selectedSeats.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  triggerButtonText: {
    color: "#1e293b",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  busLayout: {
    padding: 16,
  },
  driverArea: {
    alignItems: "center",
    marginBottom: 20,
  },
  steeringWheel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#94a3b8",
    marginBottom: 8,
  },
  driverText: {
    color: "#64748b",
    fontWeight: "500",
  },
  seatGrid: {
    paddingBottom: 16,
  },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rowLabel: {
    width: 24,
    fontWeight: "600",
    color: "#475569",
    marginRight: 8,
  },
  seatGroup: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  seat: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexDirection: "row",
  },
  selectedSeat: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  seatText: {
    color: "#64748b",
    fontSize: 12,
    marginLeft: 4,
  },
  selectedSeatText: {
    color: "#fff",
  },
  aisleSpace: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  aisle: {
    width: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  availableColor: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedColor: {
    backgroundColor: "#3b82f6",
  },
  aisleColor: {
    backgroundColor: "transparent",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#64748b",
    fontWeight: "500",
  },
  acceptButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    flex: 1,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  scrollableContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
});

export default SeatSelector;
