import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface Alert {
  id: number;
  event_type: string;
  risk_level: string;
  message: string;
  alert_time: string;
  acknowledged: boolean;
  acknowledged_by?: string;
}

export interface SystemStatus {
  status: string;
  model_loaded: boolean;
  active_connections: number;
  timestamp: string;
  metrics: {
    is_running: boolean;
    active_streams: number;
    frames_processed: number;
    alerts_generated: number;
    avg_processing_time: number;
    fps: number;
    uptime_seconds: number;
  };
  streams: Record<string, {
    source: string;
    location: string;
    frame_count: number;
    fps: number;
    last_alert_time: number;
    is_active: boolean;
  }>;
}

export interface Analytics {
  statistics: {
    total_detections: number;
    critical_alerts: number;
    crime_type_distribution: Record<string, number>;
  };
  metrics: SystemStatus['metrics'];
  timestamp: string;
}

export interface VideoAnalysisResult {
  status: string;
  total_frames?: number;
  alerts_detected?: number;
  alerts?: Array<{
    timestamp: string;
    event_type: string;
    risk_level: string;
    confidence: number;
    description: string;
    location: string;
  }>;
  error?: string;
}

// API Functions
export const surveillanceAPI = {
  // System Status
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await api.get('/system-status');
    return response.data;
  },

  // Alerts
  async getAlerts(limit: number = 10): Promise<{ alerts: Alert[]; total: number }> {
    const response = await api.get(`/alerts?limit=${limit}`);
    return response.data;
  },

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const response = await api.get('/analytics');
    return response.data;
  },

  // Video Analysis
  async analyzeVideo(file: File): Promise<VideoAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/analyze-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Stream Management
  async startStream(streamId: string, source: string, location?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/start-stream', null, {
      params: { stream_id: streamId, source, location: location || 'Unknown' }
    });
    return response.data;
  },

  async stopStream(streamId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/stop-stream', null, {
      params: { stream_id: streamId }
    });
    return response.data;
  },

  async getStreams(): Promise<{ streams: SystemStatus['streams']; total: number }> {
    const response = await api.get('/streams');
    return response.data;
  },
};

// WebSocket connection for real-time updates
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(onMessage: (data: any) => void) {
    try {
      this.ws = new WebSocket(`${API_BASE_URL}/ws`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect(onMessage);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect(onMessage);
    }
  }

  private attemptReconnect(onMessage: (data: any) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(onMessage);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Resource not found.');
    }
    
    throw error;
  }
);

export default surveillanceAPI;
