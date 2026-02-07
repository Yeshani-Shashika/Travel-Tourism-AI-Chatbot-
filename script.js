const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");

const API_KEY = "AIzaSyDngUGCo4mYEjGotAQovLbemkD5XfvVh0M";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const userData = {
    message:null,
    file:{
        data: null,
        mime_type: null
    }
}

const initialInputHeight = messageInput.scrollHeight;
const SIMPLE_QUESTIONS = {
    "hi": [
        "Hello! How can I help you with your travel plans today?",
        "Hi there! Ready for an adventure?",
        "Hey! What trails are you exploring today?",
        "Greetings fellow traveler! How can I assist?",
        "Hello adventurer! Need some trail tips?"
    ],
    "hello": [
        "Hi there! Ready for an adventure?",
        "Hello! Planning any travels soon?",
        "Hey trekker! How can I help?",
        "Greetings! Got any outdoor plans?",
        "Hi! Looking for traveling recommendations?"
    ],
    "what is your name": [
        "I'm TrekBuddy, your traveling assistant!",
        "They call me TrekBuddy - your trail guide!",
        "I'm TrekBuddy, ready to help with your outdoor adventures!",
        "Name's TrekBuddy - your personal traveling expert!",
        "I go by TrekBuddy, your digital traveling companion!"
    ],
    "who are you": [
        "I'm TrekBuddy, your personal guide for all things traveling!",
        "Your virtual traveling assistant, at your service!",
        "I'm your outdoor adventure helper - TrekBuddy!",
        "Think of me as your digital trail guide - TrekBuddy!",
        "I'm TrekBuddy, here to make your travels more enjoyable!"
    ],
    "help": [
        "I can help with: \n- Trail recommendations\n- Gear advice\n- Weather conditions\n- Safety tips\nAsk me anything!",
        "Need help with:\n- Finding trails\n- Packing lists\n- Navigation\n- First aid\nJust ask!",
        "I specialize in:\n- Hiking routes\n- Equipment tips\n- Trail conditions\n- Outdoor safety\nWhat do you need?",
        "I can assist with:\n- Route planning\n- Gear selection\n- Weather prep\n- Emergency info\nHow can I help?",
        "My expertise includes:\n- Trail suggestions\n- Packing guides\n- Terrain advice\n- Survival tips\nWhat's your question?"
    ],
    "thanks": [
        "You're welcome! Happy trekking!",
        "My pleasure! Enjoy the trails!",
        "No problem! Stay safe out there!",
        "Anytime! Happy traveling!",
        "Glad to help! Have a great adventure!"
    ],
    "thank you": [
        "My pleasure! Let me know if you need anything else.",
        "You're welcome! Safe travels!",
        "Happy to help! Enjoy your travel!",
        "Any time! Don't hesitate to ask more!",
        "Of course! Have a wonderful trek!"
    ],
    "bye": [
        "Goodbye! Stay safe on the trails!",
        "See you later! Happy traveling!",
        "Farewell! Enjoy your outdoor adventures!",
        "Bye for now! Watch your step out there!",
        "Until next time! Keep exploring!"
    ],
    "goodbye": [
        "See you later! Remember to pack water and snacks!",
        "Goodbye! Don't forget your traveling poles!",
        "Bye! Check the weather before you go!",
        "Farewell! Tell me about your travel next time!",
        "See you! Always leave no trace!"
    ]
};

const questionCounts = {};

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const getSimpleResponse = (message) => {
    const normalizedMessage = message.toLowerCase().trim();
    
    for (const [question, answers] of Object.entries(SIMPLE_QUESTIONS)) {
        //if (normalizedMessage.includes(question.toLowerCase())) {
        const regex = new RegExp(`\\b${question.toLowerCase()}\\b`);
        if (regex.test(normalizedMessage)) {
            if (questionCounts[question]  === undefined ) {
                questionCounts[question] = 0;
            } 
                const responseIndex = questionCounts[question];
                questionCounts[question] = (questionCounts[question] + 1) % answers.length;
            
                return answers[responseIndex];
            
        }
    }
    return null;
}

const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    const userMessage = userData.message;

    const simpleResponse = getSimpleResponse(userMessage);
    if (simpleResponse) {
        setTimeout(() => {
            messageElement.innerText = simpleResponse;
            incomingMessageDiv.classList.remove("thinking");
            chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});
        }, 600);
        return;
    }

    const requestOptions = {
        method:"POST",
        headers:{ "Content-Type": "application/json" },
        body: JSON.stringify({
            contents:[{
                parts: [{ text: userData.message }, ...(userData.file.data ? [{inline_data: userData.file}] : 
                [])]
            }]
        })
    }
    try{
        const respose = await fetch(API_URL, requestOptions);
        const data = await respose.json();
        if(!respose.ok) throw new Error(data.error.message);

        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;
    }catch(error){
        console.log(error);
    }finally{
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});
    }
}

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));

    const messageContent = `<div class="message-text"></div>
                            ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});

    setTimeout(() => {
        const messageContent = ` <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z">                        
        </path>
    </svg>
    <div class="message-text">
        <div class="thinking-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});
        generateBotResponse(incomingMessageDiv);

    }, 600);
}

messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e);
    }
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];


        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        fileInput.value = "";
    }
    reader.readAsDataURL(file);

});

fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");

});

const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewposition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker"){
            document.body.classList.toggle("show-emoji-picker");
        }else{
            document.body.classList.remove("show-emoji-picker");
        }
    }
});

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click",(e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());