const output = document.getElementById("output");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Fetch and render messages
function fetchMessages() {
  fetch("/api/messages")
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        output.innerHTML = "<p>No messages found</p>";
        return;
      }

      let html = "<table border='1' cellpadding='5' style='width:100%;'>";
      html += "<tr><th>ID</th><th>Text</th><th>Created At</th></tr>";

      data.forEach((msg, index) => {
        const formattedTime = new Date(msg.created_at).toLocaleString();
        const highlight = index === 0 ? "style='background:#d4f1ff'" : "";
        html += `<tr ${highlight}>
                  <td>${msg.id}</td>
                  <td>${msg.text}</td>
                  <td>${formattedTime}</td>
                </tr>`;
      });

      output.innerHTML = html;

      // Scroll to top to see newest message
      output.scrollIntoView({ behavior: "smooth" });
    })
    .catch(err => {
      console.error(err);
      output.innerHTML = "<p>Error fetching messages</p>";
    });
}

// Send new message
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
    .then(res => res.json())
    .then(() => {
      input.value = "";
      fetchMessages();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to send message");
    });
}

// Auto-refresh every 3 seconds
setInterval(fetchMessages, 3000);

// Bind send button
sendBtn.addEventListener("click", sendMessage);

// Initial load
window.onload = fetchMessages;
