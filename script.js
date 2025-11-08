// PDF Tools Application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeFileUploads();
    initializeForms();
});

// Initialize file upload areas with drag and drop
function initializeFileUploads() {
    const uploadAreas = document.querySelectorAll('.file-upload-area');
    
    uploadAreas.forEach(area => {
        const fileInput = area.querySelector('input[type="file"]');
        if (!fileInput) return;
        
        // Drag and drop handlers
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            
            if (fileInput.multiple) {
                fileInput.files = e.dataTransfer.files;
            } else {
                fileInput.files = e.dataTransfer.files;
            }
            
            handleFileSelection(fileInput);
        });
        
        // File input change handler
        fileInput.addEventListener('change', () => {
            handleFileSelection(fileInput);
        });
        
        // Click on upload area to trigger file input
        area.addEventListener('click', (e) => {
            if (e.target !== fileInput && e.target.tagName !== 'LABEL') {
                fileInput.click();
            }
        });
    });
}

// Handle file selection and display
function handleFileSelection(fileInput) {
    const files = Array.from(fileInput.files);
    const fileListContainer = fileInput.closest('.file-upload-area').querySelector('#fileList');
    const fileInfoContainer = fileInput.closest('.file-upload-area').querySelector('#fileInfo');
    
    if (fileInput.multiple && fileListContainer) {
        displayFileList(files, fileListContainer);
    } else if (fileInfoContainer) {
        displayFileInfo(files[0], fileInfoContainer);
    }
}

// Display list of files
function displayFileList(files, container) {
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-item-info">
                <i class="fas fa-file-pdf"></i>
                <div>
                    <div class="file-item-name">${file.name}</div>
                    <div class="file-item-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="file-item-remove" onclick="removeFile(${index})">
                <i class="fas fa-times"></i> Remove
            </button>
        `;
        container.appendChild(fileItem);
    });
}

// Display single file info
function displayFileInfo(file, container) {
    if (!file) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <p><strong>File:</strong> ${file.name}</p>
        <p><strong>Size:</strong> ${formatFileSize(file.size)}</p>
        <p><strong>Type:</strong> ${file.type || 'application/pdf'}</p>
    `;
}

// Remove file from input
function removeFile(index) {
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput || !fileInput.multiple) return;
    
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    files.splice(index, 1);
    
    files.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
    
    handleFileSelection(fileInput);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize all forms
function initializeForms() {
    // Merge PDFs form
    const mergeForm = document.getElementById('mergeForm');
    if (mergeForm) {
        mergeForm.addEventListener('submit', handleMergeSubmit);
    }
    
    // Split PDF form
    const splitForm = document.getElementById('splitForm');
    if (splitForm) {
        splitForm.addEventListener('submit', handleSplitSubmit);
    }
    
    // Extract text form
    const extractTextForm = document.getElementById('extractTextForm');
    if (extractTextForm) {
        extractTextForm.addEventListener('submit', handleExtractTextSubmit);
    }
    
    // Rotate PDF form
    const rotateForm = document.getElementById('rotateForm');
    if (rotateForm) {
        rotateForm.addEventListener('submit', handleRotateSubmit);
    }
    
    // Compress PDF form
    const compressForm = document.getElementById('compressForm');
    if (compressForm) {
        compressForm.addEventListener('submit', handleCompressSubmit);
    }
    
    // Extract pages form
    const extractPagesForm = document.getElementById('extractPagesForm');
    if (extractPagesForm) {
        extractPagesForm.addEventListener('submit', handleExtractPagesSubmit);
    }
    
    // Images to PDF form
    const imagesToPdfForm = document.getElementById('imagesToPdfForm');
    if (imagesToPdfForm) {
        imagesToPdfForm.addEventListener('submit', handleImagesToPdfSubmit);
    }
}

// Handle merge PDFs form submission
async function handleMergeSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const submitButton = form.querySelector('.submit-button');
    
    const files = formData.getAll('files');
    if (files.length < 2) {
        showError('Please select at least 2 PDF files to merge');
        return;
    }
    
    showLoading(loading, submitButton);
    
    try {
        const response = await fetch('/merge', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            downloadFile(blob, 'merged.pdf');
            showSuccess('PDFs merged successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to merge PDFs');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        hideLoading(loading, submitButton);
    }
}

// Handle split PDF form submission
async function handleSplitSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const submitButton = form.querySelector('.submit-button');
    
    showLoading(loading, submitButton);
    
    try {
        const response = await fetch('/split', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            downloadFile(blob, 'split_pages.zip');
            showSuccess('PDF split successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to split PDF');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        hideLoading(loading, submitButton);
    }
}

// Handle extract text form submission
async function handleExtractTextSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const submitButton = form.querySelector('.submit-button');
    const resultContainer = document.getElementById('resultContainer');
    
    showLoading(loading, submitButton);
    
    try {
        const response = await fetch('/extract-text', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            displayExtractedText(data.text, resultContainer);
            showSuccess('Text extracted successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to extract text');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        hideLoading(loading, submitButton);
    }
}

// Handle rotate PDF form submission
async function handleRotateSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const submitButton = form.querySelector('.submit-button');
    
    showLoading(loading, submitButton);
    
    try {
        const response = await fetch('/rotate', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            downloadFile(blob, 'rotated.pdf');
            showSuccess('PDF rotated successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to rotate PDF');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        hideLoading(loading, submitButton);
    }
}

// Handle compress PDF form submission
async function handleCompressSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const submitButton = form.querySelector('.submit-button');
    
    showLoading(loading, submitButton);
    
    try {
        const response = await fetch('/compress', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            downloadFile(blob, 'compressed.pdf');
            showSuccess('PDF compressed successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to compress PDF');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        hideLoading(loading, submitButton);
    }
}

// Handle extract pages form submission
async function handleExtractPagesSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const submitButton = form.querySelector('.submit-button');
    
    const pages = formData.get('pages');
    if (!pages || pages.trim() === '') {
        showError('Please specify pages to extract (e.g., 1,3,5-7)');
        return;
    }
    
    showLoading(loading, submitButton);
    
    try {
        const response = await fetch('/extract-pages', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            downloadFile(blob, 'extracted_pages.pdf');
            showSuccess('Pages extracted successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to extract pages');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        hideLoading(loading, submitButton);
    }
}

// Handle images to PDF form submission
async function handleImagesToPdfSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const submitButton = form.querySelector('.submit-button');
    
    const files = formData.getAll('files');
    if (files.length === 0) {
        showError('Please select at least one image file');
        return;
    }
    
    showLoading(loading, submitButton);
    
    try {
        const response = await fetch('/images-to-pdf', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            downloadFile(blob, 'images_to_pdf.pdf');
            showSuccess('PDF created from images successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to create PDF from images');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        hideLoading(loading, submitButton);
    }
}

// Display extracted text
function displayExtractedText(text, container) {
    if (!container) return;
    
    container.innerHTML = `
        <h3><i class="fas fa-check-circle"></i> Extracted Text</h3>
        <div class="result-text">${escapeHtml(text)}</div>
    `;
    container.style.display = 'block';
}

// Download file
function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Show loading state
function showLoading(loadingElement, submitButton) {
    if (loadingElement) loadingElement.style.display = 'block';
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.6';
    }
}

// Hide loading state
function hideLoading(loadingElement, submitButton) {
    if (loadingElement) loadingElement.style.display = 'none';
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${escapeHtml(message)}`;
    
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.insertBefore(errorDiv, formContainer.firstChild);
    }
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${escapeHtml(message)}`;
    
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.insertBefore(successDiv, formContainer.firstChild);
    }
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

