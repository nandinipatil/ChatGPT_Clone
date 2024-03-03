const chatInput=document.querySelector("#chat-input");
const sendButton=document.querySelector("#send-btn"); //The querySelector() method returns the first element that matches a CSS selector. To return all matches (not only the first)
const chatContainer=document.querySelector(".chat-container");
const themeButton=document.querySelector("#theme-btn");
const deleteButton=document.querySelector("#delete-btn");

let userText=null;
const API_KEY="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"

const initialHeight=chatInput.scrollHeight;

const loaddatafromstorage=()=>{
    const themeColor=localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor=="light_mode");
    themeButton.innerText=document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText= `<div class="default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br>Your chat history will be displayed here.</p>
                        </div>`

    chatContainer.innerHTML=localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0,chatContainer.scrollHeight);//to scroll down page automatically on new big msg
}
 
loaddatafromstorage();

const createElement=(html,className)=>{
    //create new div and apply chat,specified class and set html content of div
    const chatDiv=document.createElement("div");
    chatDiv.classList.add("chat",className);
    chatDiv.innerHTML=html;
    return chatDiv;
}

const getChatResponse=async(incomingChatDiv)=>{
    const API_URL="https://api.openai.com/v1/completions";
    const pElement=document.createElement("p");
//properties & data for API request
    const requestOptions={
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
        model: "gpt-3.5-turbo-instruct",
        prompt: userText,
        max_tokens: 2048,
        temperature: 0.2,
        n: 1,
        stop: null
    })
}
//send POST req to api, get response and set response as paragrath element text
    try{
        const response=await (await fetch(API_URL, requestOptions)).json();
        //console.log(response);
        pElement.textContent=response.choices[0].text.trim();
    }catch(error)
    {
        //console.log(error);
        pElement.classList.add("error");
        pElement.textContent="Oops! Something went wrong while retrieving the response. Please try again."
    }
    //remove typing animation, append para element and save chat to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);//to scroll down page automatically on new big msg
    localStorage.setItem("all-chats",chatContainer.innerHTML);
}
const copyResponse=(copyBtn)=>{
    const responseTextElement =copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent="done";
    setTimeout(()=>copyBtn.textContent="content_copy",1000);
}
const showTypingAnimation=()=>{
    const html=`<div class="chat-content">
    <div class="chat-details">
        <img src="images/chatbot.jpg" alt="chatbot-img">
        <div class="typing-animation">
            <div class="typing-dot" style="--delay:0.2s"></div>
            <div class="typing-dot" style="--delay:0.3s"></div>
            <div class="typing-dot" style="--delay:0.4s"></div>
        </div>
    </div>
    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
</div>`;
const incomingChatDiv=createElement(html,"incoming"); //create incoming chat div with user msg & append it to chat container
chatContainer.appendChild(incomingChatDiv);
getChatResponse(incomingChatDiv);
}

const handleOutgoingChat=()=>{
    userText=chatInput.value.trim();
    
    //console.log(userText);
    chatInput.value=""; //blank txtarea
    chatInput.style.height=`${initialHeight}px`; //once msg is sent make it blank and reset to orginal height
    if(!userText) return; //if chat ip empty then return
    const html=`<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.jpg" alt="user-img">
                            <p></p>
                    </div>
                </div>`;
    const outgoingChatDiv=createElement(html,"outgoing"); //create outgoing chat div with user msg & append it to chat container
    outgoingChatDiv.querySelector("p").textContent=userText;
    document.querySelector(".default-text")?.remove(); //when outgoing chat starts i.e user sends msg then if default text is present remove the defualt text
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);//to scroll down page automatically on new big msg
    setTimeout(showTypingAnimation,500);
}

themeButton.addEventListener("click",()=>{
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color",themeButton.innerText);
    themeButton.innerText=document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click",()=>{
    if(confirm("Are you sure you want to delete all the chats?")){
        localStorage.removeItem("all-chats");
        loaddatafromstorage();
    }
});



chatInput.addEventListener("input", ()=>{
    //adjust height of input field dynamically based on content
    chatInput.style.height=`${initialHeight}px`;
    chatInput.style.height=`${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e)=>{
    //if enter key is pressed without shift and window width is larger than 800 pixel then handle outgoing chat
    if(e.key==="Enter" && !e.shiftKey && window.innerWidth>800)
    {
        e.preventDefault();
        handleOutgoingChat();
    }
});

sendButton.addEventListener("click",handleOutgoingChat);