import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
import os
import json
from datetime import datetime

class PrivacyProtection:
    """
    Privacy protection and face anonymization system
    Ensures compliance with ethical surveillance standards
    """
    
    def __init__(self):
        # Load face detection models
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.profile_face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
        
        # Load license plate detection (if needed)
        self.plate_cascade = None  # Could be added for vehicle anonymization
        
        # Anonymization settings
        self.settings = {
            'face_blur_intensity': 51,  # Kernel size for Gaussian blur (must be odd)
            'face_pixelation_size': 15,  # Size for pixelation blocks
            'anonymize_faces': True,
            'anonymize_license_plates': False,
            'detection_confidence_threshold': 1.1,  # Lower = more sensitive
            'min_face_size': (30, 30),  # Minimum face size to detect
            'preserve_detection_data': False  # Whether to keep original detection data
        }
        
        # Privacy logging
        self.privacy_log = []
    
    def anonymize_frame(self, frame: np.ndarray, detections: List[Dict] = None) -> Tuple[np.ndarray, Dict]:
        """
        Apply privacy protection to a frame
        Returns anonymized frame and privacy report
        """
        anonymized_frame = frame.copy()
        privacy_report = {
            'timestamp': datetime.now().isoformat(),
            'faces_detected': 0,
            'faces_anonymized': 0,
            'license_plates_detected': 0,
            'license_plates_anonymized': 0,
            'processing_time': 0,
            'anonymization_methods': []
        }
        
        start_time = cv2.getTickCount()
        
        try:
            # Face anonymization
            if self.settings['anonymize_faces']:
                faces_detected, anonymized_frame = self._anonymize_faces(anonymized_frame)
                privacy_report['faces_detected'] = len(faces_detected)
                privacy_report['faces_anonymized'] = len(faces_detected)
                privacy_report['anonymization_methods'].append('face_blurring')
            
            # License plate anonymization (if enabled)
            if self.settings['anonymize_license_plates']:
                plates_detected, anonymized_frame = self._anonymize_license_plates(anonymized_frame)
                privacy_report['license_plates_detected'] = len(plates_detected)
                privacy_report['license_plates_anonymized'] = len(plates_detected)
                privacy_report['anonymization_methods'].append('license_plate_blurring')
            
            # Calculate processing time
            processing_time = (cv2.getTickCount() - start_time) / cv2.getTickFrequency()
            privacy_report['processing_time'] = processing_time
            
            # Log privacy event
            self._log_privacy_event(privacy_report)
            
        except Exception as e:
            print(f"Error in frame anonymization: {e}")
        
        return anonymized_frame, privacy_report
    
    def _anonymize_faces(self, frame: np.ndarray) -> Tuple[List[Tuple], np.ndarray]:
        """
        Detect and anonymize faces in frame
        """
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        
        # Detect faces using multiple cascades for better coverage
        faces = []
        
        # Frontal faces
        frontal_faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=self.settings['min_face_size'],
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        faces.extend(frontal_faces)
        
        # Profile faces
        profile_faces = self.profile_face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=3,
            minSize=self.settings['min_face_size'],
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        faces.extend(profile_faces)
        
        # Apply anonymization to detected faces
        for (x, y, w, h) in faces:
            # Expand face region slightly to ensure full coverage
            padding = 10
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(frame.shape[1], x + w + padding)
            y2 = min(frame.shape[0], y + h + padding)
            
            # Apply Gaussian blur
            face_region = frame[y1:y2, x1:x2]
            blurred_face = cv2.GaussianBlur(
                face_region, 
                (self.settings['face_blur_intensity'], self.settings['face_blur_intensity']), 
                0
            )
            frame[y1:y2, x1:x2] = blurred_face
        
        return faces, frame
    
    def _anonymize_license_plates(self, frame: np.ndarray) -> Tuple[List[Tuple], np.ndarray]:
        """
        Detect and anonymize license plates (placeholder implementation)
        """
        # This is a placeholder - in real implementation, you'd use
        # a license plate detection model like ALPR (Automatic License Plate Recognition)
        plates = []
        
        # For demonstration, we'll skip actual license plate detection
        # In production, you'd integrate with a proper ALPR system
        
        return plates, frame
    
    def anonymize_video_file(self, input_path: str, output_path: str) -> Dict[str, Any]:
        """
        Anonymize entire video file
        """
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input video file not found: {input_path}")
        
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {input_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Setup video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Process video
        frame_count = 0
        total_faces_detected = 0
        total_plates_detected = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Anonymize frame
            anonymized_frame, privacy_report = self.anonymize_frame(frame_rgb)
            
            # Convert back to BGR for output
            anonymized_bgr = cv2.cvtColor(anonymized_frame, cv2.COLOR_RGB2BGR)
            
            # Write frame
            out.write(anonymized_bgr)
            
            # Update statistics
            total_faces_detected += privacy_report['faces_detected']
            total_plates_detected += privacy_report['license_plates_detected']
            frame_count += 1
            
            if frame_count % 100 == 0:
                print(f"Processed {frame_count}/{total_frames} frames...")
        
        # Clean up
        cap.release()
        out.release()
        
        # Generate final report
        final_report = {
            'input_file': input_path,
            'output_file': output_path,
            'total_frames_processed': frame_count,
            'total_faces_detected': total_faces_detected,
            'total_faces_anonymized': total_faces_detected,
            'total_license_plates_detected': total_plates_detected,
            'total_license_plates_anonymized': total_plates_detected,
            'processing_completed': datetime.now().isoformat(),
            'privacy_compliance': self._check_privacy_compliance()
        }
        
        return final_report
    
    def _log_privacy_event(self, privacy_report: Dict):
        """
        Log privacy protection events
        """
        self.privacy_log.append(privacy_report)
        
        # Keep only last 1000 events to prevent memory issues
        if len(self.privacy_log) > 1000:
            self.privacy_log = self.privacy_log[-1000:]
    
    def _check_privacy_compliance(self) -> Dict[str, Any]:
        """
        Check if privacy settings comply with standards
        """
        compliance_check = {
            'face_anonymization_enabled': self.settings['anonymize_faces'],
            'license_plate_anonymization_enabled': self.settings['anonymize_license_plates'],
            'detection_threshold_appropriate': self.settings['detection_confidence_threshold'] >= 1.0,
            'minimum_face_size_set': self.settings['min_face_size'] >= (20, 20),
            'blur_intensity_sufficient': self.settings['face_blur_intensity'] >= 15,
            'overall_compliance': False
        }
        
        # Check overall compliance
        required_checks = [
            compliance_check['face_anonymization_enabled'],
            compliance_check['detection_threshold_appropriate'],
            compliance_check['minimum_face_size_set'],
            compliance_check['blur_intensity_sufficient']
        ]
        
        compliance_check['overall_compliance'] = all(required_checks)
        
        return compliance_check
    
    def get_privacy_statistics(self) -> Dict[str, Any]:
        """
        Get privacy protection statistics
        """
        if not self.privacy_log:
            return {
                'total_events': 0,
                'total_faces_anonymized': 0,
                'total_plates_anonymized': 0,
                'average_processing_time': 0,
                'compliance_status': self._check_privacy_compliance()
            }
        
        total_faces = sum(event['faces_anonymized'] for event in self.privacy_log)
        total_plates = sum(event['license_plates_anonymized'] for event in self.privacy_log)
        avg_processing_time = sum(event['processing_time'] for event in self.privacy_log) / len(self.privacy_log)
        
        return {
            'total_events': len(self.privacy_log),
            'total_faces_anonymized': total_faces,
            'total_plates_anonymized': total_plates,
            'average_processing_time': avg_processing_time,
            'compliance_status': self._check_privacy_compliance(),
            'last_event': self.privacy_log[-1] if self.privacy_log else None
        }
    
    def update_settings(self, new_settings: Dict[str, Any]):
        """
        Update privacy protection settings
        """
        # Validate settings
        if 'face_blur_intensity' in new_settings:
            intensity = new_settings['face_blur_intensity']
            if intensity % 2 == 0:  # Must be odd for Gaussian blur
                intensity += 1
            new_settings['face_blur_intensity'] = max(3, min(101, intensity))
        
        if 'min_face_size' in new_settings:
            size = new_settings['min_face_size']
            if isinstance(size, (list, tuple)) and len(size) == 2:
                new_settings['min_face_size'] = (max(10, size[0]), max(10, size[1]))
        
        # Update settings
        self.settings.update(new_settings)
        
        print(f"Privacy settings updated: {new_settings}")
    
    def export_privacy_log(self, output_path: str):
        """
        Export privacy log to file
        """
        try:
            with open(output_path, 'w') as f:
                json.dump(self.privacy_log, f, indent=2)
            print(f"Privacy log exported to: {output_path}")
        except Exception as e:
            print(f"Error exporting privacy log: {e}")
    
    def clear_privacy_log(self):
        """
        Clear privacy log (for testing purposes)
        """
        self.privacy_log.clear()
        print("Privacy log cleared")

# Singleton instance
privacy_protection = PrivacyProtection()

# Global functions for external access
def anonymize_frame(frame: np.ndarray, detections: List[Dict] = None) -> Tuple[np.ndarray, Dict]:
    """Anonymize a single frame"""
    return privacy_protection.anonymize_frame(frame, detections)

def anonymize_video_file(input_path: str, output_path: str) -> Dict[str, Any]:
    """Anonymize video file"""
    return privacy_protection.anonymize_video_file(input_path, output_path)

def get_privacy_statistics() -> Dict[str, Any]:
    """Get privacy statistics"""
    return privacy_protection.get_privacy_statistics()

def update_privacy_settings(settings: Dict[str, Any]):
    """Update privacy settings"""
    privacy_protection.update_settings(settings)
