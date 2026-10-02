function toggleChat() {
  let chatbot = document.getElementById("chatbot-container");
  chatbot.style.display = chatbot.style.display === "none" || chatbot.style.display === "" ? "block" : "none";
}

async function sendMessage(event) {
  if (event.key === "Enter") {
      let input = document.getElementById("chatbot-input");
      let message = input.value.trim();
      if (message === "") return;

      let chatbox = document.getElementById("chatbot-messages");

      let userMessage = document.createElement('div');
      userMessage.className = "chat-message user";
      userMessage.innerHTML = `<div class="chat-bubble">${message}</div>`;
      chatbox.appendChild(userMessage);
      
      saveChatHistory();
      input.value = "";
      chatbox.scrollTop = chatbox.scrollHeight;

      try {
          let response = await fetch(`http://localhost:8000/api/chatbot?message=${encodeURIComponent(message)}`);
          let data = await response.json();

          let botMessage = document.createElement('div');
          botMessage.className = "chat-message bot";
          botMessage.innerHTML = `<div class="chat-bubble">${data.response.replace(/\n/g, "<br>")}</div>`;
          chatbox.appendChild(botMessage);
          
          saveChatHistory();
          chatbox.scrollTop = chatbox.scrollHeight;
      } catch (error) {
          console.error("Chatbot API error:", error);
          let errorMessage = document.createElement('div');
          errorMessage.className = "chat-message bot";
          errorMessage.innerHTML = `<div class="chat-bubble">Sorry! I can't answer now.</div>`;
          chatbox.appendChild(errorMessage);
          chatbox.scrollTop = chatbox.scrollHeight;
      }
  }
}

function saveChatHistory() {
  let chatbox = document.getElementById("chatbot-messages");
  sessionStorage.setItem("chatHistory", chatbox.innerHTML);
}

function loadChatHistory() {
  let chatbox = document.getElementById("chatbot-messages");
  let history = sessionStorage.getItem("chatHistory");

  if (history) {
      chatbox.innerHTML = history;
  } else {
      let welcomeMessage = document.createElement('div');
      welcomeMessage.className = "chat-message bot";
      welcomeMessage.innerHTML = `<div class="chat-bubble">Hello! How can I assist you today?</div>`;
      chatbox.appendChild(welcomeMessage);
      
      let optionsContainer = document.createElement('div');
      optionsContainer.className = "chat-options";
      optionsContainer.innerHTML = `
          <button onclick="selectOption('info')">📌 Website Information</button>
          <button onclick="selectOption('usage')">📖 How to Use the Website</button>
          <button onclick="selectOption('advice')">🛒 Product Consultation</button>
          <button onclick="selectOption('others')">❓ Other Questions</button>
      `;
      chatbox.appendChild(optionsContainer);
  }
}

function selectOption(option) {
  let chatbox = document.getElementById("chatbot-messages");
  let response = "";
  let message = "";

  switch (option) {
      case 'info':
          message = "Introduce your website";
          response = "UET Store is an e-commerce platform specializing in smart electronic products. It is also a marketplace where you can buy or sell various items.";
          break;
      case 'usage':
          message = "How to Use the Website";
          response = "Which part of the website would you like me to guide you through?";
          break;
      case 'advice':
          message = "I want to know about some products"
          response = "What product would you like me to recommend?";
          break;
      case 'others':
          message = "I have some questions want to know";
          response = "You can ask me anything related to the website!";
          break;
  }

  let userMessage = document.createElement('div');
  userMessage.className = "chat-message user";
  userMessage.innerHTML = `<div class="chat-bubble">${message}</div>`;
  chatbox.appendChild(userMessage);

  let botResponse = document.createElement('div');
  botResponse.className = "chat-message bot";
  botResponse.innerHTML = `<div class="chat-bubble">${response}</div>`;
  chatbox.appendChild(botResponse);
  
  saveChatHistory();
  chatbox.scrollTop = chatbox.scrollHeight;
}

document.addEventListener("DOMContentLoaded", loadChatHistory);