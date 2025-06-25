document.addEventListener("DOMContentLoaded", function () {
    const chatbotContainer = document.createElement("div");
    chatbotContainer.innerHTML = `
        <button id="chatbotToggle">${chatbotAjax.toggle_button}</button>

        <div id="chatContainer">
            <div id="chatHeader">
                <img src="${chatbotAjax.chat_logo}" alt="${chatbotAjax.bot_name}" />
                <strong>${chatbotAjax.bot_name}</strong>
            </div>
            <div id="chatMessages"></div>
            <form id="chatForm">
                <input type="text" id="chatInput" placeholder="Type your message..." required>
                <button type="submit">${chatbotAjax.send_button}</button>
            </form>
            <div>
                <button id="clearChat">Clear Chat</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatbotContainer);

    const chatForm = document.getElementById("chatForm");
    const inputField = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    const chatContainer = document.getElementById("chatContainer");
    const chatbotToggle = document.getElementById("chatbotToggle");
    const clearChatBtn = document.getElementById("clearChat");

    let userName = sessionStorage.getItem("chatUserName") || "";
    let botStarted = false;
    let sessionMessages = [];

    if (sessionStorage.getItem("chatOpen") === "true") {
        chatContainer.classList.add("open");
        chatbotToggle.textContent = "Close";
        botStarted = true;
    }

	const saved = sessionStorage.getItem("chatHistory");
	if (saved) {
		sessionMessages = JSON.parse(saved);
		sessionMessages.forEach(msg => addMessage(msg.text, msg.isHTML, msg.time, false));

		// re-show default prompts if userName is already saved
		if (sessionStorage.getItem("chatUserName")) {
			renderDefaultPrompts();
		}
	}

	const responses = {
		"contact": `You can contact us at: <a href="mailto:${chatbotAjax.contact_email}">${chatbotAjax.contact_email}</a>, ${chatbotAjax.contact_number}`
	};


    chatbotToggle.addEventListener("click", function () {
        chatContainer.classList.toggle("open");
        const isOpen = chatContainer.classList.contains("open");
        chatbotToggle.textContent = isOpen ? "Close" : "Ask Me Anything";
        sessionStorage.setItem("chatOpen", isOpen);

        if (isOpen && !botStarted) {
            botStarted = true;
            startWelcomeSequence();
        }
    });

    clearChatBtn.addEventListener("click", function () {
        chatMessages.innerHTML = "";
        userName = "";
        sessionMessages = [];
        sessionStorage.clear();
        addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> Chat cleared. To Start again Ask me 🙂`, true);
    });

    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        handleUserMessage();
    });

    function handleUserMessage() {
        const message = inputField.value.trim();
        if (!message) return;

        addMessage("You: " + message);
        inputField.value = "";

		if (!userName) {
			const extractedName = extractName(message);
			if (extractedName) {
				userName = extractedName;
				sessionStorage.setItem("chatUserName", userName);

				addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> ${chatbotAjax.greeting_after_name}, ${userName}!`, true);
				setTimeout(() => addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> ${chatbotAjax.assist_offer}`, true), 1000);
				setTimeout(() => renderDefaultPrompts(), 2000);
			} else {
				addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> ${chatbotAjax.name_retry}`, true);
			}
			return;
		}
		

        let botResponse = null;
        for (let keyword in responses) {
            if (message.toLowerCase().includes(keyword)) {
                botResponse = `<span class="bot-label">${chatbotAjax.bot_name}:</span> ${responses[keyword]}`;
                break;
            }
        }

        if (botResponse) {
            addMessage(botResponse, true);
        } else {
            showTypingIndicator(() => {
                fetch(chatbotAjax.ajaxurl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `action=chatbot_search_query&message=${encodeURIComponent(message)}`
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> ${data.data.response}`, true);
                        } else {
                            addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> Sorry, something went wrong.`, true);
                        }
                    })
                    .catch(() => addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> Sorry, something went wrong.`, true));
            });
        }
    }

    function startWelcomeSequence() {
        setTimeout(() => addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> ${chatbotAjax.welcome_msg_1} to ${chatbotAjax.blog_name}`, true), 500);
		
		if (chatbotAjax.welcome_msg_2) {
			setTimeout(() => addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> ${chatbotAjax.welcome_msg_2}`, true), 1500);
		}
		
		setTimeout(() => addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> ${chatbotAjax.welcome_msg_3} ${chatbotAjax.bot_name}.`, true), 2500);
		setTimeout(() => addMessage(`<span class="bot-label">${chatbotAjax.bot_name}:</span> ${chatbotAjax.welcome_msg_4}`, true), 3500);
    }

    function showTypingIndicator(callback) {
        const existingIndicator = document.getElementById("typingIndicator");
        if (existingIndicator) existingIndicator.remove();

        const typingDiv = document.createElement("div");
        typingDiv.id = "typingIndicator";
        typingDiv.innerHTML = `
            <div class="typing-wrap">
                <span class="bot-label">${chatbotAjax.bot_name}:</span>
                <span class="dot-flashing"></span>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            typingDiv.remove();
            callback();
        }, 1000);
    }

    function addMessage(text, isHTML = false, timestamp = null, store = true) {
        const time = timestamp || new Date().toLocaleString();
        const messageDiv = document.createElement("div");
        messageDiv.className = "chat-message";
        messageDiv.innerHTML = isHTML
            ? `${text}<div class="timestamp">${time}</div>`
            : `${escapeHTML(text)}<div class="timestamp">${time}</div>`;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (store) {
            sessionMessages.push({ text, isHTML, time });
            sessionStorage.setItem("chatHistory", JSON.stringify(sessionMessages));
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"]|'/g, match => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[match]);
    }

    function extractName(input) {
        input = input.toLowerCase();
        if (input.includes("my name is")) {
            return capitalize(input.split("my name is")[1].trim().split(" ")[0]);
        }
        if (input.split(" ").length === 1) {
            return capitalize(input);
        }
        return null;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});

// when the chat opens
function renderDefaultPrompts() {
    if (!chatbotAjax.predefined_prompts || !Array.isArray(chatbotAjax.predefined_prompts)) return;
    if (document.querySelector(".prompt-header")) return; // already rendered

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="prompt-header">💡 Suggested Topics:</div>`;

    chatbotAjax.predefined_prompts.forEach((item, index) => {
        const acc = document.createElement("div");
        acc.classList.add("prompt-item");
        acc.innerHTML = `
            <button class="prompt-toggle">${item.title}</button>
            <div class="prompt-content" style="display: none;">${item.content}</div>
        `;
        acc.querySelector(".prompt-toggle").addEventListener("click", function () {
            const content = acc.querySelector(".prompt-content");
            content.style.display = content.style.display === "none" ? "block" : "none";
        });
        wrapper.appendChild(acc);
    });

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

