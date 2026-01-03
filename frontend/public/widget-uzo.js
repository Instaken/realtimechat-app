/**
 * ChatUZO Widget v1.0.0
 * Embed ChatUZO rooms into any website
 * 
 * Usage:
 * <script src="https://your-domain.com/widget-uzo.js" data-api-key="YOUR_API_KEY"></script>
 */
(function () {
    'use strict';

    // Configuration
    const script = document.currentScript;
    const apiKey = script.getAttribute('data-api-key');
    const position = script.getAttribute('data-position') || 'bottom-right'; // bottom-right, bottom-left, top-right, top-left
    const theme = script.getAttribute('data-theme') || 'auto'; // auto, light, dark
    const startOpen = script.getAttribute('data-start-open') === 'true';
    
    // Auto-detect base URL from script source
    const scriptUrl = new URL(script.src);
    const baseUrl = script.getAttribute('data-base-url') || `${scriptUrl.protocol}//${scriptUrl.host}`;

    // Validate API Key
    if (!apiKey) {
        console.error('[ChatUZO] Error: data-api-key attribute is required');
        return;
    }

    // Position styles
    const positions = {
        'bottom-right': 'bottom: 20px; right: 20px;',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;'
    };

    // Create widget container
    const container = document.createElement('div');
    container.id = 'chatuzo-widget-root';
    container.style.cssText = `
        position: fixed;
        ${positions[position] || positions['bottom-right']}
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'chatuzo-widget-iframe';
    iframe.src = `${baseUrl}/embed/${apiKey}`;
    iframe.allow = 'clipboard-write';
    iframe.style.cssText = `
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 100px);
        border: none;
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        display: ${startOpen ? 'block' : 'none'};
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: #fff;
    `;

    // Create toggle button
    const button = document.createElement('button');
    button.id = 'chatuzo-widget-button';
    button.setAttribute('aria-label', 'Toggle Chat');
    button.innerHTML = `
        <svg class="chat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7117 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.89999C9.87812 3.30493 11.1801 2.99656 12.5 2.99999H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg class="close-icon" style="display: none;" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    button.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        margin-top: ${startOpen ? '15px' : '0'};
    `;

    // Hover effect
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    });

    // Toggle functionality
    let isOpen = startOpen;
    button.onclick = () => {
        isOpen = !isOpen;
        iframe.style.display = isOpen ? 'block' : 'none';
        button.querySelector('.chat-icon').style.display = isOpen ? 'none' : 'block';
        button.querySelector('.close-icon').style.display = isOpen ? 'block' : 'none';
        button.style.marginTop = isOpen ? '15px' : '0';

        // Send message to iframe
        if (isOpen) {
            iframe.contentWindow.postMessage({ type: 'WIDGET_OPENED' }, '*');
        }
    };

    // Append elements
    container.appendChild(iframe);
    container.appendChild(button);

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(container);
        });
    } else {
        document.body.appendChild(container);
    }

    // Handle messages from iframe
    window.addEventListener('message', (event) => {
        // Verify origin for security
        if (event.origin !== baseUrl) return;

        const { type, data } = event.data;

        switch (type) {
            case 'RESIZE':
                if (data.height) {
                    iframe.style.height = `${Math.min(data.height, window.innerHeight - 100)}px`;
                }
                break;

            case 'CLOSE_WIDGET':
                isOpen = false;
                iframe.style.display = 'none';
                button.querySelector('.chat-icon').style.display = 'block';
                button.querySelector('.close-icon').style.display = 'none';
                button.style.marginTop = '0';
                break;

            case 'NEW_MESSAGE':
                // Show notification badge or play sound
                if (!isOpen) {
                    showNotificationBadge();
                }
                break;
        }
    });

    // Notification badge
    let badge = null;
    function showNotificationBadge() {
        if (!badge) {
            badge = document.createElement('div');
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #ef4444;
                border: 2px solid white;
                animation: pulse 2s infinite;
            `;
            button.appendChild(badge);

            // Add pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function hideNotificationBadge() {
        if (badge) {
            badge.remove();
            badge = null;
        }
    }

    // Hide badge when opened
    button.addEventListener('click', hideNotificationBadge);

    // Responsive adjustments
    function adjustForMobile() {
        if (window.innerWidth <= 480) {
            iframe.style.width = 'calc(100vw - 40px)';
            iframe.style.height = 'calc(100vh - 100px)';
            iframe.style.borderRadius = '12px';
        } else {
            iframe.style.width = '380px';
            iframe.style.height = '600px';
            iframe.style.borderRadius = '16px';
        }
    }

    window.addEventListener('resize', adjustForMobile);
    adjustForMobile();

    // Expose API for programmatic control
    window.ChatUZO = {
        open: () => {
            if (!isOpen) button.click();
        },
        close: () => {
            if (isOpen) button.click();
        },
        toggle: () => {
            button.click();
        },
        isOpen: () => isOpen
    };

    console.log('[ChatUZO] Widget initialized successfully');
})();