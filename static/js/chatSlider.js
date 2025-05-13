// Chat slider functionality
document.addEventListener('DOMContentLoaded', function() {
  // Create and inject the chat slider elements
  const createChatSlider = () => {
    // Create the chat toggle button
    const chatToggle = document.createElement('button');
    chatToggle.id = 'chatToggle';
    chatToggle.className = 'chat-toggle';
    chatToggle.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="chat-toggle-text">CHAT</span>
    `;
    
    // Create the chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbotContainer';
    chatbotContainer.className = 'chatbot-container';
    
    // Populate the chatbot container
    chatbotContainer.innerHTML = `
      <!-- Resize handle -->
      <div class="resize-handle" id="resizeHandle"></div>
      
      <!-- Width indicator -->
      <div class="width-indicator" id="widthIndicator">380px</div>
      
      <!-- Width control buttons -->
      <div class="width-controls">
        <button class="width-btn" id="widthIncrease" title="Increase width">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
        <button class="width-btn" id="widthDecrease" title="Decrease width">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
        <button class="width-btn" id="widthReset" title="Reset width">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
        </button>
      </div>
      
      <div class="chat-header">
        <div class="chat-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <div>
            <h3>Plant Expert</h3>
            <div class="status-indicator">
              <span class="status-dot"></span>
              <span>AI Assistant</span>
            </div>
          </div>
        </div>
        <div class="chat-controls">
          <button class="chat-control-btn" id="toggleSize" title="Toggle full width">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
          <button class="chat-control-btn" id="closeChat" title="Close chat" onclick="document.getElementById('chatbotContainer').classList.remove('open');">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="chat-messages" id="chatMessages">
        <div class="message bot">
          <div>
            <p>👋 <strong>Welcome to Plant Expert</strong></p>
            <p>I'm your personal plant disease assistant. I can help you with:</p>
            <ul style="margin: 8px 0 10px 20px; padding-left: 0;">
              <li>Identifying plant diseases based on symptoms</li>
              <li>Providing treatment recommendations</li>
              <li>Suggesting prevention strategies</li>
              <li>Answering questions about plant health</li>
            </ul>
            <p>If you've already analyzed an image, I can explain the diagnosis in detail. How can I assist you today?</p>
          </div>
          <div class="message-time">Just now</div>
        </div>
      </div>
      
      <div id="typingIndicator" class="typing-indicator" style="display: none;">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <div class="chat-input-container">
        <div class="chat-actions">
          <button class="action-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
          </button>
          <button class="action-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
        <div class="chat-input-wrapper">
          <input type="text" class="chat-input" placeholder="Type your message..." id="chatSliderInput">
          <button class="chat-submit" id="sendMessage">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Append elements to the body
    document.body.appendChild(chatToggle);
    document.body.appendChild(chatbotContainer);
  };
  
  // Initialize the chat slider
  createChatSlider();
  
  // Get elements
  const chatToggle = document.getElementById('chatToggle');
  const chatbotContainer = document.getElementById('chatbotContainer');
  const closeChat = document.getElementById('closeChat');
  const chatSliderInput = document.getElementById('chatSliderInput');
  const sendMessage = document.getElementById('sendMessage');
  const chatMessages = document.getElementById('chatMessages');
  const resizeHandle = document.getElementById('resizeHandle');
  const widthIndicator = document.getElementById('widthIndicator');
  const widthIncrease = document.getElementById('widthIncrease');
  const widthDecrease = document.getElementById('widthDecrease');
  const widthReset = document.getElementById('widthReset');
  const toggleSize = document.getElementById('toggleSize');
  const typingIndicator = document.getElementById('typingIndicator');
  
  // Constants for resizing
  const DEFAULT_WIDTH = 380;
  const MIN_WIDTH = 300;
  const MAX_WIDTH = 800;
  const WIDTH_STEP = 50;
  let isResizing = false;
  let lastWidth = DEFAULT_WIDTH;
  let lastFullWidth = null;
  
  // Open chat
  chatToggle.addEventListener('click', () => {
    chatbotContainer.classList.add('open');
    
    // Add animated entrance for messages only if not already animated
    if (!window.chatAnimatedBefore) {
      const messages = chatMessages.querySelectorAll('.message');
      messages.forEach((msg, index) => {
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          msg.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          msg.style.opacity = '1';
          msg.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
      });
      
      // Mark as animated so we don't repeat the animation
      window.chatAnimatedBefore = true;
    }
    
    setTimeout(() => {
      chatSliderInput.focus();
    }, 300);
  });
  
  // Set up a global function to open the slider from other parts of the app
  window.openChatSlider = function(disease) {
    // First restore user's preferred width if it was set
    if (lastWidth !== DEFAULT_WIDTH) {
      chatbotContainer.style.width = `${lastWidth}px`;
    }
    
    // Then open the slider
    chatbotContainer.classList.add('open');
    
    // If disease is provided, create a message about it
    if (disease) {
      // Reset animation flag to ensure new messages animate properly
      window.chatAnimatedBefore = true;
      
      // First add a user message
      addMessage(`Tell me more about ${disease} plant disease.`, true);
      
      // Simulate typing
      setTimeout(() => {
        addMessage(`I'll provide information about ${disease} plant disease. Let me get that for you...`, false);
        
        // Try to use the existing chatbot functionality if available
        if (window.handleChatbotQuery) {
          window.handleChatbotQuery(`Tell me about ${disease} plant disease, including causes, symptoms, prevention, and treatment methods.`);
        }
      }, 500);
    }
    
    setTimeout(() => {
      chatSliderInput.focus();
    }, 300);
  };
  
  // Close chat - both event listener and a global function
  if (closeChat) {
    closeChat.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Close button clicked");
      chatbotContainer.classList.remove('open');
      
      // Reset width to default when closing if it was resized
      if (lastWidth !== DEFAULT_WIDTH) {
        // Save current width for next open
        const currentWidth = lastWidth;
        
        // After the closing animation completes, reset width
        setTimeout(() => {
          chatbotContainer.style.width = `${DEFAULT_WIDTH}px`;
          lastWidth = currentWidth; // Keep track of user's last width
        }, 400); // Match transition time
      }
    });
  }
  
  // Add a global close function as a backup
  window.closeChatSlider = function() {
    chatbotContainer.classList.remove('open');
    
    // Reset width to default when closing if it was resized
    if (lastWidth !== DEFAULT_WIDTH) {
      // Save current width for next open
      const currentWidth = lastWidth;
      
      // After the closing animation completes, reset width
      setTimeout(() => {
        chatbotContainer.style.width = `${DEFAULT_WIDTH}px`;
        lastWidth = currentWidth; // Keep track of user's last width
      }, 400); // Match transition time
    }
  };
  
  // Update width indicator
  function updateWidthIndicator(width) {
    widthIndicator.textContent = `${width}px`;
    widthIndicator.classList.add('show');
    
    // Hide indicator after a delay
    clearTimeout(window.widthIndicatorTimeout);
    window.widthIndicatorTimeout = setTimeout(() => {
      widthIndicator.classList.remove('show');
    }, 1500);
  }
  
  // Resize functionality
  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    resizeHandle.classList.add('active');
    document.documentElement.style.cursor = 'ew-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });
  
  function handleMouseMove(e) {
    if (!isResizing) return;
    
    // Calculate new width based on mouse position
    const containerRect = chatbotContainer.getBoundingClientRect();
    const newWidth = document.documentElement.clientWidth - e.clientX;
    
    // Apply constraints
    const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
    
    // Use requestAnimationFrame for smoother resizing
    requestAnimationFrame(() => {
      // Apply new width
      chatbotContainer.style.width = `${clampedWidth}px`;
      lastWidth = clampedWidth;
      
      // Update width indicator
      updateWidthIndicator(clampedWidth);
    });
    
    // Prevent text selection during resize
    e.preventDefault();
  }
  
  function handleMouseUp() {
    isResizing = false;
    resizeHandle.classList.remove('active');
    document.documentElement.style.cursor = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  // Width control buttons
  widthIncrease.addEventListener('click', () => {
    const currentWidth = parseInt(getComputedStyle(chatbotContainer).width);
    const newWidth = Math.min(currentWidth + WIDTH_STEP, MAX_WIDTH);
    chatbotContainer.style.width = `${newWidth}px`;
    updateWidthIndicator(newWidth);
    lastWidth = newWidth;
  });
  
  widthDecrease.addEventListener('click', () => {
    const currentWidth = parseInt(getComputedStyle(chatbotContainer).width);
    const newWidth = Math.max(currentWidth - WIDTH_STEP, MIN_WIDTH);
    chatbotContainer.style.width = `${newWidth}px`;
    updateWidthIndicator(newWidth);
    lastWidth = newWidth;
  });
  
  widthReset.addEventListener('click', () => {
    chatbotContainer.style.width = `${DEFAULT_WIDTH}px`;
    updateWidthIndicator(DEFAULT_WIDTH);
    lastWidth = DEFAULT_WIDTH;
  });
  
  // Toggle full width
  toggleSize.addEventListener('click', () => {
    const currentWidth = parseInt(getComputedStyle(chatbotContainer).width);
    
    if (currentWidth < MAX_WIDTH) {
      // Save current width before going full
      lastFullWidth = currentWidth;
      chatbotContainer.style.width = `${MAX_WIDTH}px`;
      updateWidthIndicator(MAX_WIDTH);
    } else {
      // Restore previous width
      const widthToRestore = lastFullWidth || DEFAULT_WIDTH;
      chatbotContainer.style.width = `${widthToRestore}px`;
      updateWidthIndicator(widthToRestore);
      lastWidth = widthToRestore;
      lastFullWidth = null;
    }
  });
  
  // Send message functionality - integrated with existing chatbot
  function addMessage(content, isUser) {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const timeString = `${hours}:${minutes} ${ampm}`;
    
    // Create container div with proper classes
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    // Set initial style for animation, using translateZ for crisp text
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px) translateZ(0)';
    
    // Create content div
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Process message content differently based on sender
    if (!isUser) {
      // For bot messages, support basic formatting
      // Simple replacements for markdown
      let formattedContent = content;
      
      // Bold text
      formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Italic text
      formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Create paragraphs
      let paragraphs = formattedContent.split('\n\n');
      let htmlContent = '';
      
      for (let para of paragraphs) {
        para = para.trim();
        if (para.length === 0) continue;
        
        // Check if it's a list item
        if (para.match(/^\s*-\s+/)) {
          // Convert to list if it has bullet points
          const listItems = para.split('\n');
          htmlContent += '<ul style="margin: 8px 0 8px 20px; padding-left: 0;">';
          
          for (let item of listItems) {
            item = item.trim();
            if (item.startsWith('- ')) {
              item = item.substring(2);
            }
            if (item.length > 0) {
              htmlContent += `<li>${item}</li>`;
            }
          }
          
          htmlContent += '</ul>';
        } else {
          // Regular paragraph
          htmlContent += `<p>${para}</p>`;
        }
      }
      
      // Fallback if no content
      if (htmlContent.trim() === '') {
        htmlContent = `<p>${content}</p>`;
      }
      
      contentDiv.innerHTML = htmlContent;
    } else {
      // For user messages, use simple text content wrapped in paragraph
      contentDiv.innerHTML = `<p>${content}</p>`;
    }
    
    // Add the content to the message div
    messageDiv.appendChild(contentDiv);
    
    // Add timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = timeString;
    messageDiv.appendChild(timeDiv);
    
    // Add to chat
    chatMessages.appendChild(messageDiv);
    
    // Force a reflow before animating to prevent rendering issues
    void messageDiv.offsetWidth;
    
    // Scroll to the new message
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Animate in with requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      requestAnimationFrame(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0) translateZ(0)';
      });
    });
  }
  
  // Expose addMessage function for the integration
  window.addSliderMessage = addMessage;
  
  // Show typing indicator
  function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Hide typing indicator
  function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
  }
  
  function handleSendMessage() {
    const message = chatSliderInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    chatSliderInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Use global chatbot handler if available
    if (window.handleChatbotQuery) {
      window.handleChatbotQuery(message);
    } else {
      // Simple fallback response
      setTimeout(() => {
        hideTypingIndicator();
        addMessage("I've received your message. Our plant diagnosis system is analyzing your query.", false);
      }, 1500);
    }
  }
  
  sendMessage.addEventListener('click', handleSendMessage);
  
  chatSliderInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
  
  // Ensure closeChat button works
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'closeChat' || e.target.closest('#closeChat'))) {
      e.preventDefault();
      e.stopPropagation();
      chatbotContainer.classList.remove('open');
      
      // Reset width to default when closing if it was resized
      if (lastWidth !== DEFAULT_WIDTH) {
        // Save current width for next open
        const currentWidth = lastWidth;
        
        // After the closing animation completes, reset width
        setTimeout(() => {
          chatbotContainer.style.width = `${DEFAULT_WIDTH}px`;
          lastWidth = currentWidth; // Keep track of user's last width
        }, 400); // Match transition time
      }
    }
  });
}); 