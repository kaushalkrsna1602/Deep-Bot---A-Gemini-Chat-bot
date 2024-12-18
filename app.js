// DOM Elements
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const body = document.body;
const t1Div = document.querySelector('#t1');




// API Setup
const API_KEY = "AIzaSyCT4lpXIo8dIxhcsNTWgWOrUJx7Xlgk-vk";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// User and Chat Data
const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null,
    },
};
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// Helper Function: Scroll Chat to Bottom
const scrollToBottom = () => {
    chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth",
    });
};

// Helper Function: Create a message element
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Function: Generate Bot Response
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])],
    });

    // API Request Options
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory }),
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Display Bot Response
        const botResponseText = data.candidates[0].content.parts[0].text.trim();
        messageElement.innerText = botResponseText;

        // Add Bot Response to Chat History
        chatHistory.push({
            role: "model",
            parts: [{ text: botResponseText }],
        });
    } catch (error) {
        // Handle Errors
        console.error(error);
        messageElement.innerText = error.message;
        messageElement.style.color = "#ff0000";
    } finally {
        // Reset User File Data
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        scrollToBottom();
    }
};

// Function: Handle User Message
const handleOutgoingMessage = (e) => {
    e.preventDefault();

    // Get and Clear User Message
    userData.message = messageInput.value.trim();
    if (!userData.message && !userData.file.data) return; // Prevent sending empty messages
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");

    // Create Outgoing Message Element
    const messageContent = `
        <div class="message-text">${userData.message}</div>
        ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}
    `;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    scrollToBottom();

    // Simulate Bot Response with "thinking" Animation
    setTimeout(() => {
        const botMessageContent = `
            <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                <path d="..."></path>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        scrollToBottom();
        generateBotResponse(incomingMessageDiv);
    }, 600);
};

// Event Listeners
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (messageInput.value.trim() || userData.file.data)) {
        handleOutgoingMessage(e);
    }
});
sendMessageButton.addEventListener("click", handleOutgoingMessage);
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");

        // Store File Data
        userData.file = {
            data: e.target.result.split(",")[1],
            mime_type: file.type,
        };
        fileInput.value = "";
    };
    reader.readAsDataURL(file);
});
fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());


const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker")
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
});

document.querySelector(".chat-form").appendChild(picker);


