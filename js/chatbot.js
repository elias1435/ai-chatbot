document.addEventListener("DOMContentLoaded", function () {
    const chatbotContainer = document.createElement("div");
    chatbotContainer.innerHTML = `
        <style>
		#chatHeader strong {
			color: #000;
			}
			#chatMessages a {
				color: #000;
				text-decoration: underline;
			}
			#chatContainer {
				transition: max-height 0.4s ease, opacity 0.4s ease;
				max-height: 0;
				opacity: 0;
				overflow: hidden;
			}
			#chatContainer.open {
				max-height: 500px;
				opacity: 1;
			}
			#chatHeader {
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 10px;
				border-bottom: 1px solid #ddd;
				background: #f7f7f7;
			}
			#chatHeader img {
				width: 85px;
				height: auto;
				border-radius: 0%;
				animation: float 2s ease-in-out infinite;
			}
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
            }
            .bot-label {
                display: inline-block;
                background: #0073aa;
                color: #fff;
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: bold;
                margin-right: 5px;
            }
            .dot-flashing {
                position: relative;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: #333;
                animation: dotFlashing 1s infinite linear alternate;
            }
            @keyframes dotFlashing {
                0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.2); }
                50% { box-shadow: 12px 0 0 0 rgba(0,0,0,0.5), 24px 0 0 0 rgba(0,0,0,0.2); }
                100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.2); }
            }
        </style>

        <button id="chatbotToggle" style="position: fixed; bottom: 20px; right: 20px; padding: 10px 15px; background: #000; color: white; border: 1px solid #fff; border-radius: 5px; cursor: pointer;">Ask Me Anything</button>

        <div id="chatContainer" style="position: fixed; bottom: 70px; right: 20px; width: 300px; border: 1px solid #ccc; border-radius: 5px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div id="chatHeader">
                <img src="/wp-content/uploads/2025/03/logo.webp" alt="AI Icon" />
                <strong>TBC AI</strong>
            </div>
            <div id="chatMessages" style="height: 250px; overflow-y: auto; padding: 10px;"></div>
            <form id="chatForm" style="display: flex; padding: 10px;">
                <input type="text" id="chatInput" placeholder="Type your message..." required style="flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
                <button type="submit" style="margin-left: 5px; padding: 5px 10px; background: #000; color: white; border: none; border-radius: 3px;">Send</button>
            </form>
            <div style="text-align: right; padding: 5px;">
                <button id="clearChat" style="background: none; border: none; color: #0073aa; cursor: pointer; font-size: 12px;">Clear Chat</button>
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

    // Restore state
    if (sessionStorage.getItem("chatOpen") === "true") {
        chatContainer.classList.add("open");
        chatbotToggle.textContent = "Close";
        botStarted = true;
    }

    const saved = sessionStorage.getItem("chatHistory");
    if (saved) {
        sessionMessages = JSON.parse(saved);
        sessionMessages.forEach(msg => addMessage(msg.text, msg.isHTML, msg.time, false));
    }

    const responses = {
        "service": "Check our services here: <a href='/digital-marketing/' target='_blank'>Digital Marketing</a>",
        "contact": "You can contact us at: info@thebrightclick.co.uk, 020 3131 2230 or visit <a href='/get-in-touch/' target='_blank'>this page</a>.",
        "advertise": "For Strategic Partnerships, contact info@thebrightclick.co.uk or visit <a href='/strategic-partnerships/' target='_blank'>this page</a>.",
        "partnerships": "For Strategic Partnerships, contact info@thebrightclick.co.uk or visit <a href='/strategic-partnerships/' target='_blank'>this page</a>."
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
        addMessage(`<span class="bot-label">TBC AI:</span> Chat cleared. To Start again Ask me 🙂`, true);
    });

    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        handleUserMessage();
    });

    function handleUserMessage() {
        const message = inputField.value.trim();
        if (!message) return;

        addMessage("You: " + message);
        console.log(`TBC AI Log: ${userName || "Unknown"} asked about "${message}"`);
        inputField.value = "";

        if (!userName) {
            const extractedName = extractName(message);
            if (extractedName) {
                userName = extractedName;
                sessionStorage.setItem("chatUserName", userName);
                addMessage(`<span class="bot-label">TBC AI:</span> Nice to meet you, ${userName}!`, true);
                setTimeout(() => addMessage(`<span class="bot-label">TBC AI:</span> How can I help you?`, true), 1000);
            } else {
                addMessage(`<span class="bot-label">TBC AI:</span> Sorry, I didn't catch your name. Can you say it again?`, true);
            }
            return;
        }

        let botResponse = null;
        for (let keyword in responses) {
            if (message.toLowerCase().includes(keyword)) {
                botResponse = `<span class="bot-label">TBC AI:</span> ${responses[keyword]}`;
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
                            addMessage(`<span class="bot-label">TBC AI:</span> ${data.data.response}`, true);
                        } else {
                            addMessage(`<span class="bot-label">TBC AI:</span> Sorry, something went wrong.`, true);
                        }
                    })
                    .catch(() => addMessage(`<span class="bot-label">TBC AI:</span> Sorry, something went wrong.`, true));
            });
        }
    }

    function startWelcomeSequence() {
        setTimeout(() => addMessage(`<span class="bot-label">TBC AI:</span> Hello, Welcome to The Bright Click`, true), 500);
        setTimeout(() => addMessage(`<span class="bot-label">TBC AI:</span> We can create beautiful leads and sales for your business`, true), 1500);
        setTimeout(() => addMessage(`<span class="bot-label">TBC AI:</span> My name is TBC AI.`, true), 2500);
        setTimeout(() => addMessage(`<span class="bot-label">TBC AI:</span> May I know your name?`, true), 3500);
    }

    function showTypingIndicator(callback) {
        const existingIndicator = document.getElementById("typingIndicator");
        if (existingIndicator) existingIndicator.remove();

        const typingDiv = document.createElement("div");
        typingDiv.id = "typingIndicator";
        typingDiv.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="bot-label">TBC AI:</span>
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
        messageDiv.style.padding = "5px";

        messageDiv.innerHTML = isHTML
            ? `${text}<div style="font-size:10px;color:#999;">${time}</div>`
            : `${escapeHTML(text)}<div style="font-size:10px;color:#999;">${time}</div>`;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (store) {
            sessionMessages.push({ text, isHTML, time });
            sessionStorage.setItem("chatHistory", JSON.stringify(sessionMessages));
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
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
