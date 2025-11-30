// Webpack automatically replaces 'process.env.REACT_APP_API_URL' 
// with the value from your .env file during the build.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

console.log("Using Backend URL:", API_BASE_URL);



export const api = {
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (err) {
      return false;
    }
  },

  // --- NEW: Forgot & Reset Password ---
  forgotPassword: (email) => {
    return fetch(`${API_BASE_URL}/auth/forgot-password?email=${email}`, {
      method: 'POST'
    });
  },

  resetPassword: (token, newPassword) => {
    return fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
  },
  


  sendOtp: (phoneNo) => {
    // Note: We expect the backend to return { otp: "123456", message: "..." } for the demo
    return fetch(`${API_BASE_URL}/auth/send-otp?phoneNo=${encodeURIComponent(phoneNo)}`, {
      method: 'POST'
    });
  },

  verifyOtp: (phoneNo, otp) => {
    return fetch(`${API_BASE_URL}/auth/verify-otp?phoneNo=${encodeURIComponent(phoneNo)}&otp=${otp}`, {
      method: 'POST'
    });
  },


  getAnalytics: (auth) => {
      const base64Credentials = btoa(`${auth.username}:${auth.password}`);
      return fetch(`${API_BASE_URL}/analytics`, {
        headers: { 'Authorization': `Basic ${base64Credentials}` }
      });
  },

  login: async (credentials) => {
    // 1. Create Base64 Auth Header
    const base64Credentials = btoa(`${credentials.username}:${credentials.password}`);
    
    // 2. Send Request
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json'
      }
    });

    // 3. Handle Success
    if (response.ok) {
      const userDetails = await response.json();
      return {
        ...userDetails,
        username: credentials.username, 
        password: credentials.password,
        authenticated: true
      };
    }

    // 4. HANDLE ERRORS (CRITICAL CHANGE HERE)
    // We try to parse the JSON backend sent us: {"message": "Email not verified..."}
    const errorData = await response.json().catch(() => ({})); 
    
    if (errorData.message) {
        throw new Error(errorData.message); // <--- This throws "Email not verified..."
    }
    
    // Fallback for other errors
    if (response.status === 401) throw new Error('Invalid username or password');
    throw new Error('Login failed. Please check connection.');
  },
  
  registerStudent: (data) => fetch(`${API_BASE_URL}/user/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  registerAdmin: (data, auth) => {
    const base64Credentials = btoa(`${auth.username}:${auth.password}`);
    return fetch(`${API_BASE_URL}/user/admin`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Credentials}`
      },
      body: JSON.stringify(data)
    });
  },
  
  updateProfile: (data, auth) => {
    const base64Credentials = btoa(`${auth.username}:${auth.password}`);
    return fetch(`${API_BASE_URL}/user/update`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  getBooks: (auth, title = '', type = '', author = '', status = '') => {
      const params = new URLSearchParams();
      if (title) params.append('title', title);
      if (type) params.append('type', type);
      if (author) params.append('author', author);
      if (status) params.append('status', status);
      
      const base64Credentials = btoa(`${auth.username}:${auth.password}`);
      return fetch(`${API_BASE_URL}/book/all?${params}`, {
        headers: { 'Authorization': `Basic ${base64Credentials}` }
      });
  },
  
  addBook: (auth, data) => {
    const base64Credentials = btoa(`${auth.username}:${auth.password}`);
    return fetch(`${API_BASE_URL}/book`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  deleteBook: (auth, bookNo) => {
    const base64Credentials = btoa(`${auth.username}:${auth.password}`);
    return fetch(`${API_BASE_URL}/book/${bookNo}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${base64Credentials}`
      }
    });
  },
  
  issueBook: (auth, data) => {
    const base64Credentials = btoa(`${auth.username}:${auth.password}`);
    return fetch(`${API_BASE_URL}/transaction/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },
  
  returnBook: (auth, data) => {
    const base64Credentials = btoa(`${auth.username}:${auth.password}`);
    return fetch(`${API_BASE_URL}/transaction/return`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  getTransactions: (auth) => {
    const base64Credentials = btoa(`${auth.username}:${auth.password}`);
    return fetch(`${API_BASE_URL}/transaction/history`, {
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json'
      }
    });
  }
};