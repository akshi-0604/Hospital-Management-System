import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./PatientChat.css";

const PatientChat = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to read logged-in user:", error);
      }
    }
  }, []);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setError("");

      const response = await api.get("/chat/doctors");

      const doctorList = response.data?.doctors || [];

      setDoctors(doctorList);
    } catch (error) {
      console.error("Failed to load chat doctors:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load doctors."
      );

      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await api.get("/chat/conversations");

      const conversationList =
        response.data?.conversations || [];

      setConversations(conversationList);
    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );

      setConversations([]);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    loadDoctors();
    loadConversations();
  }, [currentUser]);

  const conversationMap = useMemo(() => {
    const map = new Map();

    conversations.forEach((conversation) => {
      const otherUser =
        conversation.otherUser ||
        conversation.user ||
        conversation.doctor;

      if (otherUser?._id) {
        map.set(
          String(otherUser._id),
          conversation
        );
      }
    });

    return map;
  }, [conversations]);

  const filteredDoctors = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      const fullName = String(
        doctor.fullName || ""
      ).toLowerCase();

      const specialization = String(
        doctor.specialization || ""
      ).toLowerCase();

      const department = String(
        doctor.department || ""
      ).toLowerCase();

      const email = String(
        doctor.email || ""
      ).toLowerCase();

      return (
        fullName.includes(search) ||
        specialization.includes(search) ||
        department.includes(search) ||
        email.includes(search)
      );
    });
  }, [doctors, searchTerm]);

  const getDoctorName = (doctor) => {
    return (
      doctor?.fullName ||
      doctor?.name ||
      "Doctor"
    );
  };

  const loadConversation = async (doctor) => {
    if (!doctor?._id) return;

    try {
      setSelectedDoctor(doctor);
      setLoadingMessages(true);
      setError("");

      const response = await api.get(
        `/chat/conversation/${doctor._id}`
      );

      const conversationMessages =
        response.data?.messages || [];

      setMessages(conversationMessages);

      // Mark messages as read
      try {
        await api.patch(
          `/chat/read/${doctor._id}`
        );
      } catch (readError) {
        console.error(
          "Failed to mark messages as read:",
          readError
        );
      }

      // Refresh conversation list
      await loadConversations();
    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );

      setMessages([]);

      setError(
        error.response?.data?.message ||
          "Failed to load conversation."
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const trimmedMessage =
      messageText.trim();

    if (!trimmedMessage) return;

    if (!selectedDoctor?._id) return;

    try {
      setSending(true);
      setError("");

      const response = await api.post(
        "/chat/send",
        {
          receiverId: selectedDoctor._id,
          message: trimmedMessage,
        }
      );

      const sentMessage =
        response.data?.message ||
        response.data?.data;

      if (sentMessage) {
        setMessages((previousMessages) => [
          ...previousMessages,
          sentMessage,
        ]);
      } else {
        // Reload if backend response
        // doesn't return the created message.
        await loadConversation(
          selectedDoctor
        );
      }

      setMessageText("");

      await loadConversations();
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleMessageKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  };

  const formatMessageTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLastMessage = (doctor) => {
    const conversation =
      conversationMap.get(
        String(doctor._id)
      );

    if (!conversation) {
      return "Start the conversation";
    }

    const lastMessage =
      conversation.lastMessage;

    if (!lastMessage) {
      return "Start the conversation";
    }

    if (typeof lastMessage === "string") {
      return lastMessage;
    }

    return (
      lastMessage.message ||
      "Start the conversation"
    );
  };

  const getUnreadCount = (doctor) => {
    const conversation =
      conversationMap.get(
        String(doctor._id)
      );

    return (
      conversation?.unreadCount || 0
    );
  };

  if (!currentUser) {
    return (
      <div className="patient-chat-page">
        <div className="patient-chat-loading">
          Loading chat...
        </div>
      </div>
    );
  }

  return (
    <div className="patient-chat-page">
      
      <aside className="patient-chat-sidebar">
        <div className="patient-chat-sidebar-header">
          <div>
            <h2>Chat</h2>
            <p>
              Doctors you have appointments with
            </p>
          </div>
        </div>

        <div className="patient-chat-search">
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        {loadingDoctors ? (
          <div className="patient-chat-empty">
            Loading doctors...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="patient-chat-empty">
            {searchTerm
              ? "No doctors found."
              : "You don't have any doctors available for chat."}
          </div>
        ) : (
          <div className="patient-doctor-list">
            {filteredDoctors.map((doctor) => {
              const unreadCount =
                getUnreadCount(doctor);

              const isSelected =
                selectedDoctor?._id ===
                doctor._id;

              return (
                <button
                  key={doctor._id}
                  type="button"
                  className={`patient-doctor-item ${
                    isSelected
                      ? "patient-doctor-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    loadConversation(doctor)
                  }
                >
                  <div className="patient-doctor-avatar">
                    {getDoctorName(
                      doctor
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="patient-doctor-info">
                    <div className="patient-doctor-top">
                      <h3>
                        {getDoctorName(
                          doctor
                        )}
                      </h3>

                      {unreadCount > 0 && (
                        <span className="patient-chat-unread">
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="patient-doctor-specialization">
                      {doctor.specialization ||
                        doctor.department ||
                        "Doctor"}
                    </p>

                    <p className="patient-doctor-last-message">
                      {getLastMessage(
                        doctor
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <main className="patient-chat-main">
        {!selectedDoctor ? (
          <div className="patient-chat-welcome">
            <div className="patient-chat-welcome-icon">
              💬
            </div>

            <h2>Select a doctor</h2>

            <p>
              Select a doctor from the list to
              start or continue your conversation.
            </p>

            <p className="patient-chat-welcome-note">
              Only doctors you have an appointment
              with are shown here.
            </p>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="patient-chat-header">
              <div className="patient-chat-header-avatar">
                {getDoctorName(
                  selectedDoctor
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="patient-chat-header-info">
                <h2>
                  {getDoctorName(
                    selectedDoctor
                  )}
                </h2>

                <p>
                  {selectedDoctor.specialization ||
                    selectedDoctor.department ||
                    "Doctor"}
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="patient-chat-error">
                {error}
              </div>
            )}

            {/* Messages */}
            <div className="patient-chat-messages">
              {loadingMessages ? (
                <div className="patient-chat-loading">
                  Loading conversation...
                </div>
              ) : messages.length === 0 ? (
                <div className="patient-chat-no-messages">
                  <div className="patient-chat-no-messages-icon">
                    💬
                  </div>

                  <h3>
                    Start the conversation
                  </h3>

                  <p>
                    Send a message to{" "}
                    {getDoctorName(
                      selectedDoctor
                    )}{" "}
                    to begin chatting.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const senderId =
                    message.sender?._id ||
                    message.sender;

                  const isMine =
                    String(senderId) ===
                    String(
                      currentUser?._id ||
                        currentUser?.id ||
                        currentUser?.userId
                    );

                  return (
                    <div
                      key={
                        message._id ||
                        `${message.createdAt}-${Math.random()}`
                      }
                      className={`patient-message-row ${
                        isMine
                          ? "patient-message-row-mine"
                          : "patient-message-row-other"
                      }`}
                    >
                      <div
                        className={`patient-message-bubble ${
                          isMine
                            ? "patient-message-bubble-mine"
                            : "patient-message-bubble-other"
                        }`}
                      >
                        <p>
                          {message.message}
                        </p>

                        <span>
                          {formatMessageTime(
                            message.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form
              className="patient-chat-input-area"
              onSubmit={sendMessage}
            >
              <textarea
                value={messageText}
                onChange={(event) =>
                  setMessageText(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleMessageKeyDown
                }
                placeholder={`Message ${getDoctorName(
                  selectedDoctor
                )}...`}
                rows={1}
                disabled={sending}
              />

              <button
                type="submit"
                disabled={
                  sending ||
                  !messageText.trim()
                }
              >
                {sending
                  ? "Sending..."
                  : "Send"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default PatientChat;