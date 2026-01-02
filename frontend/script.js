function callApi() {
  fetch("/api/users")
    .then(res => res.json())
    .then(data => {
      document.getElementById("output").innerText =
        JSON.stringify(data, null, 2);
    });
}
