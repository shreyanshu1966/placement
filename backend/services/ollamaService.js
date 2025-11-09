import axios from 'axios';

/**
 * Ollama Service - Handles communication with local Ollama LLM
 */

class OllamaService {
  constructor() {
    // Read from environment variables dynamically
    this.OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama2';
  }

  /**
   * Generate text completion from Ollama
   * @param {string} prompt - The prompt to send to the model
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Generated text
   */
  async generate(prompt, options = {}) {
    try {
      const payload = {
        model: options.model || this.DEFAULT_MODEL,
        prompt,
        stream: false
      };

      // Add optional parameters if provided
      if (options.temperature !== undefined || options.top_p !== undefined || 
          options.top_k !== undefined || options.max_tokens !== undefined) {
        payload.options = {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          top_k: options.top_k || 40,
          num_predict: options.max_tokens || 500,
        };
      }

      const response = await axios.post(
        `${this.OLLAMA_BASE_URL}/api/generate`, 
        payload,
        { timeout: 60000 } // 60 second timeout
      );

      return response.data.response;
    } catch (error) {
      console.error('Ollama generation error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  /**
   * Generate chat completion from Ollama
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Generated response
   */
  async chat(messages, options = {}) {
    try {
      const payload = {
        model: options.model || this.DEFAULT_MODEL,
        messages,
        stream: false
      };

      // Add optional parameters if provided
      if (options.temperature !== undefined || options.top_p !== undefined) {
        payload.options = {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
        };
      }

      const response = await axios.post(
        `${this.OLLAMA_BASE_URL}/api/chat`, 
        payload,
        { timeout: 60000 } // 60 second timeout
      );

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }

  /**
   * Check if Ollama service is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      const response = await axios.get(`${this.OLLAMA_BASE_URL}/api/tags`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * List available models
   * @returns {Promise<Array>}
   */
  async listModels() {
    try {
      const response = await axios.get(`${this.OLLAMA_BASE_URL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to list models:', error.message);
      return [];
    }
  }

  /**
   * Pull/Download a model from Ollama
   * @param {string} modelName - Name of the model to pull
   * @returns {Promise<boolean>} Success status
   */
  async pullModel(modelName) {
    try {
      await axios.post(`${this.OLLAMA_BASE_URL}/api/pull`, {
        name: modelName,
        stream: false
      });
      return true;
    } catch (error) {
      console.error('Failed to pull model:', error.message);
      return false;
    }
  }

  /**
   * Test connection to Ollama service
   * @returns {Promise<Object>} Connection status
   */
  async testConnection() {
    try {
      const response = await axios.get(`${this.OLLAMA_BASE_URL}/api/tags`, {
        timeout: 5000
      });
      
      return {
        success: true,
        url: this.OLLAMA_BASE_URL,
        models: response.data?.models || [],
        defaultModel: this.DEFAULT_MODEL
      };
    } catch (error) {
      return {
        success: false,
        url: this.OLLAMA_BASE_URL,
        error: error.message,
        defaultModel: this.DEFAULT_MODEL
      };
    }
  }
}

export default new OllamaService();
