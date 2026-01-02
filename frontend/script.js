const BACKEND_URL = window.location.origin;
const output = document.getElementById("output");
const inputText = document.getElementById("messageInput");
const inputUser = document.getElementById("usernameInput");
const sendBtn = document.getElementById("sendBtn");

let messages = [];

// Socket.IO connection
const socket = io(BACKEND_URL);

function renderMessages() {
  if (!messages.length) {
    output.innerHTML = "<p>No messages</p>";
    return;
  }

  let html = "<table border='1' cellpadding='5' style='width:100%;'>";
  html += "<tr><th>ID</th><th>User</th><th>Text</th><th>Created At</th><th>Updated At</th><th>Actions</th></tr>";

  messages.forEach((msg) => {
    html += `<tr>
      <td>${msg.id}</td>
      <td>${msg.user}</td>
      <td>${msg.text}</td>
      <td>${new Date(msg.created_at).toLocaleString()}</td>
      <td>${msg.updated_at ? new Date(msg.updated_at).toLocaleString() : '-'}</td>
      <td>
        <button onclick="editMessage(${msg.id})">Edit</button>
        <button onclick="deleteMessage(${msg.id})">Delete</button>
      </td>
    </tr>`;
  });

  html += "</table>";
  output.innerHTML = html;
}

// Fetch initial messages
function fetchMessages() {
  fetch(`${BACKEND_URL}/api/messages`)
    .then(res => res.json())
    .then(data => { messages = data; renderMessages(); });
}

// Send message
function sendMessage() {
  const text = inputText.value.trim();
  const user = inputUser.value.trim() || 'Anonymous';
  if (!text) return;

  fetch(`${BACKEND_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, user }),
  }).then(() => inputText.value = "");
}

// Edit message
function editMessage(id) {
  const msg = messages.find(m => m.id === id);
  const newText = prompt("Edit message:", msg.text);
  if (!newText) return;

  fetch(`${BACKEND_URL}/api/messages/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: newText }),
  });
}

// Delete message
function deleteMessage(id) {
  if (!confirm("Are you sure you want to delete this message?")) return;
  fetch(`${BACKEND_URL}/api/messages/${id}`, { method: "DELETE" });
}

// Socket.IO listeners
socket.on("message_created", (msg) => { messages.unshift(msg); renderMessages(); });
socket.on("message_updated", (msg) => { 
  const index = messages.findIndex(m => m.id === msg.id); 
  if (index >= 0) { messages[index].text = msg.text; messages[index].updated_at = msg.updated_at; renderMessages(); }
});
socket.on("message_deleted", (msg) => { messages = messages.filter(m => m.id !== msg.id); renderMessages(); });

sendBtn.addEventListener("click", sendMessage);
window.onload = fetchMessages;
