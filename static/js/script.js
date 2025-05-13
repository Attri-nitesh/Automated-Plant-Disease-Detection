// Main JavaScript for Plant Disease Detection System

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const selectButton = document.getElementById('select-button');
    const fileInfo = document.getElementById('file-info');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const removeButton = document.getElementById('remove-button');
    const uploadForm = document.getElementById('upload-form');
    const submitButton = document.getElementById('submit-button');
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');
    const floatingChatBtn = document.getElementById('floating-chat-btn');

    // Event listeners
    if (selectButton) {
        selectButton.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        dropArea.addEventListener('drop', handleDrop, false);
    }

    if (removeButton) {
        removeButton.addEventListener('click', removeFile);
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', handleSubmit);
    }

    if (floatingChatBtn) {
        floatingChatBtn.addEventListener('click', () => {
            if (window.openChatSidebar) {
                window.openChatSidebar();
            }
        });
    }

    // Functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            fileInput.files = files;
            handleFileSelect();
        }
    }

    function handleFileSelect() {
        if (!fileInput.files.length) return;
        
        const file = fileInput.files[0];
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, etc.)');
            return;
        }
        
        // Update file info
        fileInfo.textContent = file.name;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            dropArea.style.display = 'none';
            submitButton.disabled = false;
        };
        reader.readAsDataURL(file);
        
        // Hide any previous results
        resultContainer.style.display = 'none';
    }

    function removeFile() {
        fileInput.value = '';
        fileInfo.textContent = 'No file selected';
        previewContainer.style.display = 'none';
        dropArea.style.display = 'flex';
        submitButton.disabled = true;
        resultContainer.style.display = 'none';
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        if (!fileInput.files.length) return;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Detecting...';
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            // Display results
            resultContent.innerHTML = `
                <div class="result-item">
                    <h3>Detection Result:</h3>
                    <p class="result-text">${data}</p>
                    
                    <div class="care-tips">
                        <h4>Care Tips:</h4>
                        <ul>
                            ${getCareTips(data)}
                        </ul>
                    </div>
                </div>
            `;
            
            resultContainer.style.display = 'block';
            submitButton.textContent = 'Detect Disease';
            submitButton.disabled = false;
            
            // Scroll to results
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error:', error);
            resultContent.innerHTML = `<p class="error">Error detecting disease. Please try again.</p>`;
            resultContainer.style.display = 'block';
            submitButton.textContent = 'Detect Disease';
            submitButton.disabled = false;
        });
    }

    function getCareTips(result) {
        switch(result) {
            case 'Healthy':
                return `
                    <li>Continue regular watering and feeding schedule</li>
                    <li>Maintain good air circulation around plants</li>
                    <li>Monitor for any changes in leaf color or texture</li>
                    <li>Apply preventative treatments during high-risk weather</li>
                `;
            case 'Powdery':
                return `
                    <li>Improve air circulation around plants</li>
                    <li>Avoid overhead watering to keep leaves dry</li>
                    <li>Remove and destroy infected leaves</li>
                    <li>Apply fungicide treatments as recommended</li>
                    <li>Avoid excessive nitrogen fertilization</li>
                `;
            case 'Rust':
                return `
                    <li>Remove and destroy infected plant material</li>
                    <li>Improve air circulation around plants</li>
                    <li>Avoid wetting leaves when watering</li>
                    <li>Apply appropriate fungicide as directed</li>
                    <li>Plant resistant varieties in the future</li>
                `;
            default:
                return `<li>Consult with a plant specialist for specific care instructions</li>`;
        }
    }
}); 