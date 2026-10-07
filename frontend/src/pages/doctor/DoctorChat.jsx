import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import api from "../../api/axios";
import "./DoctorChat.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

const DoctorChat = () => {
  const [user, setUser] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [patients, setPatients] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingPatients, setLoadingPatients] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

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

    return name
      .substring(0, 2)
      .toUpperCase();
  };

  const getUserId = (chatUser) =>
    chatUser?._id ||
    chatUser?.id ||
    chatUser?.userId;

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const response =
        await api.get("/chat/conversations");

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
  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      setError("");

      const response =
        await api.get("/chat/patients");

      const data =
        response.data?.patients ||
        response.data?.data ||
        [];

      setPatients(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load chat patients error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load patients for chat."
      );
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "doctor") {
      loadConversations();
      loadPatients();
    }
  }, [user]);

  const getConversationUser = (
    conversation
  ) =>
    conversation?.user ||
    conversation?.otherUser ||
    null;

  const conversationMap = useMemo(() => {
    const map = new Map();

    conversations.forEach(
      (conversation) => {
        const chatUser =
          getConversationUser(
            conversation
          );

        if (!chatUser) {
          return;
        }

        const id = getUserId(chatUser);

        if (id) {
          map.set(
            String(id),
            conversation
          );
        }
      }
    );

    return map;
  }, [conversations]);

  const filteredPatients = useMemo(() => {
    const search =
      searchText.trim().toLowerCase();

    if (!search) {
      return patients;
    }

    return patients.filter(
      (patient) => {
        const name =
          getUserName(patient)
            .toLowerCase();

        const email =
          (
            patient?.email || ""
          ).toLowerCase();

        const phone =
          (
            patient?.phone ||
            patient?.phoneNumber ||
            ""
          ).toLowerCase();

        return (
          name.includes(search) ||
          email.includes(search) ||
          phone.includes(search)
        );
      }
    );
  }, [patients, searchText]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const loadConversation = async (
    chatUser
  ) => {
    if (!chatUser) {
      return;
    }

    const chatUserId =
      getUserId(chatUser);

    if (!chatUserId) {
      setError(
        "Patient information is missing."
      );
      return;
    }

    try {
      setSelectedUser(chatUser);

      setLoadingMessages(true);

      setError("");

      const response =
        await api.get(
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

        setConversations(
          (previous) =>
            previous.map(
              (conversation) => {
                const conversationUser =
                  getConversationUser(
                    conversation
                  );

                const conversationUserId =
                  getUserId(
                    conversationUser
                  );

                if (
                  String(
                    conversationUserId
                  ) ===
                  String(chatUserId)
                ) {
                  return {
                    ...conversation,
                    unreadCount: 0,
                  };
                }

                return conversation;
              }
            )
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

  const handleFileSelect = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (
      file.size > MAX_FILE_SIZE
    ) {
      setError(
        "File size must be 10 MB or less."
      );

      event.target.value = "";
      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "This file type is not supported. Please upload an image, PDF, Word, Excel, TXT, or CSV file."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async (
    event
  ) => {
    event?.preventDefault();

    if (!selectedUser) {
      return;
    }

    const trimmedMessage =
      messageText.trim();

    if (
      !trimmedMessage &&
      !selectedFile
    ) {
      return;
    }

    const receiverId =
      getUserId(selectedUser);

    if (!receiverId) {
      setError(
        "Receiver information is missing."
      );
      return;
    }

    try {
      setSending(true);

      setError("");

      const formData =
        new FormData();

      formData.append(
        "receiverId",
        receiverId
      );

      if (trimmedMessage) {
        formData.append(
          "message",
          trimmedMessage
        );
      }

      if (selectedFile) {
        formData.append(
          "file",
          selectedFile
        );
      }

      const response =
        await api.post(
          "/chat/send",
          formData
        );

      const newMessage =
        response.data?.data ||
        response.data?.messageData;

      if (newMessage) {
        setMessages(
          (previous) => [
            ...previous,
            newMessage,
          ]
        );
      }

      setMessageText("");

      removeSelectedFile();

      await loadConversations();

      scrollToBottom();
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

  const handleMessageKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendMessage(event);
    }
  };
  const formatMessageTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const messageDate =
      new Date(date);

    if (
      Number.isNaN(
        messageDate.getTime()
      )
    ) {
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

  const isImageAttachment = (
    message
  ) => {
    const type =
      message?.attachmentType || "";

    return type.startsWith(
      "image/"
    );
  };

  const getFileIcon = (
    message
  ) => {
    const type =
      message?.attachmentType || "";

    if (
      type === "application/pdf"
    ) {
      return "📕";
    }

    if (
      type.includes("word")
    ) {
      return "📘";
    }

    if (
      type.includes("excel") ||
      type.includes("spreadsheet")
    ) {
      return "📗";
    }

    if (
      type === "text/plain" ||
      type === "text/csv"
    ) {
      return "📄";
    }

    if (
      type.startsWith("image/")
    ) {
      return "🖼️";
    }

    return "📎";
  };

  const formatFileSize = (
    size
  ) => {
    if (!size) {
      return "";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const getLastMessage = (
    conversation
  ) => {
    const lastMessage =
      conversation?.lastMessage;

    if (!lastMessage) {
      return "No messages yet";
    }

    if (
      lastMessage.message
    ) {
      return lastMessage.message;
    }

    if (
      lastMessage.attachmentName
    ) {
      return `📎 ${lastMessage.attachmentName}`;
    }

    return "Attachment";
  };

  const totalUnreadCount =
    useMemo(() => {
      return conversations.reduce(
        (
          total,
          conversation
        ) =>
          total +
          Number(
            conversation?.unreadCount ||
              0
          ),
        0
      );
    }, [conversations]);
  const handleRefresh = async () => {
    await Promise.all([
      loadConversations(),
      loadPatients(),
    ]);

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
          <h1>
            Patient Chat
          </h1>

          <p>
            Communicate securely
            with your patients.
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
            disabled={
              loadingConversations ||
              loadingPatients
            }
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
              <h2>
                Patients
              </h2>

              <span>
                {patients.length}{" "}
                patient
                {patients.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>

          </div>

          <div className="doctor-chat-search">

            <input
              type="text"
              placeholder="Search patient name or email..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
            />

          </div>

          <div className="doctor-chat-conversation-list">

            {loadingPatients ? (
              <div className="doctor-chat-empty">
                Loading patients...
              </div>
            ) : filteredPatients.length ===
              0 ? (
              <div className="doctor-chat-empty">

                <div className="doctor-chat-empty-icon">
                  👥
                </div>

                <h3>
                  No patients found
                </h3>

                <p>
                  {patients.length ===
                  0
                    ? "Patients with appointments will appear here."
                    : "Try searching with a different name or email."}
                </p>

              </div>
            ) : (
              filteredPatients.map(
                (patient) => {
                  const patientId =
                    getUserId(
                      patient
                    );

                  const selectedId =
                    getUserId(
                      selectedUser
                    );

                  const conversation =
                    conversationMap.get(
                      String(
                        patientId
                      )
                    );

                  const isSelected =
                    String(
                      patientId
                    ) ===
                    String(
                      selectedId
                    );

                  return (
                    <button
                      type="button"
                      key={patientId}
                      className={`doctor-chat-conversation ${
                        isSelected
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        loadConversation(
                          patient
                        )
                      }
                    >

                      <div className="doctor-chat-avatar">
                        {getInitials(
                          patient
                        )}
                      </div>

                      <div className="doctor-chat-conversation-content">

                        <div className="doctor-chat-conversation-top">

                          <strong>
                            {getUserName(
                              patient
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
                          {conversation
                            ? getLastMessage(
                                conversation
                              )
                            : "Start a new conversation"}
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
                Select a patient from
                the left side to start
                chatting.
              </p>

            </div>
          ) : (
            <>

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

              <div className="doctor-chat-messages">

                {loadingMessages ? (
                  <div className="doctor-chat-loading">
                    Loading messages...
                  </div>
                ) : messages.length ===
                  0 ? (
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
                  messages.map(
                    (message) => {
                      const senderId =
                        message?.sender
                          ?._id ||
                        message?.sender
                          ?.id ||
                        message?.sender;

                      const isMine =
                        String(
                          senderId
                        ) ===
                        String(
                          currentUserId
                        );

                      return (
                        <div
                          key={
                            message._id
                          }
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

                            {/* TEXT */}

                            {message.message && (
                              <div className="doctor-chat-message-text">
                                {message.message}
                              </div>
                            )}

                            {/* IMAGE */}

                            {message.attachmentUrl &&
                              isImageAttachment(
                                message
                              ) && (
                                <a
                                  href={
                                    message.attachmentUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="doctor-chat-image-link"
                                >
                                  <img
                                    src={
                                      message.attachmentUrl
                                    }
                                    alt={
                                      message.attachmentName ||
                                      "Attachment"
                                    }
                                    className="doctor-chat-image"
                                  />
                                </a>
                              )}

                            {/* OTHER FILE */}

                            {message.attachmentUrl &&
                              !isImageAttachment(
                                message
                              ) && (
                                <a
                                  href={
                                    message.attachmentUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="doctor-chat-file"
                                >

                                  <span className="doctor-chat-file-icon">
                                    {getFileIcon(
                                      message
                                    )}
                                  </span>

                                  <span className="doctor-chat-file-info">

                                    <strong>
                                      {message.attachmentName ||
                                        "Attachment"}
                                    </strong>

                                    {message.attachmentSize && (
                                      <small>
                                        {formatFileSize(
                                          message.attachmentSize
                                        )}
                                      </small>
                                    )}

                                  </span>

                                  <span className="doctor-chat-file-open">
                                    ↗
                                  </span>

                                </a>
                              )}

                            {/* TIME */}

                            <div className="doctor-chat-message-time">
                              {formatMessageTime(
                                message.createdAt
                              )}
                            </div>

                          </div>

                        </div>
                      );
                    }
                  )
                )}

                <div
                  ref={
                    messagesEndRef
                  }
                />

              </div>


              {selectedFile && (
                <div className="doctor-chat-selected-file">

                  <div className="doctor-chat-selected-file-icon">
                    {selectedFile.type.startsWith(
                      "image/"
                    )
                      ? "🖼️"
                      : "📎"}
                  </div>

                  <div className="doctor-chat-selected-file-info">

                    <strong>
                      {selectedFile.name}
                    </strong>

                    <span>
                      {formatFileSize(
                        selectedFile.size
                      )}
                    </span>

                  </div>

                  <button
                    type="button"
                    className="doctor-chat-remove-file"
                    onClick={
                      removeSelectedFile
                    }
                    title="Remove file"
                  >
                    ×
                  </button>

                </div>
              )}


              <form
                className="doctor-chat-input-area"
                onSubmit={
                  handleSendMessage
                }
              >

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  className="doctor-chat-hidden-file-input"
                  accept={ALLOWED_FILE_TYPES.join(
                    ","
                  )}
                  onChange={
                    handleFileSelect
                  }
                />

                <button
                  type="button"
                  className="doctor-chat-attach-button"
                  onClick={
                    handleAttachClick
                  }
                  disabled={sending}
                  title="Attach file"
                >
                  📎
                </button>

                <textarea
                  value={
                    messageText
                  }
                  onChange={(event) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleMessageKeyDown
                  }
                  placeholder={
                    selectedFile
                      ? "Add a message or send the file..."
                      : "Type your message..."
                  }
                  rows={1}
                  disabled={sending}
                />

                <button
                  type="submit"
                  className="doctor-chat-send-button"
                  disabled={
                    sending ||
                    (
                      !messageText.trim() &&
                      !selectedFile
                    )
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