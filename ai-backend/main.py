from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import json
from datetime import datetime
from typing import List
import os

from services.video_processor import VideoProcessor
from services.crime_detector import CrimeDetector
from services.rule_engine import PoliceRuleEngine
from services.notification_system import NotificationSystem
from services.realtime_analyzer import realtime_analyzer
from database.models import init_db
from utils.logger import setup_logger

app = FastAPI(title="Smart City Surveillance AI", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
logger = setup_logger()
video_processor = VideoProcessor()
crime_detector = CrimeDetector()
rule_engine = PoliceRuleEngine()
notification_system = NotificationSystem()

# WebSocket connections for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    init_db()
    logger.info("AI Surveillance System Started")

@app.get("/")
async def root():
    return {"message": "Smart City Surveillance AI System", "status": "active"}

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    try:
        # Save uploaded video
        video_path = f"temp/{file.filename}"
        os.makedirs("temp", exist_ok=True)
        
        with open(video_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process video
        logger.info(f"Processing video: {file.filename}")
        
        # Extract frames
        frames = video_processor.extract_frames(video_path)
        
        # Analyze each frame
        alerts = []
        for frame_data in frames:
            detections = crime_detector.detect_objects(frame_data['frame'])
            crime_analysis = rule_engine.analyze_scene(detections, frame_data['timestamp'])
            
            if crime_analysis['is_crime']:
                alert = {
                    "timestamp": frame_data['timestamp'],
                    "event_type": crime_analysis['crime_type'],
                    "risk_level": crime_analysis['risk_level'],
                    "confidence": crime_analysis['confidence'],
                    "description": crime_analysis['description'],
                    "location": f"Video: {file.filename}"
                }
                alerts.append(alert)
                
                # Send real-time notification
                await manager.broadcast({
                    "type": "alert",
                    "data": alert
                })
        
        # Clean up
        os.remove(video_path)
        
        return {
            "status": "success",
            "total_frames": len(frames),
            "alerts_detected": len(alerts),
            "alerts": alerts
        }
        
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/system-status")
async def get_system_status():
    return {
        "status": "active",
        "model_loaded": crime_detector.is_model_loaded(),
        "active_connections": len(manager.active_connections),
        "timestamp": datetime.now().isoformat(),
        "metrics": realtime_analyzer.get_metrics(),
        "streams": realtime_analyzer.get_stream_status()
    }

@app.get("/alerts")
async def get_alerts(limit: int = 10):
    """Get recent alerts for dashboard"""
    try:
        db_manager = __import__('database.models').DatabaseManager()
        recent_alerts = db_manager.get_recent_alerts(limit)
        
        alerts_data = []
        for alert in recent_alerts:
            alerts_data.append({
                "id": alert.id,
                "event_type": alert.event_type,
                "risk_level": alert.risk_level,
                "message": alert.message,
                "alert_time": alert.alert_time.isoformat(),
                "acknowledged": alert.acknowledged,
                "acknowledged_by": alert.acknowledged_by
            })
        
        return {"alerts": alerts_data, "total": len(alerts_data)}
        
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        return {"error": str(e), "alerts": []}

@app.get("/analytics")
async def get_analytics():
    """Get analytics data for dashboard"""
    try:
        db_manager = __import__('database.models').DatabaseManager()
        stats = db_manager.get_detection_statistics()
        
        return {
            "statistics": stats,
            "metrics": realtime_analyzer.get_metrics(),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        return {"error": str(e), "statistics": {}}

@app.post("/start-stream")
async def start_stream(stream_id: str, source: str, location: str = "Unknown"):
    """Start real-time video stream analysis"""
    try:
        success = realtime_analyzer.add_video_stream(stream_id, source, location)
        if success:
            # Start analysis if not already running
            if not realtime_analyzer.is_running:
                realtime_analyzer.start_analysis()
        
        return {
            "success": success,
            "stream_id": stream_id,
            "message": "Stream added successfully" if success else "Failed to add stream"
        }
        
    except Exception as e:
        logger.error(f"Error starting stream: {e}")
        return {"success": False, "error": str(e)}

@app.post("/stop-stream")
async def stop_stream(stream_id: str):
    """Stop video stream analysis"""
    try:
        success = realtime_analyzer.remove_video_stream(stream_id)
        return {
            "success": success,
            "stream_id": stream_id,
            "message": "Stream removed successfully" if success else "Failed to remove stream"
        }
        
    except Exception as e:
        logger.error(f"Error stopping stream: {e}")
        return {"success": False, "error": str(e)}

@app.get("/streams")
async def get_streams():
    """Get all active video streams"""
    return {
        "streams": realtime_analyzer.get_stream_status(),
        "total": len(realtime_analyzer.active_streams)
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
