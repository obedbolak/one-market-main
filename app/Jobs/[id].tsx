import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useProduct } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ResponsiveComponent from "./Details";

interface Images {
  public_id: string;
  url: string;
}

interface JobDetailsParams {
  id: string;
  title: string;
  image: string;
}

interface ImageData {
  public_id: string;
  url: string;
  _id: string;
}

interface JobApplication {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  jobType: string;
  briefWhy: string;
  yearsExperience: string;
  email: string;
  phone: string;
  images: ImageData[];
}

interface JobsCreated {
  _id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salary: string;
  description: string;
  jobImage: ImageData[];
}
interface selectedItem {
  companyName?: string;
  location?: string;
  salary?: string;
  description?: string;
}

const JobDetails = () => {
  const { id, title } = useLocalSearchParams<any>();
  const { userProfile } = useAuth();
  const { jobApps, jobs } = useProduct();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("");
  const [jobType, setJobType] = useState("");
  const [briefWhy, setBriefWhy] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [images, setImages] = useState<Images[]>([]);
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [jobsCreated, setJobsCreated] = useState<JobsCreated[]>([]);
  const [loadingcreate, setLoadingCreate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewContent, setViewContent] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<
    JobsCreated | JobApplication | null
  >(null);

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");

  const [categorystate, setCategorystate] = useState("All Jobs");
  const [momonNumber, setMomoNumber] = useState("");

  const setAllCategory = () => {
    setCategorystate("All Jobs");
    setSearchQuery("");
  };

  const setJobSeekersCategory = () => {
    setCategorystate("Job Seekers");
    setSearchQuery("");
  };

  const getFilteredJobs = () => {
    const query = searchQuery.toLowerCase().trim();

    if (categorystate === "All Jobs") {
      if (!query) return jobsCreated;

      return jobs.filter(
        (job: any) =>
          job.description?.toLowerCase().includes(query) ||
          job.jobTitle?.toLowerCase().includes(query)
      );
    } else {
      if (!query) return jobApplications;

      return jobApps.filter(
        (application: any) =>
          application.briefWhy?.toLowerCase().includes(query) ||
          application.jobType?.toLowerCase().includes(query)
      );
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets?.length) {
      const newUris = result.assets.map((asset) => asset.uri);
      setSelectedImageUris((prev) => [...prev, ...newUris].slice(0, 5));
    }
  };

  const removeSelectedImage = (uri: string) => {
    setSelectedImageUris((prev) =>
      prev.filter((selectedUri) => selectedUri !== uri)
    );
  };

  const removeImage = (publicId: string) => {
    setImages((prev) => prev.filter((img) => img.public_id !== publicId));
  };

  const submitFormData = async () => {
    const form = new FormData();
    let endpoint = "";
setLoadingCreate(true)
setLoading(true)
    if (id === "1") {
      endpoint = "https://onemarketapi.xyz/api/v1/job/create/application";
      form.append("firstName", firstName);
      form.append("middleName", middleName);
      form.append("lastName", lastName);
      form.append("gender", gender);
      form.append("jobType", jobType);
      form.append("briefWhy", briefWhy);
      form.append("yearsExperience", yearsExperience);
      form.append("email", email);
      form.append("phone", phone);
    } else if (id === "2") {
      endpoint = "https://onemarketapi.xyz/api/v1/job/create-job";
      form.append("jobTitle", jobTitle);
      form.append("companyName", companyName);
      form.append("location", location);
      form.append("salary", salary);
      form.append("description", description);
    }

    selectedImageUris.forEach((uri, index) => {
      form.append("files", {
        uri,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      });
    });

    try {
      const response = await axios.post(endpoint, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        alert("Form submitted successfully!");
        setLoadingCreate(false);
        setLoading(false);
        if (id === "1") {
          setFirstName("");
          setMiddleName("");
          setLastName("");
          setGender("");
          setJobType("");
          setBriefWhy("");
          setYearsExperience("");
          setEmail("");
          setPhone("");
          setImages([]);
        } else if (id === "2") {
          setJobTitle("");
          setCompanyName("");
          setLocation("");
          setSalary("");
          setDescription("");
          setImages([]);
        }

        if (response.data.images) {
          setImages(response.data.images);
        }
        setSelectedImageUris([]);
      }
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  // Sync local state with context data
  React.useEffect(() => {
    setJobsCreated(
      (jobs || []).map((job: any) => ({
        _id: job._id,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        salary: job.salary,
        description: job.description,
        jobImage: job.jobImage || [],
      }))
    );
    setJobApplications(jobApps || []);
    setLoading(false);
  }, [jobs, jobApps]);

  const renderImagePreviews = () => {
    return (
      <View style={styles.imagePreviewContainer}>
        {selectedImageUris.map((uri, index) => (
          <View key={`selected-${index}`} style={styles.imagePreviewWrapper}>
            <Image source={{ uri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeSelectedImage(uri)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        {images.map((image) => (
          <View key={image.public_id} style={styles.imagePreviewWrapper}>
            <Image source={{ uri: image.url }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(image.public_id)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderFormForId = (id: string) => {
    switch (id) {
      case "1":
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginTop: -30 }}
          >
            <View style={styles.formContainer}>
              <View style={styles.nameRow}>
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  placeholder={t("First Name")}
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  placeholder={t("Middle Name")}
                  value={middleName}
                  onChangeText={setMiddleName}
                />
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  placeholder={t("Last Name")}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder={t("Your skills/Qualifications")}
                value={jobType}
                onChangeText={setJobType}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t("Explain why someone should hire you")}
                value={briefWhy}
                onChangeText={setBriefWhy}
                multiline
                numberOfLines={4}
              />

              <TextInput
                style={styles.input}
                placeholder={t("State your experience in the sector")}
                keyboardType="numeric"
                value={yearsExperience}
                onChangeText={setYearsExperience}
              />

              <TextInput
                style={styles.input}
                placeholder={t("Enter e-mail(Optional)")}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                style={styles.input}
                placeholder={t("Enter Phone (+237 687876765)")}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <View style={styles.genderContainer}>
                <Text style={styles.genderLabel}>{t("Gender")}:</Text>
                <View style={styles.genderOptions}>
                  {["Male", "Female", "Other"].map((genderOption) => (
                    <TouchableOpacity
                      key={genderOption}
                      style={[
                        styles.genderButton,
                        gender === genderOption && styles.genderButtonSelected,
                      ]}
                      onPress={() => setGender(genderOption)}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          gender === genderOption &&
                            styles.genderButtonTextSelected,
                        ]}
                      >
                        {t(genderOption)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>{t("Upload Documents")}</Text>
                <Text style={styles.imageHelperText}>
                  {t("Upload your resume, CV, or other relevant documents (Max 5 images)")}
                </Text>

                {selectedImageUris.length + images.length < 5 && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickImage}
                  >
                    <Text style={styles.uploadButtonText}>
                      Upload Documents (
                      {selectedImageUris.length + images.length}
                      /5)
                    </Text>
                  </TouchableOpacity>
                )}

                {renderImagePreviews()}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  setLoading(true);
                  submitFormData();
                }}
                disabled={loading || selectedImageUris.length === 0 || !firstName || !lastName || !middleName || !jobType || !briefWhy || !yearsExperience || !email || !phone || !gender}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                  
                ) : (
                  <Text style={styles.submitButtonText}>
                    {t("Submit Application")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "2":
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("Job Title")}
                value={jobTitle}
                onChangeText={setJobTitle}
              />
              <TextInput
                style={styles.input}
                placeholder={t("Company Name")}
                value={companyName}
                onChangeText={setCompanyName}
              />
              <TextInput
                style={styles.input}
                placeholder={t("Location")}
                value={location}
                onChangeText={setLocation}
              />
              <TextInput
                style={styles.input}
                placeholder={t("Salary")}
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t("Job Description")}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>{t("Upload Job Images")}</Text>
                {selectedImageUris.length + images.length < 5 && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickImage}
                  >
                    <Text style={styles.uploadButtonText}>
                      {t("Upload Images")} ({selectedImageUris.length + images.length}
                      /5)
                    </Text>
                  </TouchableOpacity>
                )}
                {renderImagePreviews()}
              </View>
              {/* <Text style={styles.imageHelperText}>
                a payment of 1000 XAF is required to post a job
              </Text>
              <View>
                <KeyboardAvoidingView>
                  <PhoneField
                    label="Enter Momo number"
                    placeholder="Enter Phone (687876765)"
                    keyboardType="phone-pad"
                    value={momonNumber}
                    helperText="Enter the number you want to use for payment"
                    onChangeText={(text) => setMomoNumber(text)}
                  />
                </KeyboardAvoidingView>
                <PaymentComponent
                  disabled={loadingcreate || !momonNumber}
                  mobileMoneyNumber={momonNumber}
                  amount={1000}
                  userId={userProfile?._id || ""}
                  orderDescription="Job Posting Fee"
                  onPaymentSuccess={async () => {
                    submitFormData();
                    setLoadingCreate(true);
                    console.log("Payment successful!");
                  }}
                  onPaymentFailure={(error) => {
                    Alert.alert("Payment Failed", "Please try again later.", [
                      { text: "OK" },
                    ]);
                  }}
                  maxPollingAttempts={15} // Wait up to 75 seconds (15 * 5s)
                  paymentMethod="mobile_money"
                />
              </View> */}
               <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                submitFormData();
                setLoadingCreate(true);
              }}
              disabled={loadingcreate}
            >
              {loadingcreate ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{t("Create Job")}</Text>
              )}
            </TouchableOpacity> 
            </View>
          </ScrollView>
        );

      default:
        return <Text>No form available for this category.</Text>;
    }
  };

  const renderFormContent = () => {
    if (id === "3") {
      return (
        <View style={styles.searchSection}>
          <View
            style={{
              flexDirection: "row",
              width: "90%",
              justifyContent: "flex-start",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              style={[
                styles.button,
                categorystate === "All Jobs" && styles.activeButton,
              ]}
              onPress={setAllCategory}
            >
              <Text style={styles.buttonText}>{t("All Jobs")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                categorystate === "Job Seekers" && styles.activeButton,
              ]}
              onPress={setJobSeekersCategory}
            >
              <Text style={styles.buttonText}>{t("Job Seekers")}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchBar}
            placeholder={
              categorystate === "All Jobs"
                ? t("Search job titles and descriptions")
                : t("Search job types and descriptions")
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.scrollContent}>{renderFormForId(id)}</View>
      </KeyboardAvoidingView>
    );
  };

  // if (loading) {
  //   return (
  //     <View style={styles.centered}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //     </View>
  //   );
  // }

  const renderJobItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {categorystate === "All Jobs" ? (
        <>
          <View
            style={{
              flexDirection: "row",
              maxWidth: "98%",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.name}>{item.jobTitle}</Text>
            <Text
              style={[styles.jobType, { fontWeight: "600", color: "orange" }]}
            >
              {item.companyName}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "98%",
              justifyContent: "space-between",
            }}
          >
            <View>
              <View style={{ flexDirection: "row" }}>
                <Ionicons name="location" size={20} color={"orange"} />
                <Text style={styles.email}>{item.location}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 5,
                  marginTop: 5,
                }}
              >
                <Ionicons name="call" size={20} color={"orange"} />
                <Text style={styles.phone}>+237 98948757</Text>
              </View>
            </View>
            <Text style={[styles.experience, { color: "green" }]}>
              Salary: {item.salary}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(0,0,0, 0.03)",
              justifyContent: "center",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "500" }}>{t("Brief Description")}</Text>
            <Text style={styles.briefWhy} numberOfLines={4}>
              {item.description}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(0,0,0, 0.03)",
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#007BFF",
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white" }}>{t("Apply Now")}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              maxWidth: "98%",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.name}>
              {item.firstName} {item.middleName} {item.lastName}
            </Text>
            <Text
              style={[styles.jobType, { fontWeight: "600", color: "orange" }]}
            >
              {item.jobType}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "98%",
              justifyContent: "space-between",
            }}
          >
            <View>
              {item.email && (
                <View style={{ flexDirection: "row" }}>
                  <Ionicons name="mail" size={20} color={"orange"} />
                  <Text style={styles.email}>{item.email}</Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 5,
                  marginTop: 5,
                }}
              >
                <Ionicons name="call" size={20} color={"orange"} />
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
            </View>
            <Text style={[styles.experience, { color: "green" }]}>
              Experience: {item.yearsExperience}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(0,0,0, 0.03)",
              justifyContent: "center",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "500" }}>{t("Brief Description")}</Text>
            <Text style={styles.briefWhy} numberOfLines={4}>
              {t("Why You Should Hire Me")}: {item.briefWhy}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(0,0,0, 0.03)",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: 10,
              borderRadius: 10,
              flexDirection: "row",
              gap: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#007BFF",
                padding: 10,
                borderRadius: 10,
              }}
              onPress={() => {
                setViewContent(true);
                setSelectedItem(item);
              }}
            >
              <Text style={{ color: "white" }}>{t("View Details")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#007BFF",
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white" }}>{t("Hire")}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "98%",
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity
          style={{
            width: 40,
            backgroundColor: "skyblue",
            padding: 2,
            borderRadius: 25,
            paddingVertical: 9,
          }}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={"white"}
            style={{ alignSelf: "center" }}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t(title)}</Text>
      </View>

      {id === "3" ? (
        <>
          {viewContent ? (
            <>
              {selectedItem && (
                <ResponsiveComponent selectedItem={selectedItem} />
              )}
            </>
          ) : (
            <>
              {renderFormContent()}
              <FlatList
                data={getFilteredJobs()}
                keyExtractor={(item) => item._id}
                renderItem={renderJobItem}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={() => (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      {t("No results for")} "{searchQuery}"
                    </Text>
                    <View></View>
                  </View>
                )}
              />
            </>
          )}
        </>
      ) : (
        renderFormContent()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  imageContainer: {
    marginTop: 10,
  },
  card: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  jobType: {
    fontSize: 16,
    color: "#555",
  },
  experience: {
    fontSize: 16,
    color: "#555",
  },
  email: {
    fontSize: 16,
    color: "#555",
  },
  phone: {
    fontSize: 16,
    color: "#555",
  },
  briefWhy: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: "#0056b3",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 16,
  },
  formContainer: {
    padding: 16,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    padding: 12,
  },
  uploadButton: {
    backgroundColor: "#f5f5f5",
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadButtonText: {
    color: "#666",
    textAlign: "center",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  searchSection: {
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  searchButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imagePreviewWrapper: {
    width: "31%",
    aspectRatio: 1,
    marginBottom: 8,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 68, 68, 0.9)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageHelperText: {
    color: "#666",
    marginBottom: 12,
    fontSize: 14,
  },
  imageSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginHorizontal: 4,
    alignItems: "center",
  },
  genderButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  genderButtonText: {
    color: "#000",
  },
  genderButtonTextSelected: {
    color: "#fff",
  },

  card1: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  // Name and Job Type Row
  nameJobTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  name1: {
    fontSize: 18,
    fontWeight: "bold",
  },
  jobType1: {
    fontSize: 16,
    color: "#555",
  },

  // Contact and Experience Row
  contactExperienceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  email1: {
    fontSize: 16,
    color: "#555",
    marginLeft: 5,
  },
  phone1: {
    fontSize: 16,
    color: "#555",
    marginLeft: 5,
  },
  experience1: {
    fontSize: 16,
    color: "#555",
  },

  // Brief Description Section
  briefDescriptionContainer: {
    backgroundColor: "rgba(0,0,0, 0.03)",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  briefDescriptionTitle: {
    fontWeight: "500",
    marginBottom: 5,
  },
  briefWhy1: {
    fontSize: 16,
    color: "#555",
  },

  // Image Preview Section
  imagePreviewContainer1: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imagePreviewWrapper1: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  previewImage1: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default JobDetails;
