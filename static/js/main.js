document.addEventListener('DOMContentLoaded', () => {
    // Dark mode toggle
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
            // Save preference
            fetch('/api/auth/users/me/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ preferences: { dark_mode: isDark } })
            });
        });
    }

    // File upload handling
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            fetch('/api/documents/upload/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'X-CSRFToken': getCSRFToken()
                },
                body: formData
            }).then(response => response.json())
              .then(data => {
                  if (data.url) {
                      const fileList = document.getElementById('file-list');
                      fileList.innerHTML += `<div class="uploaded-file"><a href="${data.url}">${data.filename}</a></div>`;
                  }
              });
        });
    }

    function getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }
});