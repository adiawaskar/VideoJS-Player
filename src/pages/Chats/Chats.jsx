import React, { useState, useEffect, useRef } from "react";
import { Search, Send } from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { limit } from "firebase/firestore";

import { db } from "../../api/firebase.js";
import { useAppContext } from "../../context/AppContext";
import CryptoJS from "crypto-js";
import "./Chats.css";
import SecureClient from "../../api/SecureRESTClient";

const Chats = () => {
  // const {
  //   studentID,
  //   studentName,
  //   studentEmail,
  //   studentMobile,
  //   classID,
  //   platform,
  // } = useAppContext();

  // Get query params from URL
const params = new URLSearchParams(window.location.search);

const studentID = params.get("studentID") || "850";
const studentName = params.get("studentName") || "Test Student";
const studentEmail = params.get("studentEmail") || "test@gmail.com";
const studentMobile = params.get("studentMobile") || "9137605068";
const classID = params.get("classID") || "844";
const platform = params.get("platform") || "windows";


  const client = new SecureClient();

  const [threads, setThreads] = useState([]);
  const [classmates, setClassmates] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [userStatus, setUserStatus] = useState({});
  const messagesEndRef = useRef(null);

  const [userPacks, setUserPacks] = useState([]); // ⬅️ add this near your useStates

  const [packIdToNameMap, setPackIdToNameMap] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const colors = [
    "#EF4444",
    "#3B82F6",
    "#10B981",
    "#FACC15",
    "#8B5CF6",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
  ];
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  const getRandomColor = (id) => colors[String(id).length % colors.length];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create user in Firestore if not present
  useEffect(() => {
    if (!studentID || !studentName || !classID) return;
    const userRef = doc(db, "users", studentID);

    const createUserIfNeeded = async () => {
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        const packRes = await client.parse__packData(
          await client.get__studentPacks(studentID, classID, platform)
        );
        const packIds = packRes.packs?.map((p) => String(p.pack_id)) || [];
        await setDoc(userRef, {
          id: studentID,
          name: studentName,
          email: studentEmail,
          mobile: studentMobile,
          classId: Number(classID),
          platform: platform || "unknown",
          packIds: packIds,
        });
      }
    };

    createUserIfNeeded();
  }, [studentID, studentName, studentEmail, studentMobile, classID, platform]);

  useEffect(() => {
    const fetchStudentPacks = async () => {
      try {
        const raw = await client.get__studentPacks(
          studentID,
          classID,
          platform
        );
        const parsed = await client.parse__packData(raw);

        const stringPackIds = parsed.packs?.map((p) => String(p.pack_id)) || [];

        const nameMap = {};
        parsed.packs?.forEach((p) => {
          nameMap[String(p.pack_id)] = p.course_name || `Pack ${p.pack_id}`;
        });

        setUserPacks(stringPackIds);
        setPackIdToNameMap(nameMap); // 🧠 Save the mapping here
      } catch (err) {
        console.error("Failed to fetch student packs:", err);
      }
    };

    if (studentID && classID && platform) fetchStudentPacks();
  }, [studentID, classID, platform]);

  // Presence logic
  useEffect(() => {
    if (!studentID) return;

    const presenceRef = doc(db, "presence", studentID);
    const markOnline = async () => {
      await setDoc(presenceRef, {
        state: "online",
        lastChanged: serverTimestamp(),
      });
    };

    markOnline();

    const markOffline = async () => {
      await updateDoc(presenceRef, {
        state: "offline",
        lastChanged: serverTimestamp(),
      });
    };

    window.addEventListener("beforeunload", markOffline);
    return () => {
      markOffline();
      window.removeEventListener("beforeunload", markOffline);
    };
  }, [studentID]);

  // Load threads
  // 4. Filter Threads by `packIds`
  useEffect(() => {
    if (!classID || userPacks.length === 0) {
      setThreads([]);
      return;
    }

    const q = query(
      collection(db, "threads"),
      where("classId", "==", Number(classID)),
      where("type", "==", "group"), // ✅ Now safe after index creation
      where("packIds", "array-contains-any", userPacks)
    );

    const unsub = onSnapshot(q, (snap) => {
      const threadsData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      threadsData.sort((a, b) => {
        const ta = a.createdAt?.toMillis() || 0;
        const tb = b.createdAt?.toMillis() || 0;
        return tb - ta;
      });
      console.log("✅ Group threads filtered by type + packs:", threadsData);
      setThreads(threadsData);
    });

    return () => unsub();
  }, [classID, userPacks]);

  // 5. Filter Classmates by `packIds`
  useEffect(() => {
    if (!classID || userPacks.length === 0) {
      setClassmates([]); // or leave as-is
      return;
    }

    const loadClassmates = async () => {
      const q = query(
        collection(db, "users"),
        where("classId", "==", Number(classID)),
        where("packIds", "array-contains-any", userPacks)
      );
      const snapshot = await getDocs(q);
      const students = snapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.id !== studentID);
      setClassmates(students);
    };

    loadClassmates();
  }, [classID, studentID, userPacks]);

  // Load messages and presence
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const msgsRef = collection(db, "threads", selectedChat.id, "messages");
    const q = query(msgsRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const presenceUnsubs = (selectedChat.members || []).map((uid) =>
      onSnapshot(doc(db, "presence", uid), (snap) => {
        setUserStatus((prev) => ({
          ...prev,
          [uid]: snap.exists() ? snap.data() : { state: "offline" },
        }));
      })
    );

    return () => {
      unsub();
      presenceUnsubs.forEach((unsub) => unsub());
    };
  }, [selectedChat]);

  // 🔔 Track unread messages in group threads
  useEffect(() => {
    if (!threads.length) return;

    const unsubs = threads.map((thread) => {
      const messagesRef = collection(db, "threads", thread.id, "messages");
      const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1));

      return onSnapshot(q, (snap) => {
        const latest = snap.docs[0]?.data();
        if (!latest) return;

        if (latest.senderId !== studentID && selectedChat?.id !== thread.id) {
          setUnreadCounts((prev) => ({
            ...prev,
            [thread.id]: (prev[thread.id] || 0) + 1,
          }));
        }

        // 🧹 Reset unread count when the selectedChat is opened
        if (selectedChat?.id === thread.id) {
          setUnreadCounts((prev) => {
            const copy = { ...prev };
            delete copy[thread.id];
            return copy;
          });
        }
      });
    });

    return () => unsubs.forEach((unsub) => unsub());
  }, [threads, selectedChat, studentID]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    await addDoc(collection(db, "threads", selectedChat.id, "messages"), {
      text: newMessage.trim(),
      senderId: studentID,
      senderName: studentName,
      timestamp: serverTimestamp(),
    });
    setNewMessage("");
  };

  const getStatusText = (uid) => {
    const status = userStatus[uid];
    if (!status) return "";
    if (status.state === "online") return "Online";
    return "Offline";
  };

  const filteredChats = threads.filter((thread) =>
    (thread.name || thread.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClassmates = classmates.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ChatIllustration = ({ width = 200, height = 200 }) => (
    <div className="chat-illustration" style={{ width, height }}>
      <div className="illustration-content">
        <div className="chat-bubbles">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
        </div>
        <div className="phone-icon">
          <div className="screen"></div>
        </div>
      </div>
    </div>
  );

  console.log("🚀 userPacks:", userPacks);
  console.log("📑 all threads:", threads);
  console.log("✅ filteredChats:", filteredChats);

  return (
    <div className="chats-container">
      <div className="chats-main">
        {/* SIDEBAR: Only show on desktop OR on mobile when chat isn't open */}
        {(!isMobileChatOpen || !isMobile) && (
          <div className="chats-sidebar">
            <div className="chats-search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="chats-list">
              {filteredChats.length > 0 && (
                <div className="chats-section-label">
                  🧑‍🤝‍🧑 <span>Groups</span>
                </div>
              )}
              {filteredChats.map((thread) => {
                const packId = thread.packIds?.[0];
                const courseName =
                  packIdToNameMap[packId] || `Chat ${thread.id.slice(0, 6)}`;
                return (
                  <div
                    key={thread.id}
                    className={`chats-item ${
                      selectedChat?.id === thread.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedChat(thread);
                      setUnreadCounts((prev) => {
                        const updated = { ...prev };
                        delete updated[thread.id];
                        return updated;
                      });
                      if (isMobile) setIsMobileChatOpen(true);
                    }}
                  >
                    <div
                      className="chats-avatar"
                      style={{
                        backgroundColor: getRandomColor(thread.id),
                        position: "relative",
                      }}
                    >
                      {getInitials(courseName)}
                      {unreadCounts[thread.id] > 0 && (
                        <span className="unread-badge">
                          {unreadCounts[thread.id]}
                        </span>
                      )}
                    </div>
                    <div className="chats-info">
                      <div className="chats-name">{courseName}</div>
                      <div className="chats-preview">
                        {thread.lastMessage?.text || ""}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredClassmates.length > 0 && (
                <div className="chats-section-label">
                  🎓 <span>Classmates</span>
                </div>
              )}
              {filteredClassmates.map((user) => (
                <div
                  key={user.id}
                  className="chats-item"
                  onClick={() => {
                    const rawId = [studentID, user.id].sort().join("-");
                    const hashedId = CryptoJS.SHA256(rawId)
                      .toString()
                      .substring(0, 20);
                    const threadId = `private-${hashedId}`;
                    setSelectedChat({
                      id: threadId,
                      name: user.name,
                      members: [studentID, user.id],
                    });
                    if (isMobile) setIsMobileChatOpen(true);
                  }}
                >
                  <div
                    className="chats-avatar"
                    style={{ backgroundColor: getRandomColor(user.id) }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="chats-info">
                    <div className="chats-name">{user.name}</div>
                    <div className="chats-status-text">
                      {getStatusText(user.id)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT CONTENT: Only show on desktop OR mobile if chat is open */}
        {(isMobileChatOpen || !isMobile) && (
          <div className="chats-content">
            {selectedChat ? (
              <>
                <div className="chats-header">
                  <div className="chats-header-left">
                    <div
                      className="chats-avatar"
                      style={{
                        backgroundColor: getRandomColor(selectedChat.id),
                      }}
                    >
                      {getInitials(selectedChat.name || selectedChat.id)}
                    </div>
                    <div className="chats-header-info">
                      <div className="chats-header-name">
                        {selectedChat.name ||
                          packIdToNameMap[selectedChat.packIds?.[0]] ||
                          selectedChat.id}
                      </div>
                      <div className="chats-status">
                        {selectedChat.members?.length === 2
                          ? getStatusText(
                              selectedChat.members.find(
                                (id) => id !== studentID
                              )
                            )
                          : "Group Chat"}
                      </div>
                    </div>
                  </div>
                  {isMobile && (
                    <button
                      className="back-button"
                      onClick={() => setIsMobileChatOpen(false)}
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div className="messages-container">
                  {messages.map((msg, i) => {
                    const showName =
                      i === 0 || messages[i - 1].senderId !== msg.senderId;
                    return (
                      <div
                        key={msg.id}
                        className={`message ${
                          msg.senderId === studentID
                            ? "message-sent"
                            : "message-received"
                        }`}
                      >
                        <div className="message-content">
                          {showName && (
                            <div className="sender-name">
                              {msg.senderName || "Anonymous"}
                            </div>
                          )}
                          <div className="message-text">{msg.text}</div>
                          <div className="message-time">
                            {msg.timestamp?.toDate().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="message-input-container">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="message-input"
                  />
                  <button onClick={handleSendMessage} className="send-button">
                    <Send size={20} />
                  </button>
                </div>
              </>
            ) : (
              !isMobile && (
                <div className="empty-state">
                  <div className="lottie-container">
                    <ChatIllustration width={200} height={200} />
                    <p className="placeholder-text">
                      Select a chat to start messaging
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
