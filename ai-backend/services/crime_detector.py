import torch
import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Any, Tuple
import os
from datetime import datetime

class CrimeDetector:
    def __init__(self):
        self.model = None
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.confidence_threshold = 0.5
        self.load_model()
        
        # Crime-relevant classes from COCO dataset
        self.relevant_classes = {
            0: 'person',
            1: 'bicycle', 
            2: 'car',
            3: 'motorcycle',
            5: 'bus',
            7: 'truck',
            15: 'cat',
            16: 'dog'
        }
        
    def load_model(self):
        """
        Load YOLO model for object detection
        """
        try:
            # Load pre-trained YOLOv8 model
            self.model = YOLO('yolov8n.pt')  # nano version for faster inference
            self.model.to(self.device)
            print(f"YOLO model loaded on {self.device}")
            return True
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            return False
    
    def is_model_loaded(self) -> bool:
        return self.model is not None
    
    def detect_objects(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect objects in frame using YOLO
        """
        if self.model is None:
            return []
        
        try:
            # Run inference
            results = self.model(frame, conf=self.confidence_threshold, verbose=False)
            
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        
                        # Get class and confidence
                        class_id = int(box.cls[0].cpu().numpy())
                        confidence = float(box.conf[0].cpu().numpy())
                        
                        # Only include relevant classes
                        if class_id in self.relevant_classes:
                            detection = {
                                'class': self.relevant_classes[class_id],
                                'class_id': class_id,
                                'confidence': confidence,
                                'bbox': [int(x1), int(y1), int(x2), int(y2)],
                                'center': [int((x1 + x2) / 2), int((y1 + y2) / 2)],
                                'area': int((x2 - x1) * (y2 - y1))
                            }
                            detections.append(detection)
            
            return detections
            
        except Exception as e:
            print(f"Error in object detection: {e}")
            return []
    
    def analyze_person_behavior(self, frame: np.ndarray, person_detections: List[Dict]) -> Dict[str, Any]:
        """
        Analyze behavior patterns of detected persons
        """
        if not person_detections:
            return {}
        
        behavior_analysis = {
            'person_count': len(person_detections),
            'crowd_density': self._calculate_crowd_density(person_detections),
            'movement_patterns': self._analyze_movement_patterns(frame, person_detections),
            'interactions': self._detect_interactions(person_detections),
            'anomalies': []
        }
        
        # Detect anomalies
        if behavior_analysis['crowd_density'] > 0.7:
            behavior_analysis['anomalies'].append('high_crowd_density')
        
        if len(person_detections) > 10:
            behavior_analysis['anomalies'].append('unusual_gathering')
        
        return behavior_analysis
    
    def _calculate_crowd_density(self, person_detections: List[Dict]) -> float:
        """
        Calculate crowd density based on person detections
        """
        if not person_detections:
            return 0.0
        
        # Calculate total area occupied by persons
        total_person_area = sum([det['area'] for det in person_detections])
        
        # Estimate frame area (assuming 1920x1080 for normalization)
        frame_area = 1920 * 1080
        
        density = min(1.0, total_person_area / frame_area)
        return density
    
    def _analyze_movement_patterns(self, frame: np.ndarray, person_detections: List[Dict]) -> Dict[str, Any]:
        """
        Analyze movement patterns (simplified version)
        """
        # This is a simplified version - in real implementation,
        # you'd track movement across multiple frames
        patterns = {
            'running_detected': False,
            'aggressive_movement': False,
            'unusual_speed': False
        }
        
        # Placeholder for actual motion analysis
        # In real implementation, you'd use optical flow or tracking
        
        return patterns
    
    def _detect_interactions(self, person_detections: List[Dict]) -> List[Dict[str, Any]]:
        """
        Detect interactions between persons
        """
        interactions = []
        
        for i, person1 in enumerate(person_detections):
            for j, person2 in enumerate(person_detections[i+1:], i+1):
                # Calculate distance between persons
                center1 = person1['center']
                center2 = person2['center']
                
                distance = np.sqrt((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)
                
                # Check if persons are close (potential interaction)
                if distance < 150:  # pixels threshold
                    interaction = {
                        'person1_id': i,
                        'person2_id': j,
                        'distance': distance,
                        'type': 'close_proximity' if distance < 50 else 'nearby'
                    }
                    interactions.append(interaction)
        
        return interactions
    
    def detect_violence_indicators(self, frame: np.ndarray, detections: List[Dict]) -> Dict[str, Any]:
        """
        Detect potential violence indicators
        """
        violence_indicators = {
            'is_violent': False,
            'violence_type': None,
            'confidence': 0.0,
            'indicators': []
        }
        
        person_detections = [d for d in detections if d['class'] == 'person']
        
        if len(person_detections) < 2:
            return violence_indicators
        
        # Analyze person behavior
        behavior = self.analyze_person_behavior(frame, person_detections)
        
        # Check for violence indicators
        if behavior['crowd_density'] > 0.5:
            violence_indicators['indicators'].append('high_density_crowd')
            violence_indicators['confidence'] += 0.3
        
        if len(behavior['interactions']) > 3:
            violence_indicators['indicators'].append('multiple_interactions')
            violence_indicators['confidence'] += 0.2
        
        # Check for aggressive movement (simplified)
        if behavior['movement_patterns'].get('aggressive_movement', False):
            violence_indicators['indicators'].append('aggressive_movement')
            violence_indicators['confidence'] += 0.4
        
        # Determine if violence is detected
        if violence_indicators['confidence'] > 0.6:
            violence_indicators['is_violent'] = True
            violence_indicators['violence_type'] = 'physical_altercation'
        
        return violence_indicators
    
    def detect_suspicious_objects(self, detections: List[Dict]) -> List[Dict[str, Any]]:
        """
        Detect suspicious objects or situations
        """
        suspicious_objects = []
        
        # Check for unusual objects
        for detection in detections:
            if detection['class'] in ['knife', 'weapon', 'gun']:
                suspicious_objects.append({
                    'type': 'weapon',
                    'object': detection,
                    'severity': 'high'
                })
        
        return suspicious_objects
