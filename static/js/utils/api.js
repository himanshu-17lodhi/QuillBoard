class ApiError extends Error {
    constructor(response, data) {
        super(data?.message || 'API request failed');
        this.name = 'ApiError';
        this.status = response.status;
        this.data = data;
    }
}

export class ApiClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || '';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
        };
    }

    getCsrfToken() {
        const cookie = document.cookie.match(/csrftoken=([^;]+)/);
        return cookie ? cookie[1] : '';
    }

    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const headers = {
            ...this.defaultHeaders,
            ...options.headers
        };

        if (options.body && typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'same-origin'
            });

            const contentType = response.headers.get('content-type');
            const data = contentType?.includes('application/json') 
                ? await response.json()
                : await response.text();

            if (!response.ok) {
                throw new ApiError(response, data);
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error('Network error');
        }
    }

    get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data
        });
    }

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    upload(endpoint, file, onProgress) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.baseUrl + endpoint);

            const csrfToken = this.getCsrfToken();
            if (csrfToken) {
                xhr.setRequestHeader('X-CSRFToken', csrfToken);
            }

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new ApiError(xhr));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });

            xhr.send(formData);
        });
    }
}