// Display messages in a table
function callApi() {
  fetch("/api/messages")
    .then(res => res.json())
    .then(data => {
      const output = document.getElementById("output");
      if (!data || data.length === 0) {
        output.innerHTML = "<p>No messages found</p>";
        return;
      }

      let html = "<table border='1' cellpadding='5'><tr><th>ID</th><th>Text</th><th>Created At</th></tr>";
      data.forEach(msg => {
        html += `<tr>
                  <td>${msg.id}</td>
                  <td>${msg.text}</td>
                  <td>${new Date(msg.created_at).toLocaleString()}</td>
                </tr>`;
      });
      html += "</table>";
      output.innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("output").innerHTML = "<p>Error fetching messages</p>";
    });
}

// Prompt user to send a new message
function sendMessage() {
  const text = prompt("Enter your message:");
  if (!text) return;

  fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
  .then(res => res.json())
  .then(() => callApi())
  .catch(err => {
    console.error(err);
    alert("Failed to send message");
  });
}

// Initial load
window.onload = callApi;
