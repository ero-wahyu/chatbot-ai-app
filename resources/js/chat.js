/**
 * NovaMind AI — Chat Module
 * Handles text, image, and audio messaging with persona-based Gemini AI
 */

// State
let currentChatId = null;
let currentPersona = "general";
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
const chatPersonaLabel = document.getElementById("chat-persona-label");
const headerPersonaIcon = document.getElementById("header-persona-icon");
const chatList = document.getElementById("chat-list");
const newChatBtn = document.getElementById("new-chat-btn");
const deleteChatBtn = document.getElementById("delete-chat-btn");
const personaSuggestions = document.getElementById("persona-suggestions");

// Config
const config = window.ChatConfig;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    renderChatList();
    setupEventListeners();
    autoResizeTextarea();
    renderPersonaSuggestions("general");
});

function setupEventListeners() {
    sendBtn.addEventListener("click", sendMessage);
    uploadBtn.addEventListener("click", () => imageInput.click());
    imageInput.addEventListener("change", handleImageSelect);
    removeImageBtn.addEventListener("click", removeImage);
    recordBtn.addEventListener("click", toggleRecording);
    newChatBtn.addEventListener("click", createNewChat);
    deleteChatBtn.addEventListener("click", deleteCurrentChat);

    // Persona cards
    document.querySelectorAll(".persona-card").forEach((card) => {
        card.addEventListener("click", () => {
            selectPersona(card.dataset.persona);
        });
    });
}

// ==================== PERSONA MANAGEMENT ====================

function selectPersona(personaKey) {
    currentPersona = personaKey;
    const persona = config.personas[personaKey];

    // Update card highlight
    document.querySelectorAll(".persona-card").forEach((card) => {
        if (card.dataset.persona === personaKey) {
            card.classList.add("ring-2", "ring-indigo-500/50", "bg-gray-800/60");
        } else {
            card.classList.remove("ring-2", "ring-indigo-500/50", "bg-gray-800/60");
        }
    });

    // Update header
    updateHeaderForPersona(personaKey);

    // Render suggestions
    renderPersonaSuggestions(personaKey);

    messageInput.focus();
}

function updateHeaderForPersona(personaKey) {
    const persona = config.personas[personaKey];
    if (!persona) return;

    chatTitle.textContent = persona.name;
    chatPersonaLabel.textContent = persona.description;
    headerPersonaIcon.textContent = persona.icon;
}

function renderPersonaSuggestions(personaKey) {
    const persona = config.personas[personaKey];
    if (!persona || !persona.suggestions) return;

    personaSuggestions.innerHTML = "";
    persona.suggestions.forEach((s) => {
        const btn = document.createElement("button");
        btn.className =
            "suggestion-btn px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl text-sm text-gray-300 transition-all duration-200 hover:border-indigo-500/30";
        btn.textContent = `${s.icon} ${s.label}`;
        btn.addEventListener("click", () => {
            messageInput.value = s.text;
            sendMessage();
        });
        personaSuggestions.appendChild(btn);
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
        formData.append("persona", currentPersona);
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
        if (data.persona) currentPersona = data.persona;
        chatTitle.textContent = data.chat_title;
        deleteChatBtn.classList.remove("hidden");

        appendMessage("assistant", data.message.content, "text");
        appendSmartRecommendations(data.message.content);
        updateChatList(data.chat_id, data.chat_title, data.persona);
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
        formData.append("persona", currentPersona);
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
        if (data.persona) currentPersona = data.persona;
        chatTitle.textContent = data.chat_title;
        deleteChatBtn.classList.remove("hidden");

        appendMessage("assistant", data.message.content, "text");
        appendSmartRecommendations(data.message.content);
        updateChatList(data.chat_id, data.chat_title, data.persona);
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
        formData.append("persona", currentPersona);
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
        if (data.persona) currentPersona = data.persona;
        chatTitle.textContent = data.chat_title;
        deleteChatBtn.classList.remove("hidden");

        appendMessage("assistant", data.message.content, "text");
        appendSmartRecommendations(data.message.content);
        updateChatList(data.chat_id, data.chat_title, data.persona);
    } catch (error) {
        appendError(error.message);
    } finally {
        setProcessing(false);
    }
}

// ==================== SMART RECOMMENDATIONS ====================

function appendSmartRecommendations(aiResponse) {
    const recommendations = generateRecommendations(aiResponse);
    if (!recommendations.length) return;

    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-wrap gap-2 ml-0 sm:ml-11 mt-2 max-w-full animate-fadeIn";

    recommendations.forEach((rec) => {
        const btn = document.createElement("button");
        btn.className =
            "recommendation-btn px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg text-xs text-indigo-300 hover:text-indigo-200 transition-all duration-200 whitespace-nowrap max-w-[calc(100%-1rem)] sm:max-w-none truncate";
        btn.textContent = `${rec.icon} ${rec.label}`;
        btn.title = rec.text;
        btn.addEventListener("click", () => {
            messageInput.value = rec.text;
            // Remove recommendations after click
            wrapper.remove();
            sendMessage();
        });
        wrapper.appendChild(btn);
    });

    messagesEl.appendChild(wrapper);
    scrollToBottom();
}

function generateRecommendations(response) {
    if (!response || response.length < 50) return [];

    const persona = config.personas[currentPersona];
    const recs = [];

    // Context-aware recommendations based on persona
    if (currentPersona === "education") {
        recs.push(
            { icon: "🔍", label: "Jelaskan lebih detail", text: "Bisakah kamu jelaskan bagian terakhir lebih detail lagi?" },
            { icon: "📝", label: "Berikan contoh soal", text: "Berikan contoh soal latihan dari materi yang baru dijelaskan" },
            { icon: "🧩", label: "Analogi lain", text: "Berikan analogi atau penjelasan dengan cara yang berbeda" },
        );
    } else if (currentPersona === "customer_service") {
        recs.push(
            { icon: "✅", label: "Masalah teratasi", text: "Terima kasih, masalah saya sudah teratasi" },
            { icon: "❓", label: "Pertanyaan lain", text: "Saya punya pertanyaan lain terkait layanan" },
            { icon: "📞", label: "Hubungi tim", text: "Saya ingin dihubungi oleh tim terkait" },
        );
    } else if (currentPersona === "travel") {
        recs.push(
            { icon: "💰", label: "Estimasi budget", text: "Berapa estimasi total biaya untuk rencana ini?" },
            { icon: "🏨", label: "Rekomendasi hotel", text: "Rekomendasikan hotel dengan harga terjangkau di lokasi tersebut" },
            { icon: "🗺️", label: "Alternatif destinasi", text: "Berikan alternatif destinasi wisata lainnya" },
        );
    } else if (currentPersona === "productivity") {
        recs.push(
            { icon: "📊", label: "Buat template", text: "Bisa dibuatkan template-nya dalam format yang siap pakai?" },
            { icon: "⚡", label: "Tips efisiensi", text: "Berikan tips untuk mengerjakan ini lebih efisien" },
            { icon: "📋", label: "Action items", text: "Buatkan daftar action items dari pembahasan ini" },
        );
    } else if (currentPersona === "health") {
        recs.push(
            { icon: "🥗", label: "Saran menu", text: "Berikan contoh menu sehari-hari berdasarkan saran tersebut" },
            { icon: "⚠️", label: "Hal yang dihindari", text: "Apa saja yang harus dihindari terkait topik ini?" },
            { icon: "📅", label: "Jadwal rutinitas", text: "Buatkan jadwal rutinitas harian berdasarkan saran tersebut" },
        );
    } else if (currentPersona === "hobby") {
        recs.push(
            { icon: "🔄", label: "Variasi lain", text: "Berikan variasi atau alternatif lainnya" },
            { icon: "📸", label: "Tips presentasi", text: "Berikan tips agar hasilnya terlihat lebih menarik" },
            { icon: "🛒", label: "Alat & bahan", text: "Apa saja alat dan bahan yang dibutuhkan?" },
        );
    } else {
        // General / NovaMind default
        recs.push(
            { icon: "🔍", label: "Lebih detail", text: "Jelaskan lebih detail tentang poin terakhir" },
            { icon: "💡", label: "Ide lanjutan", text: "Berikan ide lanjutan atau pengembangan dari topik ini" },
            { icon: "📋", label: "Rangkuman", text: "Buatkan rangkuman singkat dari pembahasan ini" },
        );
    }

    return recs;
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

    const persona = config.personas[currentPersona] || config.personas["general"];
    const personaIcon = persona.icon || "✨";

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
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 text-sm">
                    ${personaIcon}
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
        addChatListItem(chat.id, chat.title, chat.persona);
    });
}

function addChatListItem(id, title, persona) {
    // Remove existing item with same ID
    const existing = chatList.querySelector(`[data-chat-id="${id}"]`);
    if (existing) existing.remove();

    const personaConfig = config.personas[persona] || config.personas["general"];
    const icon = personaConfig ? personaConfig.icon : "💬";

    const item = document.createElement("button");
    item.className = `chat-list-item w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 truncate ${currentChatId === id ? "bg-gray-800/50 text-gray-200" : ""}`;
    item.dataset.chatId = id;
    item.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="flex-shrink-0 text-sm">${icon}</span>
            <span class="truncate">${escapeHtml(title)}</span>
        </div>
    `;
    item.addEventListener("click", () => loadChat(id, title, persona));
    chatList.prepend(item);
}

function updateChatList(chatId, title, persona) {
    addChatListItem(chatId, title, persona || currentPersona);
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

async function loadChat(chatId, title, persona) {
    if (isProcessing) return;

    currentChatId = chatId;
    currentPersona = persona || "general";
    chatTitle.textContent = title;
    deleteChatBtn.classList.remove("hidden");
    highlightActiveChat(chatId);
    updateHeaderForPersona(currentPersona);

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

        const data = await response.json();

        if (data.persona) {
            currentPersona = data.persona;
            updateHeaderForPersona(currentPersona);
        }

        const messages = data.messages || data;
        messages.forEach((msg) => {
            appendMessage(msg.role, msg.content, msg.type, msg.file_path || msg.file_url);
        });
    } catch (error) {
        appendError("Gagal memuat riwayat chat");
    }
}

async function createNewChat() {
    currentChatId = null;
    currentPersona = "general";
    chatTitle.textContent = "NovaMind AI";
    chatPersonaLabel.textContent = "Ignite Ideas with AI";
    headerPersonaIcon.textContent = "✨";
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
        // Re-select general persona
        selectPersona("general");
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
