const socket = io(); // connect to backend WebSocket
const output = document.getElementById("output");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let messages = [];

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

// Fetch initial messages from backend
function fetchMessages() {
  fetch("/api/messages")
    .then(res => res.json())
    .then(data => {
      messages = data;
      renderMessages();
    });
}

// Send message to backend
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then(res => res.json())
    .then(msg => {
      input.value = "";
      // message will be received via WebSocket, no need to append manually
    });
}

// Listen for real-time new messages
socket.on("new_message", (msg) => {
  messages.unshift(msg); // newest first
  renderMessages();
});

sendBtn.addEventListener("click", sendMessage);
window.onload = fetchMessages;
