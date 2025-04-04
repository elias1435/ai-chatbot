document.addEventListener("DOMContentLoaded", function () {
    // Inject Chatbot HTML and Button into Footer
    const chatbotContainer = document.createElement("div");
    chatbotContainer.innerHTML = `
        <button id="chatbotToggle" style="position: fixed; bottom: 20px; right: 20px; padding: 10px 15px; background: #0073aa; color: white; border: none; border-radius: 5px; cursor: pointer;">I am Bot</button>
        <div id="chatContainer" style="display: none; position: fixed; bottom: 70px; right: 20px; width: 300px; border: 1px solid #ccc; border-radius: 5px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div id="chatMessages" style="height: 250px; overflow-y: auto; padding: 10px; border-bottom: 1px solid #ddd;"></div>
            <form id="chatForm" style="display: flex; padding: 10px;">
                <input type="text" id="chatInput" placeholder="Type your message..." required style="flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
                <button type="submit" style="margin-left: 5px; padding: 5px 10px; background: #0073aa; color: white; border: none; border-radius: 3px;">Send</button>
            </form>
        </div>
    `;
    document.body.appendChild(chatbotContainer);

    // Variables
    const chatForm = document.getElementById("chatForm");
    const inputField = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    const chatContainer = document.getElementById("chatContainer");
    const chatbotToggle = document.getElementById("chatbotToggle");

    let userName = "";
    let botStarted = false; // Track if the welcome message sequence has started

    // Predefined Responses
    const responses = {
        "service": "Check our services here: <a href='https://teddingtontown.co.uk/estate-agents/' target='_blank'>Estate Agents</a>",
        "contact": "You can contact us at: Daniel@TeddingtonTown.co.uk, 0981234567 or visit <a href='https://teddingtontown.co.uk/advertise-with-us/' target='_blank'>this page</a>.",
        "advertise": "For advertising, contact Daniel@TeddingtonTown.co.uk or visit <a href='https://teddingtontown.co.uk/advertise-with-us/' target='_blank'>this page</a>."
    };

    // Toggle Chatbot Visibility
    chatbotToggle.addEventListener("click", function () {
		const isHidden = chatContainer.style.display === "none";

		chatContainer.style.display = isHidden ? "block" : "none";
		chatbotToggle.textContent = isHidden ? "Close" : "I am Bot";

		if (isHidden && !botStarted) {
			botStarted = true;
			startWelcomeSequence();
		}
	});

	
	function showTypingIndicator(callback) {
		// Remove any existing typing indicators to prevent duplicates
		const existingIndicator = document.getElementById("typingIndicator");
		if (existingIndicator) {
			existingIndicator.remove();
		}

		// Create new typing indicator
		const typingDiv = document.createElement("div");
		typingDiv.id = "typingIndicator"; // Unique ID to prevent duplicates
		typingDiv.textContent = "Bot is typing...";
		typingDiv.style.fontStyle = "italic";
		chatMessages.appendChild(typingDiv);
		chatMessages.scrollTop = chatMessages.scrollHeight;

		setTimeout(() => {
			typingDiv.remove(); // Remove the indicator after the delay
			callback();
		}, 1000); // Typing delay (1s)
	}

	
	

    // Add Messages with Delay
    function addMessage(text, isHTML = false) {
        showTypingIndicator(() => {
            const messageDiv = document.createElement("div");
            messageDiv.style.padding = "5px";

            if (isHTML) {
                messageDiv.innerHTML = text;
            } else {
                messageDiv.textContent = text;
            }

            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // Extract Name Smartly
    function extractName(userInput) {
        userInput = userInput.toLowerCase();

        if (userInput.split(" ").length === 1) {
            return capitalizeFirstLetter(userInput);
        }

        if (userInput.includes("my name is")) {
            let nameParts = userInput.split("my name is");
            let name = nameParts[1].trim().split(" ")[0];
            return capitalizeFirstLetter(name);
        }

        return null;
    }

    // Capitalize first letter of name
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Handle User Messages
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
        let extractedName = extractName(message);
        if (extractedName) {
            userName = extractedName;
            addMessage(`Bot: Nice to meet you, ${userName}!`);
            setTimeout(() => {
                addMessage("Bot: How can I help you?");
            }, 1000);
        } else {
            addMessage("Bot: Sorry, I didn't catch your name. Can you say it again?");
        }
        return;
    }

    // Match keywords within message
    let botResponse = null;
    for (let keyword in responses) {
        if (message.toLowerCase().includes(keyword)) {
            botResponse = `Bot: ${responses[keyword]}`;
            break;
        }
    }

    if (botResponse) {
        addMessage(botResponse, true);
    } else {
        // If no predefined response, search WordPress posts/pages
        showTypingIndicator(() => {
            fetch(chatbotAjax.ajaxurl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `action=chatbot_search_query&message=${encodeURIComponent(message)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addMessage(`Bot: ${data.data.response}`, true);
                } else {
                    addMessage("Bot: Sorry, something went wrong.");
                }
            })
            .catch(() => addMessage("Bot: Sorry, something went wrong."));
        });
    }
}

    

    // Welcome Message Sequence
    function startWelcomeSequence() {
        setTimeout(() => addMessage("Bot: Hello, Welcome to Teddington, Middlesex, UK."), 500);
        setTimeout(() => addMessage("Bot: A local website for local people."), 1500);
        setTimeout(() => addMessage("Bot: My name is Bot."), 2500);
        setTimeout(() => addMessage("Bot: May I know your name?"), 3500);
    }
});
