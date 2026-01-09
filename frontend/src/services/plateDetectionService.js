// API service for SLNP Detection backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helpful debug output so the frontend can show meaningful errors
console.debug('[plateDetectionService] API_BASE_URL =', API_BASE_URL);

export const plateDetectionService = {
  /**
   * Check if API is available
   */
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },

  /**
   * Detect number plates from image file
   * @param {File} imageFile - Image file
   * @returns {Object} Detection results with plates and annotated image
   */
  detectFromFile: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // try to read response body for more details
        let text = null;
        try { text = await response.text(); } catch (e) { /* ignore */ }
        const details = text || response.statusText || response.status;
        throw new Error(`API error: ${details}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Detection failed:', error);
      throw error;
    }
  },

  /**
   * Detect number plates from base64 image
   * @param {string} base64Image - Base64 encoded image
   * @returns {Object} Detection results
   */
  detectFromBase64: async (base64Image) => {
    try {
      const response = await fetch(`${API_BASE_URL}/detect-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        let text = null;
        try { text = await response.text(); } catch (e) { /* ignore */ }
        const details = text || response.statusText || response.status;
        throw new Error(`API error: ${details}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Detection failed:', error);
      throw error;
    }
  },
};
