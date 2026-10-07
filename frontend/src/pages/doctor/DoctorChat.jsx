import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./DoctorChat.css";

const DoctorChat = () => {
  const [user, setUser] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  const [messageText, setMessageText] = useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to read user:", error);
    }
  }, []);

  const currentUserId =
    user?._id ||
    user?.id ||
    user?.userId;

  const getUserName = (chatUser) => {
    if (!chatUser) {
      return "User";
    }

    return (
      chatUser.fullName ||
      chatUser.name ||
      chatUser.email ||
      "User"
    );
  };

  const getInitials = (chatUser) => {
    const name = getUserName(chatUser);

    const parts = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[parts.length - 1][0]
      ).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };
  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const response = await api.get(
        "/chat/conversations"
      );

      const data =
        response.data?.conversations ||
        response.data?.data ||
        [];

      setConversations(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load conversations error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load chat conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  };

 
  const loadDoctors = async () => {
    try {
      const response = await api.get(
        "/doctors"
      );

      const data =
        response.data?.doctors ||
        response.data?.data ||
        response.data ||
        [];

      if (Array.isArray(data)) {
        setDoctors(data);
      }
    } catch (error) {
      console.error(
        "Load doctors error:",
        error
      );
    }
  };

  const loadPatients = async () => {
    try {
      /*
       * Important:
       * The existing /patients endpoint is restricted
       * to admin/receptionist in your HMS.
       *
       * Therefore we do NOT call /patients here.
       *
       * Patients will be obtained from existing
       * conversations for now.
       */
    } catch (error) {
      console.error(
        "Load patients error:",
        error
      );
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    loadConversations();

    if (user.role === "doctor") {
      loadDoctors();
    }

    if (user.role === "patient") {
      loadPatients();
    }
  }, [user]);

  const getConversationUser = (conversation) => {
    return (
      conversation?.user ||
      conversation?.otherUser ||
      null
    );
  };

  const filteredConversations = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return conversations;
    }

    return conversations.filter(
      (conversation) => {
        const chatUser =
          getConversationUser(conversation);

        const name = getUserName(chatUser)
          .toLowerCase();

        const email = (
          chatUser?.email || ""
        ).toLowerCase();

        return (
          name.includes(search) ||
          email.includes(search)
        );
      }
    );
  }, [conversations, searchText]);

  const loadConversation = async (chatUser) => {
    if (!chatUser) {
      return;
    }

    const chatUserId =
      chatUser._id ||
      chatUser.id ||
      chatUser.userId;

    if (!chatUserId) {
      return;
    }

    try {
      setSelectedUser(chatUser);
      setLoadingMessages(true);
      setError("");

      const response = await api.get(
        `/chat/conversation/${chatUserId}`
      );

      const data =
        response.data?.messages ||
        response.data?.data ||
        [];

      setMessages(
        Array.isArray(data) ? data : []
      );

      try {
        await api.patch(
          `/chat/read/${chatUserId}`
        );

        setConversations((previous) =>
          previous.map((conversation) => {
            const conversationUser =
              getConversationUser(
                conversation
              );

            const conversationUserId =
              conversationUser?._id ||
              conversationUser?.id;

            if (
              String(conversationUserId) ===
              String(chatUserId)
            ) {
              return {
                ...conversation,
                unreadCount: 0,
              };
            }

            return conversation;
          })
        );
      } catch (readError) {
        console.error(
          "Mark messages as read error:",
          readError
        );
      }
    } catch (error) {
      console.error(
        "Load conversation error:",
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

  const handleSendMessage = async (event) => {
    event?.preventDefault();

    if (!selectedUser) {
      return;
    }

    const trimmedMessage =
      messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    const receiverId =
      selectedUser._id ||
      selectedUser.id ||
      selectedUser.userId;

    if (!receiverId) {
      setError(
        "Receiver information is missing."
      );
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await api.post(
        "/chat/send",
        {
          receiverId,
          message: trimmedMessage,
        }
      );

      const newMessage =
        response.data?.data ||
        response.data?.messageData;

      if (newMessage) {
        setMessages((previous) => [
          ...previous,
          newMessage,
        ]);
      }

      setMessageText("");

      await loadConversations();
    } catch (error) {
      console.error(
        "Send message error:",
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

      handleSendMessage(event);
    }
  };

  const formatMessageTime = (date) => {
    if (!date) {
      return "";
    }

    const messageDate = new Date(date);

    if (Number.isNaN(messageDate.getTime())) {
      return "";
    }

    return messageDate.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getLastMessage = (conversation) => {
    const lastMessage =
      conversation?.lastMessage;

    if (!lastMessage) {
      return "No messages yet";
    }

    return (
      lastMessage.message ||
      "No messages yet"
    );
  };

  const availableUsers = useMemo(() => {
    const map = new Map();

    conversations.forEach((conversation) => {
      const chatUser =
        getConversationUser(conversation);

      if (!chatUser) {
        return;
      }

      const id =
        chatUser._id ||
        chatUser.id ||
        chatUser.userId;

      if (id) {
        map.set(String(id), chatUser);
      }
    });

    /*
     * For doctors, add doctors list only if
     * needed later. The backend allows only
     * doctor-patient chat, so we filter patients
     * from conversations for now.
     */
    if (user?.role === "doctor") {
      conversations.forEach((conversation) => {
        const chatUser =
          getConversationUser(conversation);

        if (
          chatUser &&
          chatUser.role === "patient"
        ) {
          const id =
            chatUser._id ||
            chatUser.id ||
            chatUser.userId;

          if (id) {
            map.set(String(id), chatUser);
          }
        }
      });
    }

    return Array.from(map.values());
  }, [conversations, user]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce(
      (total, conversation) =>
        total +
        Number(
          conversation?.unreadCount || 0
        ),
      0
    );
  }, [conversations]);

  const handleRefresh = async () => {
    await loadConversations();

    if (selectedUser) {
      await loadConversation(
        selectedUser
      );
    }
  };

  return (
    <div className="doctor-chat-page">
     
      <div className="doctor-chat-header">
        <div>
          <h1>Patient Chat</h1>

          <p>
            Communicate securely with your
            patients.
          </p>
        </div>

        <div className="doctor-chat-header-actions">
          {totalUnreadCount > 0 && (
            <div className="doctor-chat-unread-badge">
              {totalUnreadCount} unread
            </div>
          )}

          <button
            type="button"
            className="doctor-chat-refresh-button"
            onClick={handleRefresh}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="doctor-chat-error">
          {error}
        </div>
      )}

      <div className="doctor-chat-container">
        
        <div className="doctor-chat-sidebar">
          <div className="doctor-chat-sidebar-header">
            <div>
              <h2>Conversations</h2>

              <span>
                {conversations.length} conversation
                {conversations.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="doctor-chat-search">
            <input
              type="text"
              placeholder="Search patient..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
            />
          </div>

          {/* Conversation List */}
          <div className="doctor-chat-conversation-list">
            {loadingConversations ? (
              <div className="doctor-chat-empty">
                Loading conversations...
              </div>
            ) : filteredConversations.length ===
              0 ? (
              <div className="doctor-chat-empty">
                <div className="doctor-chat-empty-icon">
                  💬
                </div>

                <h3>No conversations</h3>

                <p>
                  Your patient conversations
                  will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map(
                (conversation) => {
                  const chatUser =
                    getConversationUser(
                      conversation
                    );

                  const chatUserId =
                    chatUser?._id ||
                    chatUser?.id ||
                    chatUser?.userId;

                  const selectedId =
                    selectedUser?._id ||
                    selectedUser?.id ||
                    selectedUser?.userId;

                  const isSelected =
                    String(chatUserId) ===
                    String(selectedId);

                  return (
                    <button
                      type="button"
                      key={chatUserId}
                      className={`doctor-chat-conversation ${
                        isSelected
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        loadConversation(
                          chatUser
                        )
                      }
                    >
                      <div className="doctor-chat-avatar">
                        {getInitials(chatUser)}
                      </div>

                      <div className="doctor-chat-conversation-content">
                        <div className="doctor-chat-conversation-top">
                          <strong>
                            {getUserName(
                              chatUser
                            )}
                          </strong>

                          {conversation?.unreadCount >
                            0 && (
                            <span className="doctor-chat-unread-count">
                              {
                                conversation.unreadCount
                              }
                            </span>
                          )}
                        </div>

                        <div className="doctor-chat-last-message">
                          {getLastMessage(
                            conversation
                          )}
                        </div>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </div>

        <div className="doctor-chat-main">
          {!selectedUser ? (
            <div className="doctor-chat-welcome">
              <div className="doctor-chat-welcome-icon">
                💬
              </div>

              <h2>
                Welcome to Patient Chat
              </h2>

              <p>
                Select a conversation from the
                left side to start chatting with
                a patient.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="doctor-chat-main-header">
                <div className="doctor-chat-main-user">
                  <div className="doctor-chat-avatar large">
                    {getInitials(
                      selectedUser
                    )}
                  </div>

                  <div>
                    <h2>
                      {getUserName(
                        selectedUser
                      )}
                    </h2>

                    <span>
                      Patient
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="doctor-chat-messages">
                {loadingMessages ? (
                  <div className="doctor-chat-loading">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="doctor-chat-no-messages">
                    <div className="doctor-chat-no-message-icon">
                      👋
                    </div>

                    <h3>
                      Start the conversation
                    </h3>

                    <p>
                      Send a message to{" "}
                      {getUserName(
                        selectedUser
                      )}
                      .
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const senderId =
                      message?.sender?._id ||
                      message?.sender?.id ||
                      message?.sender;

                    const isMine =
                      String(senderId) ===
                      String(currentUserId);

                    return (
                      <div
                        key={message._id}
                        className={`doctor-chat-message-row ${
                          isMine
                            ? "mine"
                            : "received"
                        }`}
                      >
                        <div
                          className={`doctor-chat-message ${
                            isMine
                              ? "mine"
                              : "received"
                          }`}
                        >
                          <div className="doctor-chat-message-text">
                            {message.message}
                          </div>

                          <div className="doctor-chat-message-time">
                            {formatMessageTime(
                              message.createdAt
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                className="doctor-chat-input-area"
                onSubmit={handleSendMessage}
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
                  placeholder="Type your message..."
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
        </div>
      </div>
    </div>
  );
};

export default DoctorChat;