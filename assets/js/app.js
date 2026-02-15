// Birthday Surprise Website - Main Application
// Created by IKER

// Initialize
let surprises = JSON.parse(localStorage.getItem('birthdaySurprises') || '{}');
let currentMediaData = null;
let currentSurpriseId = null;
const ADMIN_PASSWORD = 'king';

// Initialize based on URL parameters
window.addEventListener('load', () => {
    createSparkles();
    createHearts();

    const urlParams = new URLSearchParams(window.location.search);
    const surpriseId = urlParams.get('id');
    const mode = urlParams.get('mode');
    const revealToken = urlParams.get('reveal');
    const adminPass = urlParams.get('admin');

    // Hide admin button on contribution and reveal links
    const adminBtn = document.getElementById('adminLoginBtn');
    
    if (surpriseId && surprises[surpriseId]) {
        // Direct admin access with password in URL
        if (adminPass === ADMIN_PASSWORD) {
            directAdminAccess(surpriseId);
        } else if (mode === 'contribute') {
            adminBtn.style.display = 'none'; // Hide admin button
            showContributeSection(surpriseId);
        } else if (revealToken) {
            adminBtn.style.display = 'none'; // Hide admin button
            // Validate reveal token
            const surprise = surprises[surpriseId];
            if (surprise.revealLinks && surprise.revealLinks.includes(revealToken)) {
                showRevealSection(surpriseId);
            } else {
                alert('Invalid or expired reveal link!');
                window.location.href = window.location.pathname;
            }
        }
    }
});

// Setup form submission
document.getElementById('setupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const surpriseId = 'surprise_' + Date.now();
    const surprise = {
        id: surpriseId,
        birthdayPerson: document.getElementById('birthdayPersonName').value,
        organizer: document.getElementById('organizerName').value,
        contributions: [],
        revealLinks: [],
        createdAt: new Date().toISOString()
    };

    surprises[surpriseId] = surprise;
    localStorage.setItem('birthdaySurprises', JSON.stringify(surprises));

    // Store current surprise ID globally
    currentSurpriseId = surpriseId;

    // Generate initial reveal link
    const initialRevealId = 'reveal_' + Date.now();
    surprise.revealLinks.push(initialRevealId);
    localStorage.setItem('birthdaySurprises', JSON.stringify(surprises));

    // Generate links
    const baseUrl = window.location.origin + window.location.pathname;
    document.getElementById('contributionLink').value = `${baseUrl}?id=${surpriseId}&mode=contribute`;
    document.getElementById('revealLink').value = `${baseUrl}?id=${surpriseId}&reveal=${initialRevealId}`;
    document.getElementById('adminLink').value = `${baseUrl}?id=${surpriseId}&admin=${ADMIN_PASSWORD}`;

    // Populate edit name field
    document.getElementById('editBirthdayName').value = surprise.birthdayPerson;

    document.getElementById('linksDisplay').classList.remove('hidden');
    this.reset();
});

// Direct admin access with password in URL
function directAdminAccess(surpriseId) {
    // Hide all other sections
    document.getElementById('setupSection').classList.add('hidden');
    document.getElementById('contributeSection').classList.remove('active');
    document.getElementById('revealSection').classList.remove('active');
    document.getElementById('messagesContainer').classList.remove('active');
    
    // Show admin section
    document.getElementById('adminSection').classList.remove('hidden');
    
    // Hide login form, show video upload screen directly
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('adminVideoUploadScreen').classList.remove('hidden');
    
    // Hide admin login button
    document.getElementById('adminLoginBtn').style.display = 'none';
    
    // Set current admin surprise ID
    window.currentAdminSurpriseId = surpriseId;
    currentSurpriseId = surpriseId;
    
    // Load existing media if any
    const surprise = surprises[surpriseId];
    if (surprise.mediaFiles && surprise.mediaFiles.length > 0) {
        uploadedMediaFiles = [...surprise.mediaFiles];
        displayUploadedMedia();
        document.getElementById('saveMediaBtn').style.display = 'block';
    }
}

// Show contribute section
function showContributeSection(surpriseId) {
    document.getElementById('setupSection').classList.add('hidden');
    const contributeSection = document.getElementById('contributeSection');
    contributeSection.classList.add('active');
    
    const surprise = surprises[surpriseId];
    document.getElementById('displayBirthdayName').textContent = `🎂 For ${surprise.birthdayPerson} 🎂`;
    
    document.getElementById('contributeForm').onsubmit = function(e) {
        e.preventDefault();
        
        const contribution = {
            id: Date.now(),
            name: document.getElementById('contributorName').value,
            message: document.getElementById('birthdayMessage').value,
            timestamp: new Date().toISOString()
        };

        surprises[surpriseId].contributions.push(contribution);
        localStorage.setItem('birthdaySurprises', JSON.stringify(surprises));

        const successDiv = document.getElementById('contributionSuccess');
        successDiv.className = 'success-msg';
        successDiv.innerHTML = '🎉 Your birthday wish has been added! Thank you! 🎉';

        this.reset();
    };
}

// Show reveal section
function showRevealSection(surpriseId) {
    document.getElementById('setupSection').classList.add('hidden');
    document.getElementById('revealSection').classList.add('active');
    
    window.currentSurpriseId = surpriseId;
}

// Reveal surprise
function revealSurprise(isYes) {
    if (!isYes) {
        alert("Come back on your birthday! 🎂");
        return;
    }

    const surpriseId = window.currentSurpriseId;
    const surprise = surprises[surpriseId];
    
    document.getElementById('revealSection').classList.remove('active');
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.classList.add('active');
    
    document.getElementById('revealBirthdayName').textContent = `Dear ${surprise.birthdayPerson}! 🎉`;
    
    const messagesList = document.getElementById('messagesList');
    
    // Show surprise button with contributor names
    let content = '';
    
    if (surprise.contributions.length > 0) {
        const contributorNames = surprise.contributions.map(c => c.name);
        content = `
            <div class="contributors-showcase">
                <h2 style="text-align: center; color: var(--purple); font-size: 2.5rem; margin-bottom: 20px;">
                    💝 Special Wishes From 💝
                </h2>
                <div class="contributors-grid">
                    ${contributorNames.map((name, index) => `
                        <div class="contributor-name-card" style="animation-delay: ${index * 0.1}s;">
                            <span class="contributor-emoji">🎉</span>
                            <span class="contributor-name">${name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="surprise-btn-container">
                    <button class="btn-surprise" onclick="startCountdown()">
                        🎁 CLICK FOR YOUR SURPRISE! 🎁
                    </button>
                </div>
            </div>
        `;
    } else {
        content = '<p style="text-align: center; color: #666; margin-top: 30px;">No messages yet! Check back later!</p>';
    }

    messagesList.innerHTML = content;
}

// Start countdown before showing surprise
function startCountdown() {
    let count = 5;
    
    // Create countdown overlay
    const overlay = document.createElement('div');
    overlay.className = 'countdown-overlay';
    overlay.innerHTML = `
        <div class="countdown-number" id="countdownNumber">${count}</div>
        <div class="countdown-text">Get ready for your surprise! 🎉</div>
    `;
    document.body.appendChild(overlay);
    
    const countdownNumber = document.getElementById('countdownNumber');
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count;
            countdownNumber.style.animation = 'none';
            setTimeout(() => {
                countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
            }, 10);
        } else {
            clearInterval(interval);
            overlay.remove();
            showSurpriseContent();
        }
    }, 1000);
}

// Show surprise content (media and messages)
function showSurpriseContent() {
    const surpriseId = window.currentSurpriseId;
    const surprise = surprises[surpriseId];
    
    const messagesList = document.getElementById('messagesList');
    let content = '';

    // Show media (videos and photos) if they exist
    if (surprise.mediaFiles && surprise.mediaFiles.length > 0) {
        content += `
            <div class="video-player-fullscreen" id="videoPlayerFullscreen">
                <div class="video-container-fullscreen">
                    <div id="mediaSlideshow"></div>
                    <button class="close-video-btn" onclick="closeVideoPlayer()">
                        ✕ Continue to Messages
                    </button>
                </div>
            </div>
        `;
        
        messagesList.innerHTML = content;
        
        // Start media slideshow
        setTimeout(() => {
            startMediaSlideshow(surprise.mediaFiles);
        }, 100);
    } else {
        // No media, go straight to messages
        showMessages();
    }
}

// Start media slideshow
let currentMediaIndex = 0;

function startMediaSlideshow(mediaFiles) {
    const slideshow = document.getElementById('mediaSlideshow');
    if (!slideshow || !mediaFiles || mediaFiles.length === 0) return;
    
    showMediaItem(mediaFiles, 0, slideshow);
}

function showMediaItem(mediaFiles, index, container) {
    if (index >= mediaFiles.length) {
        // All media shown, close and show messages
        closeVideoPlayer();
        showMessages();
        return;
    }
    
    const media = mediaFiles[index];
    
    if (media.type === 'video') {
        container.innerHTML = `
            <video id="currentMedia" controls autoplay playsinline style="width: 100%; max-width: 100%; height: auto; border-radius: 20px;">
                <source src="${media.data}" type="video/mp4">
            </video>
        `;
        
        const video = document.getElementById('currentMedia');
        video.addEventListener('ended', () => {
            showMediaItem(mediaFiles, index + 1, container);
        });
        
        video.play().catch(err => console.log('Autoplay prevented:', err));
    } else {
        container.innerHTML = `
            <img id="currentMedia" src="${media.data}" style="width: 100%; max-width: 100%; height: auto; border-radius: 20px;">
        `;
        
        // Show image for 5 seconds
        setTimeout(() => {
            showMediaItem(mediaFiles, index + 1, container);
        }, 5000);
    }
}

// Show messages when button clicked
function showMessages() {
    document.getElementById('contributorsShowcase').style.display = 'none';
    document.getElementById('messagesSection').style.display = 'block';
    
    // Smooth scroll to messages
    document.getElementById('messagesSection').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Close video player
function closeVideoPlayer() {
    const videoPlayerFullscreen = document.getElementById('videoPlayerFullscreen');
    if (videoPlayerFullscreen) {
        videoPlayerFullscreen.style.display = 'none';
    }
}

// Admin login
function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('adminLogin').classList.add('hidden');
        document.getElementById('adminVideoUploadScreen').classList.remove('hidden');
        
        // Load existing media if any
        const surpriseId = window.currentAdminSurpriseId;
        if (surpriseId && surprises[surpriseId]) {
            const surprise = surprises[surpriseId];
            if (surprise.mediaFiles && surprise.mediaFiles.length > 0) {
                uploadedMediaFiles = [...surprise.mediaFiles];
                displayUploadedMedia();
                document.getElementById('saveMediaBtn').style.display = 'block';
            }
        }
    } else {
        alert('Incorrect password!');
    }
}

// Load admin dashboard
function loadAdminDashboard() {
    const surpriseId = window.currentAdminSurpriseId;
    const surprise = surprises[surpriseId];
    
    // Stats
    const statsDisplay = document.getElementById('statsDisplay');
    statsDisplay.innerHTML = `
        <div class="stat-box">
            <div class="stat-number">${surprise.contributions.length}</div>
            <div class="stat-label">Total Wishes</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">${surprise.birthdayPerson}</div>
            <div class="stat-label">Birthday Star</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">${surprise.mediaFiles ? surprise.mediaFiles.length : 0}</div>
            <div class="stat-label">Media Files</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">${surprise.revealLinks ? surprise.revealLinks.length : 0}</div>
            <div class="stat-label">Reveal Links</div>
        </div>
    `;

    // Set current surprise for editing
    currentSurpriseId = surpriseId;
    document.getElementById('editBirthdayName').value = surprise.birthdayPerson;

    // Show existing media in dashboard if available
    if (surprise.mediaFiles && surprise.mediaFiles.length > 0) {
        uploadedMediaFilesDashboard = [...surprise.mediaFiles];
        displayUploadedMediaDashboard();
    } else {
        uploadedMediaFilesDashboard = [];
        document.getElementById('uploadedMediaListDashboard').innerHTML = '';
        document.getElementById('saveMediaBtnDashboard').style.display = 'none';
    }

    // Messages
    const adminMessagesList = document.getElementById('adminMessagesList');
    if (surprise.contributions.length === 0) {
        adminMessagesList.innerHTML = '<p style="text-align: center; color: #666;">No contributions yet!</p>';
        return;
    }

    adminMessagesList.innerHTML = surprise.contributions.map(contribution => `
        <div class="message-card">
            <h3>💝 From ${contribution.name}</h3>
            <p>${contribution.message}</p>
            <p style="font-size: 0.85rem; color: #999;">Submitted: ${new Date(contribution.timestamp).toLocaleString()}</p>
        </div>
    `).join('');
}

// Admin logout
function adminLogout() {
    document.getElementById('adminLogin').classList.remove('hidden');
    document.getElementById('adminVideoUploadScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminLoginBtn').style.display = 'block';
    uploadedMediaFiles = [];
    uploadedMediaFilesDashboard = [];
    
    // Reset media upload displays
    document.getElementById('uploadedMediaList').innerHTML = '';
    document.getElementById('saveMediaBtn').style.display = 'none';
    document.getElementById('uploadedMediaListDashboard').innerHTML = '';
    document.getElementById('saveMediaBtnDashboard').style.display = 'none';
}

// Handle admin video upload
let currentAdminVideo = null;
let uploadedMediaFiles = [];

// Setup drag and drop
window.addEventListener('load', () => {
    setupDragAndDrop('dragDropZone', 'adminMediaUpload');
    setupDragAndDrop('dragDropZoneDashboard', 'adminMediaUploadDashboard');
});

function setupDragAndDrop(zoneId, inputId) {
    const dragZone = document.getElementById(zoneId);
    if (dragZone) {
        dragZone.addEventListener('click', () => {
            document.getElementById(inputId).click();
        });

        dragZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dragZone.classList.add('drag-over');
        });

        dragZone.addEventListener('dragleave', () => {
            dragZone.classList.remove('drag-over');
        });

        dragZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dragZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            
            // Trigger appropriate handler based on which zone
            if (zoneId === 'dragDropZone') {
                handleAdminMediaUpload({ target: { files } });
            } else {
                handleAdminMediaUploadDashboard({ target: { files } });
            }
        });
    }
}

function handleAdminMediaUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        // Check file size
        if (file.size > 50 * 1024 * 1024) {
            alert(`${file.name} is too large! Maximum size is 50MB.`);
            return;
        }

        // Check file type
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            alert(`${file.name} is not a valid file type. Please upload images or videos.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaItem = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: isVideo ? 'video' : 'image',
                data: e.target.result
            };

            uploadedMediaFiles.push(mediaItem);
            displayUploadedMedia();
            document.getElementById('saveMediaBtn').style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

function displayUploadedMedia() {
    const container = document.getElementById('uploadedMediaList');
    container.innerHTML = uploadedMediaFiles.map(media => `
        <div class="media-item">
            ${media.type === 'video' 
                ? `<video src="${media.data}"></video>`
                : `<img src="${media.data}" alt="${media.name}">`
            }
            <div class="media-item-overlay">
                ${media.type === 'video' ? '🎥 Video' : '📸 Photo'}
            </div>
            <button class="media-item-remove" onclick="removeMediaItem('${media.id}')" title="Remove">
                ×
            </button>
        </div>
    `).join('');
}

function removeMediaItem(id) {
    uploadedMediaFiles = uploadedMediaFiles.filter(item => item.id != id);
    displayUploadedMedia();
    
    if (uploadedMediaFiles.length === 0) {
        document.getElementById('saveMediaBtn').style.display = 'none';
    }
}

// Save admin media
function saveAdminMedia() {
    const surpriseId = window.currentAdminSurpriseId;
    if (!surpriseId || uploadedMediaFiles.length === 0) return;

    surprises[surpriseId].mediaFiles = uploadedMediaFiles;
    localStorage.setItem('birthdaySurprises', JSON.stringify(surprises));
    
    alert(`🎉 ${uploadedMediaFiles.length} file(s) saved successfully!`);
    
    // Proceed to full dashboard
    proceedToFullDashboard();
}

// Skip to full dashboard without saving
function skipToFullDashboard() {
    proceedToFullDashboard();
}

// Proceed to full dashboard
function proceedToFullDashboard() {
    document.getElementById('adminVideoUploadScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    loadAdminDashboard();
}

// Dashboard-specific upload handlers
let uploadedMediaFilesDashboard = [];

function handleAdminMediaUploadDashboard(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        if (file.size > 50 * 1024 * 1024) {
            alert(`${file.name} is too large! Maximum size is 50MB.`);
            return;
        }

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            alert(`${file.name} is not a valid file type. Please upload images or videos.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaItem = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: isVideo ? 'video' : 'image',
                data: e.target.result
            };

            uploadedMediaFilesDashboard.push(mediaItem);
            displayUploadedMediaDashboard();
            document.getElementById('saveMediaBtnDashboard').style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

function displayUploadedMediaDashboard() {
    const container = document.getElementById('uploadedMediaListDashboard');
    container.innerHTML = uploadedMediaFilesDashboard.map(media => `
        <div class="media-item">
            ${media.type === 'video' 
                ? `<video src="${media.data}"></video>`
                : `<img src="${media.data}" alt="${media.name}">`
            }
            <div class="media-item-overlay">
                ${media.type === 'video' ? '🎥 Video' : '📸 Photo'}
            </div>
            <button class="media-item-remove" onclick="removeMediaItemDashboard('${media.id}')" title="Remove">
                ×
            </button>
        </div>
    `).join('');
}

function removeMediaItemDashboard(id) {
    uploadedMediaFilesDashboard = uploadedMediaFilesDashboard.filter(item => item.id != id);
    displayUploadedMediaDashboard();
    
    if (uploadedMediaFilesDashboard.length === 0) {
        document.getElementById('saveMediaBtnDashboard').style.display = 'none';
    }
}

function saveAdminMediaDashboard() {
    const surpriseId = window.currentAdminSurpriseId;
    if (!surpriseId || uploadedMediaFilesDashboard.length === 0) return;

    // Merge with existing media
    const existingMedia = surprises[surpriseId].mediaFiles || [];
    surprises[surpriseId].mediaFiles = [...existingMedia, ...uploadedMediaFilesDashboard];
    localStorage.setItem('birthdaySurprises', JSON.stringify(surprises));
    
    alert(`🎉 ${uploadedMediaFilesDashboard.length} file(s) saved successfully!`);
    uploadedMediaFilesDashboard = [];
    loadAdminDashboard(); // Refresh dashboard
}

// Open admin login
function openAdminLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const surpriseId = urlParams.get('id');
    
    if (!surpriseId) {
        alert('Please access this page through a surprise link first!');
        return;
    }

    // Check if this is contribution or reveal link
    const mode = urlParams.get('mode');
    const revealToken = urlParams.get('reveal');
    
    if (mode === 'contribute' || revealToken) {
        alert('Admin access is not available on this link. Please use the admin link provided when you created the surprise.');
        return;
    }

    // Prompt for password
    const password = prompt('Enter admin password:');
    
    if (password === ADMIN_PASSWORD) {
        // Redirect to admin panel link
        const baseUrl = window.location.origin + window.location.pathname;
        const adminUrl = `${baseUrl}?id=${surpriseId}&admin=${ADMIN_PASSWORD}`;
        window.location.href = adminUrl;
    } else if (password !== null) {
        // User entered wrong password (not cancelled)
        alert('Incorrect password!');
    }
}

// Copy link function
function copyLink(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    document.execCommand('copy');
    alert('Link copied! 🎉 Share it now!');
}

// Share on WhatsApp
function shareOnWhatsApp(linkInputId) {
    const link = document.getElementById(linkInputId).value;
    const surprise = surprises[currentSurpriseId];
    
    let message = '';
    if (linkInputId === 'contributionLink') {
        message = `🎉 You're invited to contribute to ${surprise.birthdayPerson}'s birthday surprise! Add your birthday wish here: ${link}`;
    } else if (linkInputId === 'revealLink') {
        message = `🎂 Happy Birthday ${surprise.birthdayPerson}! 🎉 Your friends have a special surprise for you! Click here: ${link}`;
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Update birthday person's name
function updateBirthdayName() {
    if (!currentSurpriseId) {
        alert('Please create a surprise first!');
        return;
    }

    const newName = document.getElementById('editBirthdayName').value.trim();
    if (!newName) {
        alert('Please enter a name!');
        return;
    }

    surprises[currentSurpriseId].birthdayPerson = newName;
    localStorage.setItem('birthdaySurprises', JSON.stringify(surprises));
    
    alert('✅ Birthday person\'s name updated to: ' + newName);
}

// Regenerate reveal link
function regenerateRevealLink() {
    if (!currentSurpriseId) {
        alert('Please create a surprise first!');
        return;
    }

    const newRevealId = 'reveal_' + Date.now();
    surprises[currentSurpriseId].revealLinks.push(newRevealId);
    localStorage.setItem('birthdaySurprises', JSON.stringify(surprises));

    const baseUrl = window.location.origin + window.location.pathname;
    const newRevealLink = `${baseUrl}?id=${currentSurpriseId}&reveal=${newRevealId}`;
    
    document.getElementById('revealLink').value = newRevealLink;
    
    alert('🎉 New reveal link generated! Old links are still valid.');
}

// Create sparkles
function createSparkles() {
    const container = document.getElementById('sparkles');
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(sparkle);
    }
}

// Create floating hearts
function createHearts() {
    const container = document.getElementById('sparkles');
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = '❤️';
        heart.style.left = Math.random() * 100 + '%';
        container.appendChild(heart);
        
        setTimeout(() => heart.remove(), 8000);
    }, 2000);
}
