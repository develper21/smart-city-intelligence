import cv2
import numpy as np
from typing import List, Dict, Any
import os
from datetime import datetime, timedelta

class VideoProcessor:
    def __init__(self):
        self.supported_formats = ['.mp4', '.avi', '.mov', '.mkv']
        
    def extract_frames(self, video_path: str, max_frames: int = 100) -> List[Dict[str, Any]]:
        """
        Extract frames from video for analysis
        Returns list of frame data with timestamps
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        cap = cv2.VideoCapture(video_path)
        frames = []
        
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        # Calculate frame interval to get max_frames evenly
        frame_interval = max(1, total_frames // max_frames)
        
        frame_count = 0
        extracted_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % frame_interval == 0 and extracted_count < max_frames:
                # Calculate timestamp
                timestamp = timedelta(seconds=frame_count / fps)
                
                # Preprocess frame
                processed_frame = self._preprocess_frame(frame)
                
                frames.append({
                    'frame': processed_frame,
                    'timestamp': str(timestamp),
                    'frame_number': frame_count,
                    'fps': fps
                })
                
                extracted_count += 1
                
            frame_count += 1
        
        cap.release()
        return frames
    
    def _preprocess_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Preprocess frame for better detection
        """
        # Convert BGR to RGB
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Apply histogram equalization for better contrast
        frame_yuv = cv2.cvtColor(frame, cv2.COLOR_RGB2YUV)
        frame_yuv[:,:,0] = cv2.equalizeHist(frame_yuv[:,:,0])
        frame = cv2.cvtColor(frame_yuv, cv2.COLOR_YUV2RGB)
        
        # Apply slight blur to reduce noise
        frame = cv2.GaussianBlur(frame, (3, 3), 0)
        
        return frame
    
    def get_video_info(self, video_path: str) -> Dict[str, Any]:
        """
        Get video metadata
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
        
        info = {
            'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            'fps': cap.get(cv2.CAP_PROP_FPS),
            'total_frames': int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            'duration': int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) / cap.get(cv2.CAP_PROP_FPS) if cap.get(cv2.CAP_PROP_FPS) > 0 else 0
        }
        
        cap.release()
        return info
    
    def anonymize_faces(self, frame: np.ndarray) -> np.ndarray:
        """
        Apply face anonymization for privacy
        """
        # Load face cascade classifier
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Blur detected faces
        for (x, y, w, h) in faces:
            face_region = frame[y:y+h, x:x+w]
            blurred_face = cv2.GaussianBlur(face_region, (51, 51), 0)
            frame[y:y+h, x:x+w] = blurred_face
        
        return frame
    
    def detect_motion(self, frame1: np.ndarray, frame2: np.ndarray, threshold: int = 25) -> np.ndarray:
        """
        Detect motion between two frames
        """
        # Convert to grayscale
        gray1 = cv2.cvtColor(frame1, cv2.COLOR_RGB2GRAY)
        gray2 = cv2.cvtColor(frame2, cv2.COLOR_RGB2GRAY)
        
        # Calculate difference
        diff = cv2.absdiff(gray1, gray2)
        
        # Apply threshold
        _, thresh = cv2.threshold(diff, threshold, 255, cv2.THRESH_BINARY)
        
        # Apply morphological operations to reduce noise
        kernel = np.ones((5,5), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        
        return thresh
