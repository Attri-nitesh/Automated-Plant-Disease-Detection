// Chat Integration - Connects to the ChatSlider interface
document.addEventListener('DOMContentLoaded', function() {
  // Create a global function to handle chatbot queries
  window.handleChatbotQuery = function(query, learnMore = false) {
    // Initialize conversation history if it doesn't exist
    if (!window.conversationHistory) {
      window.conversationHistory = [
        {
          "role": "system",
          "content": "You are an expert plant pathologist AI assistant for a plant disease detection application. Your expertise is in diagnosing and treating plant diseases based on visual symptoms and user descriptions. Provide well-structured, evidence-based responses with a professional yet approachable tone. Use clear headings, concise explanations, and specific actionable advice. Each response should include: 1) Disease identification or confirmation, 2) Key scientific information, 3) Treatment recommendations, and 4) Prevention strategies. Use bullet points for clarity and organize information logically. Always maintain scientific accuracy while making information accessible to garden enthusiasts and agricultural professionals alike."
        }
      ];
    }
    
    // Add user message to conversation history
    window.conversationHistory.push({
      "role": "user",
      "content": query
    });
    
    // If 'learn more' is clicked, adjust the system prompt
    if (learnMore) {
      window.conversationHistory[0].content += " When the user requests to learn more, provide in-depth explanations, case studies, or examples related to plant diseases and their management. Focus on delivering comprehensive insights that enhance the user's understanding of the topic.";
    }
    
    // Keep only the last 10 messages to avoid token limits
    if (window.conversationHistory.length > 11) {
      // Always keep the system message at index 0
      window.conversationHistory = [
        window.conversationHistory[0],
        ...window.conversationHistory.slice(window.conversationHistory.length - 10)
      ];
    }
    
    // Show a typing indicator
    const loadingMessageId = showTypingIndicator();
    
    // Log what we're sending (for debugging)
    console.log("Sending to Google Gemini API via Flask backend:", {
      message: query,
      history: window.conversationHistory
    });
    
    // Call our Flask backend which will handle the Gemini API request
    fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "message": query,
        "history": window.conversationHistory
      })
    })
    .then(response => {
      // Log the response status for debugging
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(JSON.stringify(err));
        });
      }
      return response.json();
    })
    .then(data => {
      // Log the full response for debugging
      console.log("API response:", data);
      
      // Remove the typing indicator
      removeTypingIndicator(loadingMessageId);
      
      // Check if we got an error response from our backend
      if (data.error) {
        throw new Error(JSON.stringify(data));
      }
      
      // Get the AI response
      const aiResponse = data.response;
      
      // Process the response to ensure formatting appears correctly
      const formattedResponse = processAIResponse(aiResponse);
      
      // Add to conversation history
      window.conversationHistory.push({
        "role": "assistant",
        "content": aiResponse
      });
      
      // Add message to the chat slider interface
      if (window.addSliderMessage) {
        window.addSliderMessage(formattedResponse, false);
      }
    })
    .catch(error => {
      console.error('Error calling API:', error);
      
      // Remove the typing indicator
      removeTypingIndicator(loadingMessageId);
      
      // Add error message to the interface
      let errorMessage = "Sorry, I encountered an error contacting the AI. Please try again in a moment.";
      
      // Try to extract more specific error information
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error) {
          if (errorData.details) {
            errorMessage = `I'm having trouble right now: ${errorData.details}`;
          } else if (typeof errorData.error === 'string') {
            errorMessage = `I'm having trouble right now: ${errorData.error}`;
          }
        }
      } catch (e) {
        // If the error isn't in JSON format, use a more user-friendly message
        console.error('Error parsing error message:', e);
        errorMessage = "I'm having trouble connecting right now. Please try again shortly.";
      }
      
      // Display at most 150 characters of the error to keep it readable
      if (errorMessage.length > 150) {
        errorMessage = errorMessage.substring(0, 147) + "...";
      }
      
      if (window.addSliderMessage) {
        window.addSliderMessage(errorMessage, false);
      }
    });
  };
  
  // Process AI response to ensure proper formatting with markdown support
  function processAIResponse(text) {
    // Don't remove markdown formatting as our new UI supports it
    return text.trim();
  }
  
  // Function to show a typing indicator and return its ID
  function showTypingIndicator() {
    const typingIndicatorId = Date.now();
    
    // First hide the built-in typing indicator if our version is being used
    const builtInIndicator = document.getElementById('typingIndicator');
    if (builtInIndicator) {
      builtInIndicator.style.display = 'none';
    }
    
    // Add our own indicator as a message
    if (window.addSliderMessage) {
      const indicatorHtml = `
        <div class="typing-indicator-content">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message bot typing';
      messageDiv.setAttribute('data-id', typingIndicatorId);
      messageDiv.innerHTML = indicatorHtml;
      
      const chatMessages = document.getElementById('chatMessages');
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    return typingIndicatorId;
  }

  // Function to remove the typing indicator
  function removeTypingIndicator(indicatorId) {
    const typingIndicator = document.querySelector(`.message.typing[data-id="${indicatorId}"]`);
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Legacy function for backward compatibility
  function removeLoadingMessage() {
    const messages = document.querySelectorAll('.message.bot');
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.classList.contains('typing') || 
          (lastMessage.querySelector('div') && 
           lastMessage.querySelector('div').textContent === "Thinking about your question...")) {
        lastMessage.remove();
      }
    }
  }

  // Add styling for typing indicator content
  const style = document.createElement('style');
  style.textContent = `
    .typing-indicator-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    
    .typing-indicator-content span {
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: var(--text-secondary);
      border-radius: 50%;
      animation: typing 1.4s infinite both;
    }
    
    .typing-indicator-content span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-indicator-content span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 0.7; }
    }
  `;
  document.head.appendChild(style);
});