// Set backend URL (use LB DNS or same origin)
const BACKEND_URL = window.location.origin;

const output = document.getElementById("output");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
let messages = [];

// Connect to backend Socket.IO
const socket = io(BACKEND_URL);

// Render messages
function renderMessages() {
  if (!messages || messages.length === 0) {
    output.innerHTML = "<p>No messages</p>";
    return;
  }

  let html = "<table border='1' cellpadding='5' style='width:100%;'>";
  html += "<tr><th>ID</th><th>Text</th><th>Created At</th></tr>";

  messages.forEach((msg, index) => {
    const formattedTime = new Date(msg.created_at).toLocaleString();
    const highlight = index === 0 ? "style='background:#d4f1ff'" : "";
    html += `<tr ${highlight}>
              <td>${msg.id}</td>
              <td>${msg.text}</td>
              <td>${formattedTime}</td>
            </tr>`;
  });

  html += "</table>";
  output.innerHTML = html;
  output.scrollIntoView({ behavior: "smooth" });
}

// Fetch initial messages
function fetchMessages() {
  fetch(`${BACKEND_URL}/api/messages`)
    .then(res => res.json())
    .then(data => {
      messages = data;
      renderMessages();
    })
    .catch(err => {
      console.error("Fetch error:", err);
      output.innerHTML = "<p>Error fetching messages</p>";
    });
}

// Send new message
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  fetch(`${BACKEND_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then(res => res.json())
    .then(() => {
      input.value = "";
      // new message will arrive via WebSocket
    })
    .catch(err => {
      console.error(err);
      alert("Failed to send message");
    });
}

// Receive real-time messages
socket.on("new_message", (msg) => {
  messages.unshift(msg); // newest first
  renderMessages();
});

// Bind send button
sendBtn.addEventListener("click", sendMessage);

// Initial load
window.onload = fetchMessages;
