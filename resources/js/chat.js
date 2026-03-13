/**
 * Chatbot AI - Chat Module
 * Handles text, image, and audio messaging with Gemini AI
 */

// State
let currentChatId = null;
let isProcessing = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let recordingSeconds = 0;
let selectedImage = null;

// DOM Elements
const messagesContainer = document.getElementById("messages-container");
const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const uploadBtn = document.getElementById("upload-btn");
const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");
const removeImageBtn = document.getElementById("remove-image");
const recordBtn = document.getElementById("record-btn");
const audioRecording = document.getElementById("audio-recording");
const recordingTime = document.getElementById("recording-time");
const typingIndicator = document.getElementById("typing-indicator");
const welcomeMessage = document.getElementById("welcome-message");
const chatTitle = document.getElementById("chat-title");
const chatList = document.getElementById("chat-list");
const newChatBtn = document.getElementById("new-chat-btn");
const deleteChatBtn = document.getElementById("delete-chat-btn");

// Config
const config = window.ChatConfig;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    renderChatList();
    setupEventListeners();
    autoResizeTextarea();
});

function setupEventListeners() {
    sendBtn.addEventListener("click", sendMessage);
    uploadBtn.addEventListener("click", () => imageInput.click());
    imageInput.addEventListener("change", handleImageSelect);
    removeImageBtn.addEventListener("click", removeImage);
    recordBtn.addEventListener("click", toggleRecording);
    newChatBtn.addEventListener("click", createNewChat);
    deleteChatBtn.addEventListener("click", deleteCurrentChat);

    // Suggestion buttons
    document.querySelectorAll(".suggestion-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            messageInput.value = btn.dataset.text;
            sendMessage();
        });
    });
}

// ==================== MESSAGE SENDING ====================

async function sendMessage() {
    if (isProcessing) return;

    const text = messageInput.value.trim();

    if (selectedImage) {
        await sendImageMessage(text);
        return;
    }

    if (!text) return;

    setProcessing(true);
    hideWelcome();

    // Add user message to UI
    appendMessage("user", text, "text");
    messageInput.value = "";
    resetTextareaHeight();

    try {
        const formData = new FormData();
        formData.append("message", text);
        if (currentChatId) formData.append("chat_id", currentChatId);

        const response = await fetch(config.routes.sendText, {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": config.csrfToken,
                Accept: "application/json",
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Terjadi kesalahan");
        }

        currentChatId = data.chat_id;
        chatTitle.textContent = data.chat_title;
        deleteChatBtn.classList.remove("hidden");

        appendMessage("assistant", data.message.content, "text");
        updateChatList(data.chat_id, data.chat_title);
    } catch (error) {
        appendError(error.message);
    } finally {
        setProcessing(false);
    }
}

async function sendImageMessage(prompt = "") {
    if (!selectedImage) return;

    setProcessing(true);
    hideWelcome();

    const displayText = prompt || "📷 Gambar dikirim";
    appendMessage(
        "user",
        displayText,
        "image",
        URL.createObjectURL(selectedImage),
    );

    try {
        const formData = new FormData();
        formData.append("image", selectedImage);
        if (prompt) formData.append("prompt", prompt);
        if (currentChatId) formData.append("chat_id", currentChatId);

        removeImage();
        messageInput.value = "";
        resetTextareaHeight();

        const response = await fetch(config.routes.sendImage, {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": config.csrfToken,
                Accept: "application/json",
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Gagal mengirim gambar");
        }

        currentChatId = data.chat_id;
        chatTitle.textContent = data.chat_title;
        deleteChatBtn.classList.remove("hidden");

        appendMessage("assistant", data.message.content, "text");
        updateChatList(data.chat_id, data.chat_title);
    } catch (error) {
        appendError(error.message);
    } finally {
        setProcessing(false);
    }
}

async function sendAudioMessage(audioBlob) {
    setProcessing(true);
    hideWelcome();

    appendMessage("user", "🎤 Pesan suara", "audio");

    try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        if (currentChatId) formData.append("chat_id", currentChatId);

        const response = await fetch(config.routes.sendAudio, {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": config.csrfToken,
                Accept: "application/json",
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Gagal mengirim audio");
        }

        currentChatId = data.chat_id;
        chatTitle.textContent = data.chat_title;
        deleteChatBtn.classList.remove("hidden");

        appendMessage("assistant", data.message.content, "text");
        updateChatList(data.chat_id, data.chat_title);
    } catch (error) {
        appendError(error.message);
    } finally {
        setProcessing(false);
    }
}

// ==================== IMAGE HANDLING ====================

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    selectedImage = file;
    previewImg.src = URL.createObjectURL(file);
    imagePreview.classList.remove("hidden");
    messageInput.placeholder = "Tambahkan deskripsi gambar (opsional)...";
    messageInput.focus();
}

function removeImage() {
    selectedImage = null;
    imageInput.value = "";
    imagePreview.classList.add("hidden");
    previewImg.src = "";
    messageInput.placeholder = "Ketik pesan...";
}

// ==================== AUDIO RECORDING ====================

async function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingSeconds = 0;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            stream.getTracks().forEach((t) => t.stop());
            sendAudioMessage(audioBlob);
        };

        mediaRecorder.start();
        audioRecording.classList.remove("hidden");
        recordBtn.classList.add("recording-active");

        recordingInterval = setInterval(() => {
            recordingSeconds++;
            const mins = Math.floor(recordingSeconds / 60)
                .toString()
                .padStart(2, "0");
            const secs = (recordingSeconds % 60).toString().padStart(2, "0");
            recordingTime.textContent = `${mins}:${secs}`;
        }, 1000);
    } catch (error) {
        appendError("Tidak dapat mengakses mikrofon. Pastikan izin diberikan.");
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        clearInterval(recordingInterval);
        audioRecording.classList.add("hidden");
        recordBtn.classList.remove("recording-active");
    }
}

// ==================== UI RENDERING ====================

function appendMessage(role, content, type, fileUrl = null) {
    const wrapper = document.createElement("div");
    wrapper.className = `message-wrapper flex ${role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`;

    if (role === "user") {
        wrapper.innerHTML = `
            <div class="max-w-[80%] lg:max-w-[70%]">
                ${type === "image" && fileUrl ? `<img src="${fileUrl}" alt="Uploaded" class="max-h-48 rounded-xl mb-2 border border-gray-700/30">` : ""}
                <div class="user-bubble px-4 py-3 rounded-2xl rounded-tr-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/10">
                    <p class="text-sm leading-relaxed whitespace-pre-wrap">${escapeHtml(content)}</p>
                </div>
                <p class="text-xs text-gray-600 mt-1 text-right">${formatTime(new Date())}</p>
            </div>
        `;
    } else {
        wrapper.innerHTML = `
            <div class="flex items-start gap-3 max-w-[85%] lg:max-w-[75%]">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                    </svg>
                </div>
                <div>
                    <div class="assistant-bubble px-4 py-3 rounded-2xl rounded-tl-md bg-gray-800/60 border border-gray-700/30 text-gray-200 shadow-lg">
                        <div class="text-sm leading-relaxed prose-chat">${renderMarkdown(content)}</div>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">${formatTime(new Date())}</p>
                </div>
            </div>
        `;
    }

    messagesEl.appendChild(wrapper);
    scrollToBottom();
}

function appendError(message) {
    const wrapper = document.createElement("div");
    wrapper.className = "flex justify-center animate-fadeIn";
    wrapper.innerHTML = `
        <div class="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md text-center">
            <p class="text-red-400 text-sm">⚠️ ${escapeHtml(message)}</p>
            <button class="mt-2 text-xs text-red-400/70 hover:text-red-400 underline" onclick="this.parentElement.parentElement.remove()">Tutup</button>
        </div>
    `;
    messagesEl.appendChild(wrapper);
    scrollToBottom();
}

function setProcessing(processing) {
    isProcessing = processing;
    sendBtn.disabled = processing;
    uploadBtn.disabled = processing;

    if (processing) {
        typingIndicator.classList.remove("hidden");
        scrollToBottom();
    } else {
        typingIndicator.classList.add("hidden");
    }
}

function hideWelcome() {
    if (welcomeMessage) {
        welcomeMessage.style.display = "none";
    }
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// ==================== CHAT LIST / SIDEBAR ====================

function renderChatList() {
    chatList.innerHTML = "";
    if (!config.chats || config.chats.length === 0) return;

    config.chats.forEach((chat) => {
        addChatListItem(chat.id, chat.title);
    });
}

function addChatListItem(id, title) {
    // Remove existing item with same ID
    const existing = chatList.querySelector(`[data-chat-id="${id}"]`);
    if (existing) existing.remove();

    const item = document.createElement("button");
    item.className = `chat-list-item w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 truncate ${currentChatId === id ? "bg-gray-800/50 text-gray-200" : ""}`;
    item.dataset.chatId = id;
    item.innerHTML = `
        <div class="flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            <span class="truncate">${escapeHtml(title)}</span>
        </div>
    `;
    item.addEventListener("click", () => loadChat(id, title));
    chatList.prepend(item);
}

function updateChatList(chatId, title) {
    addChatListItem(chatId, title);
    highlightActiveChat(chatId);
}

function highlightActiveChat(chatId) {
    chatList.querySelectorAll(".chat-list-item").forEach((item) => {
        if (parseInt(item.dataset.chatId) === chatId) {
            item.classList.add("bg-gray-800/50", "text-gray-200");
        } else {
            item.classList.remove("bg-gray-800/50", "text-gray-200");
        }
    });
}

async function loadChat(chatId, title) {
    if (isProcessing) return;

    currentChatId = chatId;
    chatTitle.textContent = title;
    deleteChatBtn.classList.remove("hidden");
    highlightActiveChat(chatId);

    // Clear messages
    messagesEl.innerHTML = "";
    hideWelcome();

    // Close mobile sidebar
    closeSidebar();

    try {
        const response = await fetch(
            `${config.routes.chatHistory}/${chatId}/history`,
            {
                headers: {
                    "X-CSRF-TOKEN": config.csrfToken,
                    Accept: "application/json",
                },
            },
        );

        const messages = await response.json();

        messages.forEach((msg) => {
            appendMessage(msg.role, msg.content, msg.type, msg.file_path);
        });
    } catch (error) {
        appendError("Gagal memuat riwayat chat");
    }
}

async function createNewChat() {
    currentChatId = null;
    chatTitle.textContent = "Chat Baru";
    deleteChatBtn.classList.add("hidden");

    // Clear active state
    chatList.querySelectorAll(".chat-list-item").forEach((item) => {
        item.classList.remove("bg-gray-800/50", "text-gray-200");
    });

    // Reset messages
    messagesEl.innerHTML = "";

    // Show welcome
    if (welcomeMessage) {
        welcomeMessage.style.display = "";
        messagesEl.appendChild(welcomeMessage);
    }

    closeSidebar();
    messageInput.focus();
}

async function deleteCurrentChat() {
    if (!currentChatId || isProcessing) return;

    if (!confirm("Hapus chat ini?")) return;

    try {
        await fetch(`${config.routes.deleteChat}/${currentChatId}`, {
            method: "DELETE",
            headers: {
                "X-CSRF-TOKEN": config.csrfToken,
                Accept: "application/json",
            },
        });

        const item = chatList.querySelector(
            `[data-chat-id="${currentChatId}"]`,
        );
        if (item) item.remove();

        createNewChat();
    } catch (error) {
        appendError("Gagal menghapus chat");
    }
}

// ==================== UTILITIES ====================

function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}
// Make it global for inline handler
window.handleKeyDown = handleKeyDown;

function autoResizeTextarea() {
    messageInput.addEventListener("input", () => {
        messageInput.style.height = "auto";
        messageInput.style.height =
            Math.min(messageInput.scrollHeight, 128) + "px";
    });
}

function resetTextareaHeight() {
    messageInput.style.height = "auto";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Simple markdown renderer for AI responses
 */
function renderMarkdown(text) {
    if (!text) return "";

    let html = escapeHtml(text);

    // Code blocks (```...```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre class="bg-gray-900/80 border border-gray-700/30 rounded-xl p-4 my-3 overflow-x-auto"><code class="text-sm text-gray-300">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-900/60 border border-gray-700/30 px-1.5 py-0.5 rounded text-indigo-300 text-sm">$1</code>',
    );

    // Bold
    html = html.replace(
        /\*\*([^*]+)\*\*/g,
        '<strong class="font-semibold text-gray-100">$1</strong>',
    );

    // Italic
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Headers
    html = html.replace(
        /^### (.+)$/gm,
        '<h3 class="text-base font-semibold text-gray-100 mt-4 mb-2">$1</h3>',
    );
    html = html.replace(
        /^## (.+)$/gm,
        '<h2 class="text-lg font-semibold text-gray-100 mt-4 mb-2">$1</h2>',
    );
    html = html.replace(
        /^# (.+)$/gm,
        '<h1 class="text-xl font-bold text-gray-100 mt-4 mb-2">$1</h1>',
    );

    // Unordered lists
    html = html.replace(
        /^[\*\-] (.+)$/gm,
        '<li class="ml-4 list-disc text-gray-300">$1</li>',
    );

    // Ordered lists
    html = html.replace(
        /^\d+\. (.+)$/gm,
        '<li class="ml-4 list-decimal text-gray-300">$1</li>',
    );

    // Line breaks
    html = html.replace(/\n/g, "<br>");

    return html;
}

// ==================== SIDEBAR TOGGLE ====================

window.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
};

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (
        !sidebar.classList.contains("-translate-x-full") &&
        window.innerWidth < 1024
    ) {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
    }
}
