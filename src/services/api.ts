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
  acknowledged_time?: string;
}

export interface Camera {
  id: number;
  camera_id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  zone: string;
  rtsp_url?: string;
  thumbnail_path?: string;
  created_at: string;
  updated_at: string;
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

// Authentication types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  last_login?: string;
}

// API Functions
export const surveillanceAPI = {
  // System Status
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await api.get('/system-status');
    return response.data;
  },

  // Alerts
  async getAlerts(
    limit: number = 10,
    riskLevel?: string,
    eventType?: string,
    status?: string,
    acknowledged?: boolean
  ): Promise<{ alerts: Alert[]; total: number }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (riskLevel) params.append('risk_level', riskLevel);
    if (eventType) params.append('event_type', eventType);
    if (status) params.append('status', status);
    if (acknowledged !== undefined) params.append('acknowledged', acknowledged.toString());
    
    const response = await api.get(`/alerts?${params.toString()}`);
    return response.data;
  },

  async getAlert(alertId: number): Promise<Alert> {
    const response = await api.get(`/alerts/${alertId}`);
    return response.data;
  },

  async acknowledgeAlert(alertId: number, acknowledgedBy: string): Promise<{ message: string }> {
    const response = await api.put(`/alerts/${alertId}/acknowledge`, null, {
      params: { acknowledged_by: acknowledgedBy }
    });
    return response.data;
  },

  async resolveAlert(alertId: number, acknowledgedBy: string): Promise<{ message: string }> {
    const response = await api.put(`/alerts/${alertId}/resolve`, null, {
      params: { acknowledged_by: acknowledgedBy }
    });
    return response.data;
  },

  async bulkResolveAlerts(alertIds: number[], acknowledgedBy: string): Promise<{ message: string; count: number }> {
    const response = await api.post('/alerts/bulk-resolve', { alert_ids: alertIds }, {
      params: { acknowledged_by: acknowledgedBy }
    });
    return response.data;
  },

  // Cameras
  async getCameras(status?: string, zone?: string): Promise<Camera[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (zone) params.append('zone', zone);
    
    const response = await api.get(`/cameras?${params.toString()}`);
    return response.data;
  },

  async getCamera(cameraId: number): Promise<Camera> {
    const response = await api.get(`/cameras/${cameraId}`);
    return response.data;
  },

  async getCameraByCameraId(cameraIdStr: string): Promise<Camera> {
    const response = await api.get(`/cameras/by-id/${cameraIdStr}`);
    return response.data;
  },

  async createCamera(cameraData: {
    camera_id: string;
    name: string;
    location: string;
    zone: string;
    rtsp_url?: string;
    ptz_config?: object;
  }): Promise<Camera> {
    const response = await api.post('/cameras', cameraData);
    return response.data;
  },

  async updateCamera(cameraId: number, cameraData: Partial<Camera>): Promise<Camera> {
    const response = await api.put(`/cameras/${cameraId}`, cameraData);
    return response.data;
  },

  async deleteCamera(cameraId: number): Promise<{ message: string }> {
    const response = await api.delete(`/cameras/${cameraId}`);
    return response.data;
  },

  async controlCameraPTZ(cameraId: number, ptz: { pan?: number; tilt?: number; zoom?: number }): Promise<{ message: string; ptz_config: object }> {
    const response = await api.post(`/cameras/${cameraId}/ptz`, ptz);
    return response.data;
  },

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const response = await api.get('/analytics');
    return response.data;
  },

  async getAnalyticsSummary(): Promise<{
    total_incidents: number;
    resolution_rate: number;
    avg_response_time: string;
    detection_accuracy: string;
    system_uptime: number;
    camera_coverage: number;
    alert_processing: number;
    timestamp: string;
  }> {
    const response = await api.get('/analytics/summary');
    return response.data;
  },

  async getIncidentsOverTime(days: number = 7): Promise<{ data: Array<{ date: string; incidents: number; resolved: number }>; period_days: number }> {
    const response = await api.get(`/analytics/incidents-over-time?days=${days}`);
    return response.data;
  },

  async getAlertTypesDistribution(): Promise<{ data: Array<{ type: string; count: number; color: string }> }> {
    const response = await api.get('/analytics/alert-types');
    return response.data;
  },

  async getHourlyActivity(): Promise<{ data: Array<{ hour: string; incidents: number }> }> {
    const response = await api.get('/analytics/hourly-activity');
    return response.data;
  },

  async getResolutionStatus(): Promise<{ data: Array<{ status: string; count: number; percentage: number }> }> {
    const response = await api.get('/analytics/resolution-status');
    return response.data;
  },

  async getPerformanceMetrics(): Promise<{
    system_uptime: number;
    camera_coverage: number;
    alert_processing: number;
    fps: number;
    avg_processing_time: number;
    frames_processed: number;
    uptime_seconds: number;
    timestamp: string;
  }> {
    const response = await api.get('/analytics/performance');
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

  // Authentication
  async register(username: string, email: string, password: string, role: string = 'viewer'): Promise<{ message: string; user: { id: number; username: string; email: string; role: string } }> {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  async logout(refreshToken: string): Promise<{ message: string }> {
    const response = await api.post('/auth/logout', { refresh_token: refreshToken });
    return response.data;
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await api.get('/auth/me', {
      params: { token }
    });
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
