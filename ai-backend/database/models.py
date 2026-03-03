from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class VideoRecord(Base):
    __tablename__ = "video_records"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    duration = Column(Float)
    fps = Column(Float)
    width = Column(Integer)
    height = Column(Integer)
    file_size = Column(Integer)
    upload_time = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)
    event_type = Column(String)  # violence, theft, vandalism, etc.

class DetectionRecord(Base):
    __tablename__ = "detection_records"
    
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, nullable=False)
    timestamp = Column(String, nullable=False)  # Video timestamp
    detection_time = Column(DateTime, default=datetime.utcnow)
    crime_type = Column(String)
    risk_level = Column(String)
    confidence = Column(Float)
    description = Column(Text)
    bbox_data = Column(Text)  # JSON string of bounding boxes
    person_count = Column(Integer)
    indicators = Column(Text)  # JSON string of detected indicators
    police_response = Column(Text)  # JSON string of response recommendations
    evidence_notes = Column(Text)

class AlertLog(Base):
    __tablename__ = "alert_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(Integer, nullable=False)
    alert_time = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    risk_level = Column(String)
    message = Column(Text)
    notification_sent = Column(Boolean, default=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String)
    acknowledged_time = Column(DateTime)

class TrainingDataset(Base):
    __tablename__ = "training_datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String, nullable=False)
    source = Column(String)  # UCF, UCSD, Kaggle, etc.
    video_count = Column(Integer)
    event_types = Column(Text)  # JSON string of event types
    description = Column(Text)
    download_url = Column(String)
    local_path = Column(String)
    processed = Column(Boolean, default=False)
    added_time = Column(DateTime, default=datetime.utcnow)

class ModelMetrics(Base):
    __tablename__ = "model_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String, nullable=False)
    training_date = Column(DateTime, default=datetime.utcnow)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    confusion_matrix = Column(Text)  # JSON string
    training_dataset_id = Column(Integer)
    validation_loss = Column(Float)
    epochs_trained = Column(Integer)

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    log_level = Column(String)  # INFO, WARNING, ERROR, CRITICAL
    component = Column(String)  # video_processor, crime_detector, rule_engine
    message = Column(Text)
    details = Column(Text)  # JSON string of additional details

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./surveillance_system.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """
    Initialize database tables
    """
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully")

def get_db():
    """
    Get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database utility functions
class DatabaseManager:
    def __init__(self):
        self.db = SessionLocal()
    
    def save_video_record(self, video_data: dict) -> VideoRecord:
        """
        Save video record to database
        """
        video_record = VideoRecord(**video_data)
        self.db.add(video_record)
        self.db.commit()
        self.db.refresh(video_record)
        return video_record
    
    def save_detection_record(self, detection_data: dict) -> DetectionRecord:
        """
        Save detection record to database
        """
        detection_record = DetectionRecord(**detection_data)
        self.db.add(detection_record)
        self.db.commit()
        self.db.refresh(detection_record)
        return detection_record
    
    def save_alert_log(self, alert_data: dict) -> AlertLog:
        """
        Save alert log to database
        """
        alert_log = AlertLog(**alert_data)
        self.db.add(alert_log)
        self.db.commit()
        self.db.refresh(alert_log)
        return alert_log
    
    def get_recent_alerts(self, limit: int = 10) -> list:
        """
        Get recent alerts
        """
        return self.db.query(AlertLog).order_by(AlertLog.alert_time.desc()).limit(limit).all()
    
    def get_detection_statistics(self) -> dict:
        """
        Get detection statistics
        """
        total_detections = self.db.query(DetectionRecord).count()
        critical_alerts = self.db.query(DetectionRecord).filter(DetectionRecord.risk_level == 'critical').count()
        
        crime_type_stats = {}
        for record in self.db.query(DetectionRecord.crime_type, self.db.func.count(DetectionRecord.id)).group_by(DetectionRecord.crime_type):
            crime_type, count = record
            if crime_type:
                crime_type_stats[crime_type] = count
        
        return {
            'total_detections': total_detections,
            'critical_alerts': critical_alerts,
            'crime_type_distribution': crime_type_stats
        }
    
    def log_system_event(self, component: str, level: str, message: str, details: dict = None):
        """
        Log system event
        """
        import json
        log_entry = SystemLog(
            component=component,
            log_level=level,
            message=message,
            details=json.dumps(details) if details else None
        )
        self.db.add(log_entry)
        self.db.commit()
    
    def close(self):
        """
        Close database connection
        """
        self.db.close()
