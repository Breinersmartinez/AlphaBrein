import AuthService from './AuthService';

class ChatService {
  static async createSession() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/session`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (AuthService.handleResponseError(response)) {
        throw new Error('No autorizado');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al crear sesión');
      }

      return data;
    } catch (error) {
      console.error('Error en createSession:', error);
      throw error;
    }
  }

  static async getSessions() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/sessions`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      if (AuthService.handleResponseError(response)) {
        throw new Error('No autorizado');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al obtener sesiones');
      }

      return data;
    } catch (error) {
      console.error('Error en getSessions:', error);
      throw error;
    }
  }

  static async getSessionHistory(sessionId) {
    try {
      const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/session/${sessionId}/history`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
      );

      if (AuthService.handleResponseError(response)) {
        throw new Error('No autorizado');
      }

      const data = await response.json();

      console.log("DATA HISTORIAL:", data);

      if (!response.ok) {
        console.error('Response data:', data);
        throw new Error(data.message || data.error || 'Error al obtener historial');
      }

      return (data.mensajes || []).map(msg => {

        let parsedText = msg.mensaje;

        // Si es mensaje del AI intentar parsear JSON
        if (msg.sender === 'AGENT' && typeof msg.mensaje === 'string') {
          try {
            const parsed = JSON.parse(msg.mensaje);
            parsedText = parsed.output || msg.mensaje;
          } catch (e) {
            parsedText = msg.mensaje;
          }
        }

        return {
          id: msg.id,
          text: parsedText,
          sender: msg.sender === 'USER' ? 'user' : 'ai',
          timestamp: msg.fechaEnvio,
        };
      });

    } catch (error) {
      console.error('Error en getSessionHistory:', error);
      throw error;
    }
  }

  static async sendMessage(sessionId, messageText) {
    try {
      const payload = {
        chatInput: messageText,
      };

      console.log('Enviando mensaje a sesión:', sessionId, payload);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/message?sessionId=${sessionId}`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (AuthService.handleResponseError(response)) {
        throw new Error('No autorizado');
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('Response data:', data);
        throw new Error(data.message || data.error || 'Error al enviar mensaje');
      }

      // Parsear la respuesta del AI que viene como JSON string
      let aiResponse = data.response;
      if (typeof aiResponse === 'string') {
        try {
          aiResponse = JSON.parse(aiResponse);
          aiResponse = aiResponse.output;
        } catch (e) {
          console.warn('No se pudo parsear respuesta del AI');
        }
      }

      return {
        id: data.sessionId,
        userMessage: data.message || messageText,
        aiResponse: aiResponse,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error en sendMessage:', error);
      throw error;
    }
  }

  static async closeSession(sessionId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/session/${sessionId}/close`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (AuthService.handleResponseError(response)) {
        throw new Error('No autorizado');
      }

      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }

      // El backend retorna un 200 OK sin body, así que no intentamos parsear JSON
      return { success: true };
    } catch (error) {
      console.error('Error en closeSession:', error);
      throw error;
    }
  }
}

export default ChatService;