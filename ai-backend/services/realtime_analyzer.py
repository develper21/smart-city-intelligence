import asyncio
import threading
import time
import queue
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import cv2
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import os

from services.video_processor import VideoProcessor
from services.crime_detector import CrimeDetector
from services.rule_engine import PoliceRuleEngine
from services.notification_system import send_alert
from database.models import DatabaseManager
from utils.logger import setup_logger

class RealTimeAnalyzer:
    """
    Real-time video analysis engine for continuous surveillance
    """
    
    def __init__(self, max_workers: int = 4):
        self.logger = setup_logger("realtime_analyzer")
        self.video_processor = VideoProcessor()
        self.crime_detector = CrimeDetector()
        self.rule_engine = PoliceRuleEngine()
        self.db_manager = DatabaseManager()
        
        # Thread pool for parallel processing
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        
        # Queue for video frames
        self.frame_queue = queue.Queue(maxsize=100)
        
        # Active video streams
        self.active_streams = {}
        
        # Analysis state
        self.is_running = False
        self.analysis_thread = None
        
        # Performance metrics
        self.metrics = {
            'frames_processed': 0,
            'alerts_generated': 0,
            'processing_times': [],
            'start_time': None
        }
        
        # Configuration
        self.config = {
            'frame_interval': 1,  # Process every Nth frame
            'alert_cooldown': 30,  # Seconds between alerts for same location
            'confidence_threshold': 0.6,
            'max_queue_size': 100
        }
        
        # Alert cooldown tracking
        self.alert_cooldowns = {}
    
    def add_video_stream(self, stream_id: str, source: str, location: str = "Unknown") -> bool:
        """
        Add a video stream for real-time analysis
        """
        try:
            if stream_id in self.active_streams:
                self.logger.warning(f"Stream {stream_id} already exists")
                return False
            
            # Initialize video capture
            cap = cv2.VideoCapture(source)
            if not cap.isOpened():
                self.logger.error(f"Failed to open video source: {source}")
                return False
            
            # Store stream info
            self.active_streams[stream_id] = {
                'capture': cap,
                'source': source,
                'location': location,
                'last_frame': None,
                'frame_count': 0,
                'fps': cap.get(cv2.CAP_PROP_FPS),
                'last_alert_time': 0
            }
            
            self.logger.info(f"Added video stream {stream_id} from {source}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error adding video stream {stream_id}: {e}")
            return False
    
    def remove_video_stream(self, stream_id: str) -> bool:
        """
        Remove a video stream from analysis
        """
        try:
            if stream_id not in self.active_streams:
                self.logger.warning(f"Stream {stream_id} not found")
                return False
            
            # Release video capture
            cap = self.active_streams[stream_id]['capture']
            cap.release()
            
            # Remove from active streams
            del self.active_streams[stream_id]
            
            self.logger.info(f"Removed video stream {stream_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error removing video stream {stream_id}: {e}")
            return False
    
    def start_analysis(self) -> bool:
        """
        Start real-time analysis
        """
        if self.is_running:
            self.logger.warning("Analysis is already running")
            return False
        
        if not self.active_streams:
            self.logger.error("No active video streams to analyze")
            return False
        
        self.is_running = True
        self.metrics['start_time'] = datetime.now()
        
        # Start analysis thread
        self.analysis_thread = threading.Thread(target=self._analysis_loop)
        self.analysis_thread.daemon = True
        self.analysis_thread.start()
        
        self.logger.info("Real-time analysis started")
        return True
    
    def stop_analysis(self) -> bool:
        """
        Stop real-time analysis
        """
        if not self.is_running:
            self.logger.warning("Analysis is not running")
            return False
        
        self.is_running = False
        
        # Wait for analysis thread to finish
        if self.analysis_thread:
            self.analysis_thread.join(timeout=5)
        
        # Clean up resources
        for stream_id in list(self.active_streams.keys()):
            self.remove_video_stream(stream_id)
        
        self.logger.info("Real-time analysis stopped")
        return True
    
    def _analysis_loop(self):
        """
        Main analysis loop running in separate thread
        """
        while self.is_running:
            try:
                # Process each active stream
                for stream_id, stream_info in self.active_streams.items():
                    if not self.is_running:
                        break
                    
                    # Read frame from stream
                    ret, frame = stream_info['capture'].read()
                    if not ret:
                        self.logger.warning(f"Failed to read frame from stream {stream_id}")
                        continue
                    
                    # Update stream info
                    stream_info['frame_count'] += 1
                    stream_info['last_frame'] = frame
                    
                    # Process frame based on interval
                    if stream_info['frame_count'] % self.config['frame_interval'] == 0:
                        # Submit frame for analysis
                        future = self.executor.submit(
                            self._analyze_frame,
                            frame,
                            stream_id,
                            stream_info
                        )
                        
                        # Handle result asynchronously
                        future.add_done_callback(self._handle_analysis_result)
                
                # Small delay to prevent excessive CPU usage
                time.sleep(0.01)
                
            except Exception as e:
                self.logger.error(f"Error in analysis loop: {e}")
                time.sleep(1)
    
    def _analyze_frame(self, frame: np.ndarray, stream_id: str, stream_info: Dict) -> Dict:
        """
        Analyze a single frame
        """
        start_time = time.time()
        
        try:
            # Preprocess frame
            processed_frame = self.video_processor._preprocess_frame(frame)
            
            # Object detection
            detections = self.crime_detector.detect_objects(processed_frame)
            
            # Apply police rule engine
            timestamp = datetime.now().strftime("%H:%M:%S")
            analysis = self.rule_engine.analyze_scene(detections, timestamp)
            
            # Add stream-specific information
            analysis['stream_id'] = stream_id
            analysis['location'] = stream_info['location']
            analysis['frame_number'] = stream_info['frame_count']
            analysis['processing_time'] = time.time() - start_time
            
            # Update metrics
            self.metrics['frames_processed'] += 1
            self.metrics['processing_times'].append(analysis['processing_time'])
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing frame for stream {stream_id}: {e}")
            return {
                'error': str(e),
                'stream_id': stream_id,
                'processing_time': time.time() - start_time
            }
    
    def _handle_analysis_result(self, future):
        """
        Handle analysis result from thread pool
        """
        try:
            analysis = future.result()
            
            if 'error' in analysis:
                return
            
            # Check if crime detected
            if analysis.get('is_crime', False):
                self._handle_crime_detection(analysis)
            
            # Save to database
            self._save_analysis_result(analysis)
            
        except Exception as e:
            self.logger.error(f"Error handling analysis result: {e}")
    
    def _handle_crime_detection(self, analysis: Dict):
        """
        Handle detected crime
        """
        stream_id = analysis['stream_id']
        current_time = time.time()
        
        # Check alert cooldown
        last_alert_time = self.active_streams[stream_id]['last_alert_time']
        if current_time - last_alert_time < self.config['alert_cooldown']:
            return
        
        # Update last alert time
        self.active_streams[stream_id]['last_alert_time'] = current_time
        
        # Prepare alert data
        alert_data = {
            'crime_type': analysis['crime_type'],
            'risk_level': analysis['risk_level'],
            'confidence': analysis['confidence'],
            'description': analysis['description'],
            'location': analysis['location'],
            'timestamp': analysis['timestamp'],
            'police_response': analysis.get('police_response', {}),
            'evidence_notes': analysis.get('evidence_notes', []),
            'stream_id': stream_id,
            'frame_number': analysis['frame_number']
        }
        
        # Send alert
        try:
            alert_id = send_alert(alert_data)
            self.metrics['alerts_generated'] += 1
            
            self.logger.info(f"Alert generated for stream {stream_id}: {analysis['crime_type']}")
            
        except Exception as e:
            self.logger.error(f"Error sending alert: {e}")
    
    def _save_analysis_result(self, analysis: Dict):
        """
        Save analysis result to database
        """
        try:
            detection_record = {
                'video_id': hash(analysis['stream_id']) % 1000000,  # Simple hash for video ID
                'timestamp': analysis['timestamp'],
                'crime_type': analysis.get('crime_type'),
                'risk_level': analysis.get('risk_level'),
                'confidence': analysis.get('confidence', 0.0),
                'description': analysis.get('description', ''),
                'bbox_data': json.dumps([]),  # Would contain actual detections
                'person_count': 0,  # Would be calculated from detections
                'indicators': json.dumps(analysis.get('indicators_detected', [])),
                'police_response': json.dumps(analysis.get('police_response', {})),
                'evidence_notes': json.dumps(analysis.get('evidence_notes', []))
            }
            
            self.db_manager.save_detection_record(detection_record)
            
        except Exception as e:
            self.logger.error(f"Error saving analysis result: {e}")
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get current performance metrics
        """
        current_time = datetime.now()
        
        # Calculate average processing time
        processing_times = self.metrics['processing_times']
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
        
        # Calculate frames per second
        elapsed_time = 0
        if self.metrics['start_time']:
            elapsed_time = (current_time - self.metrics['start_time']).total_seconds()
        
        fps = self.metrics['frames_processed'] / elapsed_time if elapsed_time > 0 else 0
        
        return {
            'is_running': self.is_running,
            'active_streams': len(self.active_streams),
            'frames_processed': self.metrics['frames_processed'],
            'alerts_generated': self.metrics['alerts_generated'],
            'avg_processing_time': avg_processing_time,
            'fps': fps,
            'uptime_seconds': elapsed_time,
            'start_time': self.metrics['start_time'].isoformat() if self.metrics['start_time'] else None
        }
    
    def get_stream_status(self) -> Dict[str, Any]:
        """
        Get status of all active streams
        """
        stream_status = {}
        
        for stream_id, stream_info in self.active_streams.items():
            stream_status[stream_id] = {
                'source': stream_info['source'],
                'location': stream_info['location'],
                'frame_count': stream_info['frame_count'],
                'fps': stream_info['fps'],
                'last_alert_time': stream_info['last_alert_time'],
                'is_active': stream_info['capture'].isOpened()
            }
        
        return stream_status
    
    def update_config(self, new_config: Dict[str, Any]):
        """
        Update analyzer configuration
        """
        self.config.update(new_config)
        self.logger.info(f"Updated configuration: {new_config}")
    
    def process_video_file(self, video_path: str, location: str = "File Upload") -> Dict[str, Any]:
        """
        Process a video file (for file uploads)
        """
        try:
            if not os.path.exists(video_path):
                raise FileNotFoundError(f"Video file not found: {video_path}")
            
            # Get video info
            video_info = self.video_processor.get_video_info(video_path)
            
            # Extract frames
            frames = self.video_processor.extract_frames(video_path, max_frames=50)
            
            results = []
            total_alerts = 0
            
            for frame_data in frames:
                # Analyze frame
                analysis = self._analyze_frame(
                    frame_data['frame'], 
                    f"file_{os.path.basename(video_path)}",
                    {'location': location, 'frame_count': frame_data['frame_number']}
                )
                
                results.append(analysis)
                
                if analysis.get('is_crime', False):
                    total_alerts += 1
                    self._handle_crime_detection(analysis)
            
            return {
                'status': 'success',
                'video_path': video_path,
                'location': location,
                'total_frames': len(frames),
                'alerts_detected': total_alerts,
                'video_info': video_info,
                'results': results
            }
            
        except Exception as e:
            self.logger.error(f"Error processing video file {video_path}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'video_path': video_path
            }

# Singleton instance
realtime_analyzer = RealTimeAnalyzer()

# Global functions for external access
def start_realtime_analysis() -> bool:
    """Start real-time analysis"""
    return realtime_analyzer.start_analysis()

def stop_realtime_analysis() -> bool:
    """Stop real-time analysis"""
    return realtime_analyzer.stop_analysis()

def add_video_stream(stream_id: str, source: str, location: str = "Unknown") -> bool:
    """Add video stream for analysis"""
    return realtime_analyzer.add_video_stream(stream_id, source, location)

def remove_video_stream(stream_id: str) -> bool:
    """Remove video stream from analysis"""
    return realtime_analyzer.remove_video_stream(stream_id)

def get_analysis_metrics() -> Dict[str, Any]:
    """Get analysis metrics"""
    return realtime_analyzer.get_metrics()

def process_video_file(video_path: str, location: str = "File Upload") -> Dict[str, Any]:
    """Process video file"""
    return realtime_analyzer.process_video_file(video_path, location)
