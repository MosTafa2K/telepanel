// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

// Expand to full height
tg.expand();

// Main function to load user data
function loadUserData() {
    try {
        // Get user data from Telegram
        const user = tg.initDataUnsafe?.user;
        
        if (!user) {
            showError("Unable to load user data. Please make sure you're using this app from Telegram.");
            return;
        }
        
        // Update UI with user data
        updateProfileUI(user);
        
        // Set theme colors
        applyTheme();
        
        // Ready button (shows main button)
        tg.MainButton.setText("View Full Profile");
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
            shareProfile(user);
        });
        
    } catch (error) {
        console.error("Error loading user data:", error);
        showError("Failed to load profile data. Please try again.");
    }
}

// Update profile UI with user data
function updateProfileUI(user) {
    // Update text fields
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    document.getElementById('fullName').textContent = fullName || 'No Name';
    document.getElementById('username').textContent = user.username ? `@${user.username}` : '@no_username';
    document.getElementById('userId').textContent = user.id;
    document.getElementById('firstName').textContent = firstName || 'Not set';
    document.getElementById('lastName').textContent = lastName || 'Not set';
    document.getElementById('usernameField').textContent = user.username ? `@${user.username}` : 'Not set';
    document.getElementById('languageCode').textContent = user.language_code || 'en';
    
    // Premium status
    const isPremium = user.is_premium || false;
    const premiumBadge = document.getElementById('premiumBadge');
    const premiumValue = document.getElementById('isPremium');
    
    if (isPremium) {
        premiumBadge.classList.add('premium');
        premiumValue.textContent = '✅ Yes';
        premiumValue.style.color = '#f5a623';
    } else {
        premiumValue.textContent = '❌ No';
    }
    
    // Load profile photo if available
    loadProfilePhoto(user.id);
    
    // Show success message
    tg.showPopup({
        title: 'Welcome!',
        message: `Hello ${firstName}! Your profile has been loaded.`,
        buttons: [{ type: 'ok' }]
    });
}

// Load profile photo
function loadProfilePhoto(userId) {
    // Note: Direct photo access via WebApp is limited
    // You would need a backend endpoint to get the photo URL
    // For demo, we'll show a default avatar with user's initials
    
    const firstName = document.getElementById('firstName').textContent;
    const avatarImg = document.getElementById('avatar');
    
    // Create a colored avatar with initials
    const initials = firstName.charAt(0).toUpperCase() || 'U';
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    
    // Generate consistent color based on user ID
    const hue = (userId * 137) % 360;
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, canvas.width/2, canvas.height/2);
    
    avatarImg.src = canvas.toDataURL();
}

// Apply Telegram theme colors
function applyTheme() {
    const theme = tg.themeParams;
    
    // CSS variables are already applied by Telegram WebApp script
    // We just need to ensure body background uses the theme
    document.body.style.backgroundColor = tg.backgroundColor;
    document.body.style.color = tg.textColor;
}

// Share profile function
function shareProfile(user) {
    const profileText = `📱 My Telegram Profile\n\n` +
                       `Name: ${user.first_name || ''} ${user.last_name || ''}\n` +
                       `Username: @${user.username || 'no_username'}\n` +
                       `ID: ${user.id}\n` +
                       `Premium: ${user.is_premium ? 'Yes ⭐' : 'No'}`;
    
    tg.showPopup({
        title: 'Share Profile',
        message: 'Do you want to share your profile?',
        buttons: [
            { type: 'default', text: 'Share', id: 'share' },
            { type: 'cancel', text: 'Cancel' }
        ]
    }, (buttonId) => {
        if (buttonId === 'share') {
            tg.sendData(JSON.stringify({
                action: 'share_profile',
                data: profileText
            }));
            
            tg.showAlert('Profile shared successfully!');
        }
    });
}

// Show error message
function showError(message) {
    tg.showAlert(message);
    document.getElementById('fullName').textContent = 'Error';
    document.getElementById('username').textContent = 'Failed to load';
}

// Close app
document.getElementById('closeBtn').addEventListener('click', () => {
    tg.close();
});

// Share button
document.getElementById('shareBtn').addEventListener('click', () => {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        shareProfile(user);
    } else {
        tg.showAlert('No profile data available');
    }
});

// Handle back button
tg.BackButton.onClick(() => {
    tg.close();
});

// Enable back button
tg.BackButton.show();

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    
    // Send ready event
    tg.ready();
});

// Handle viewport changes
window.addEventListener('resize', () => {
    tg.expand();
});