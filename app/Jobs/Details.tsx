import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

interface SelectedItem {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  yearsExperience: number;
  briefWhy: string;
  jobType: string;
  companyName: string;
  location: string;
  salary: string;
  description: string;
  images: { url: string }[];
}

const ResponsiveComponent = ({
  selectedItem,
}: {
  selectedItem: SelectedItem;
}) => {
  const { width } = useWindowDimensions();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {selectedItem?.firstName} {selectedItem?.middleName}
          {selectedItem?.lastName}
        </Text>
        <Text style={styles.subtitle}>{selectedItem?.jobType}</Text>
      </View>

      {/* Image Section */}
      <Image
        source={{ uri: selectedItem?.images[0].url }}
        style={[styles.image, { width: width * 0.9, height: width * 0.6 }]}
      />

      {/* Contact Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Text style={styles.detailText}>{selectedItem?.email}</Text>
        <Text style={styles.detailText}>{selectedItem?.phone}</Text>
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.detailText}>
          {selectedItem?.yearsExperience} of experience
        </Text>
        <Text style={styles.detailText}>{selectedItem?.briefWhy}</Text>
      </View>

      {/* Job Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Details</Text>
        <Text style={styles.detailText}>
          <Text style={styles.boldText}>Company:</Text>
          {selectedItem?.companyName}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.boldText}>Location:</Text>
          {selectedItem?.location}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.boldText}>Salary:</Text> {selectedItem?.salary}
        </Text>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About the Role</Text>
        <Text style={styles.descriptionText}>{selectedItem?.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginTop: 4,
  },
  image: {
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: "cover",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
});

export default ResponsiveComponent;
