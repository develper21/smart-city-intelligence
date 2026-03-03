# Smart City Surveillance AI System

🚨 **Transforming Urban Surveillance into Actionable Intelligence**

A comprehensive AI-powered surveillance system that converts raw video footage into rule-aware, actionable intelligence for proactive public safety management.

## 🎯 Problem Statement

Urban police agencies face challenges with:
- **Data Overload**: Massive amounts of video data from CCTV, traffic cameras, body cams, drones
- **Manual Monitoring**: Fatigue, delayed responses, missed threats
- **Reactive Policing**: Crime detection happens after the fact
- **Lack of Intelligence**: AI systems detect objects but don't understand crime patterns

## 🧠 Core Innovation: Police Rule-Based AI

This system encodes **Police SOPs and crime definitions directly into AI logic**, enabling:
- **Intelligent Crime Understanding**: AI thinks like a police operator, not just a vision model
- **Rule-Aware Analysis**: Understands violence, suspicious gatherings, theft patterns
- **Contextual Intelligence**: Considers proximity, crowd density, behavioral patterns

## 🏗️ System Architecture

```
Crime Rules (Police SOPs)
        ↓
AI Rule Encoding Layer
        ↓
Video Dataset Ingestion
        ↓
Video Standardization (Format Conversion)
        ↓
AI / ML Training Pipeline
        ↓
Police-Specific Trained Model
        ↓
Mixed Event Video Database
        ↓
Random Video Fetching
        ↓
AI Analysis
        ↓
Notification / Event Logs (Terminal + Dashboard)
```

## 📁 Project Structure

```
ai-backend/
├── main.py                 # FastAPI server and API endpoints
├── demo.py                 # Complete system demonstration
├── requirements.txt        # Python dependencies
├── services/
│   ├── video_processor.py      # OpenCV video processing
│   ├── crime_detector.py       # YOLO object detection
│   ├── rule_engine.py          # Police rule encoding (CORE)
│   ├── realtime_analyzer.py    # Real-time analysis engine
│   ├── notification_system.py   # Terminal-based alerts
│   └── privacy_protection.py   # Face anonymization
├── training/
│   └── trainer.py              # AI model training pipeline
├── database/
│   └── models.py               # Database models and management
├── utils/
│   └── logger.py               # Logging system
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-backend
pip install -r requirements.txt
```

### 2. Run the Demo

```bash
python demo.py
```

This will demonstrate:
- ✅ Real-time object detection (YOLO)
- ✅ Police rule-based crime analysis
- ✅ Risk level assessment
- ✅ Terminal-based alert system
- ✅ Database logging
- ✅ Performance monitoring

### 3. Start the API Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### 4. Access React Dashboard

Navigate to the frontend directory and start the React app:

```bash
cd ../
npm run dev
```

Dashboard available at `http://localhost:5173`

## 🎥 Supported Crime Types

| Crime Type | Description | Risk Level | Indicators |
|------------|-------------|------------|------------|
| **Violence** | Physical altercation between persons | High/Critical | Close proximity, aggressive movement |
| **Crowd Violence** | Violent behavior in group setting | Critical | High crowd density, multiple interactions |
| **Suspicious Gathering** | Unusual assembly of persons | Medium | Static crowd, abnormal behavior |
| **Vandalism** | Property damage activity | Medium | Person near property, destructive motion |
| **Theft** | Unauthorized taking of property | High | Covert behavior, quick grab motion |

## 📊 API Endpoints

### System Management
- `GET /system-status` - Get system health and metrics
- `GET /analytics` - Get analytics and statistics

### Video Analysis
- `POST /analyze-video` - Upload and analyze video file
- `POST /start-stream` - Start real-time video stream analysis
- `POST /stop-stream` - Stop video stream analysis
- `GET /streams` - Get active video streams

### Alerts & Data
- `GET /alerts` - Get recent alerts
- `WebSocket /ws` - Real-time alerts and updates

## 🔐 Privacy & Ethics

### Built-in Privacy Protection
- **Face Anonymization**: Automatic face blurring for privacy compliance
- **Event-Based Logging**: Only store crime events, not raw video
- **Ethical Surveillance**: Complies with privacy standards
- **Configurable Settings**: Adjustable privacy levels

### Privacy Features
```python
# Automatic face anonymization
anonymized_frame, privacy_report = privacy_protection.anonymize_frame(frame)

# Video file anonymization
report = privacy_protection.anonymize_video_file("input.mp4", "output.mp4")
```

## 🧪 Model Training

### Training Pipeline
```python
from training.trainer import ModelTrainer

trainer = ModelTrainer()
trainer.setup_model(num_classes=5)  # 5 crime types
train_loader, val_loader = trainer.prepare_data(dataset_config)
results = trainer.train(train_loader, val_loader, epochs=50)
```

### Supported Datasets
- **UCF Crime Dataset**: Real-world crime surveillance videos
- **UCSD Anomaly Dataset**: Normal vs abnormal public behavior
- **Kaggle Datasets**: Curated CCTV and surveillance footage
- **Custom Datasets**: Your own surveillance data

## 📈 Performance Metrics

### Real-time Processing
- **FPS**: 15-30 frames per second (depending on hardware)
- **Latency**: <500ms average processing time
- **Accuracy**: 85-95% (depending on training data)
- **Scalability**: Supports multiple concurrent streams

### System Requirements
- **Minimum**: 4GB RAM, 2 CPU cores
- **Recommended**: 8GB RAM, 4+ CPU cores, GPU support
- **Storage**: 10GB+ for models and datasets

## 🎯 Terminal Alert System

### Alert Format
```
[ALERT]
Alert ID    : ALT_20240127_12345678_abc12345
Event Type  : VIOLENCE
Risk Level  : HIGH
Confidence  : 0.85
Source      : Camera ID: CAM_001
Timestamp   : 00:07:41
Description : Physical altercation detected between 2 individuals
Response Required: True
Priority: high
Backup Needed: True
Evidence Notes:
  - Number of persons involved: 2
  - Detection confidence: 0.85
  - Video evidence should be preserved
--------------------------------------------------
```

## 🔧 Configuration

### System Settings
```python
# Update privacy settings
privacy_protection.update_settings({
    'face_blur_intensity': 51,
    'anonymize_faces': True,
    'detection_confidence_threshold': 1.1
})

# Update analysis settings
realtime_analyzer.update_config({
    'frame_interval': 1,
    'alert_cooldown': 30,
    'confidence_threshold': 0.6
})
```

## 🌐 Integration with React Dashboard

### Real-time Features
- **Live Alerts**: WebSocket-based real-time alert updates
- **System Status**: Live system health monitoring
- **Analytics**: Real-time statistics and trends
- **Stream Management**: Add/remove video streams

### API Integration
```typescript
import { surveillanceAPI, wsManager } from '@/services/api';

// Get system status
const status = await surveillanceAPI.getSystemStatus();

// Setup real-time alerts
wsManager.connect((data) => {
  if (data.type === 'alert') {
    // Handle new alert
    addNewAlert(data.data);
  }
});
```

## 🚨 Use Cases

### 1. **Law Enforcement**
- Real-time crime detection and alerting
- Evidence collection and preservation
- Resource optimization and dispatch

### 2. **Urban Security**
- Public space monitoring
- Traffic and crowd management
- Emergency response coordination

### 3. **Critical Infrastructure**
- Facility perimeter security
- Access control monitoring
- Threat detection and prevention

## 📋 Future Enhancements

### Planned Features
- [ ] **Drone Integration**: Aerial surveillance support
- [ ] **Body Camera Feeds**: Officer-worn camera integration
- [ ] **Predictive Analytics**: Crime pattern prediction
- [ ] **Multi-Language Support**: International deployment
- [ ] **Cloud Deployment**: Scalable cloud infrastructure

### Advanced AI Models
- [ ] **Behavioral Analysis**: Advanced pattern recognition
- [ ] **Weapon Detection**: Automatic weapon identification
- [ ] **Vehicle Recognition**: License plate and make/model detection
- [ ] **Audio Analysis**: Sound-based threat detection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is part of the CHANGETHON - National Social Summit 2026 initiative.

## 📞 Support

For questions and support:
- **Technical Issues**: Check the demo.py for comprehensive testing
- **API Documentation**: See `/docs` endpoint when server is running
- **Dashboard Integration**: Follow React dashboard setup guide

---

## 🎉 Impact Statement

**"This system enables police agencies to transform surveillance footage into rule-aware, actionable intelligence by training AI models that understand crime definitions, operational protocols, and real-world video behavior."**

*Built for CHANGETHON 2026 - Transforming Urban Surveillance into Actionable Intelligence*
