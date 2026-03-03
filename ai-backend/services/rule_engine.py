from typing import Dict, List, Any, Tuple
import numpy as np
from datetime import datetime

class PoliceRuleEngine:
    """
    CORE INNOVATION: Police Rule-Based AI Understanding
    Encodes police SOPs and crime definitions into AI logic
    """
    
    def __init__(self):
        self.crime_rules = self._initialize_crime_rules()
        self.risk_thresholds = self._initialize_risk_thresholds()
        self.police_sops = self._initialize_police_sops()
        
    def _initialize_crime_rules(self) -> Dict[str, Dict]:
        """
        Define crime rules based on police SOPs and legal definitions
        """
        return {
            'violence': {
                'definition': 'Aggressive physical interaction between persons',
                'indicators': [
                    'close_proximity_interaction',
                    'aggressive_movement',
                    'rapid_motion',
                    'physical_contact'
                ],
                'thresholds': {
                    'min_persons': 2,
                    'proximity_threshold': 50,  # pixels
                    'movement_speed_threshold': 0.7,
                    'confidence_threshold': 0.6
                },
                'severity_weights': {
                    'physical_contact': 0.4,
                    'aggressive_movement': 0.3,
                    'crowd_density': 0.2,
                    'rapid_motion': 0.1
                }
            },
            'crowd_violence': {
                'definition': 'Violent behavior in group setting',
                'indicators': [
                    'high_crowd_density',
                    'multiple_interactions',
                    'chaotic_movement',
                    'group_aggression'
                ],
                'thresholds': {
                    'min_persons': 5,
                    'crowd_density_threshold': 0.6,
                    'interaction_threshold': 3,
                    'confidence_threshold': 0.7
                },
                'severity_weights': {
                    'crowd_density': 0.3,
                    'multiple_interactions': 0.3,
                    'chaotic_movement': 0.2,
                    'group_aggression': 0.2
                }
            },
            'suspicious_gathering': {
                'definition': 'Unusual assembly of persons',
                'indicators': [
                    'unusual_gathering',
                    'static_crowd',
                    'concealed_activity',
                    'abnormal_behavior'
                ],
                'thresholds': {
                    'min_persons': 3,
                    'static_threshold': 0.8,
                    'confidence_threshold': 0.5
                },
                'severity_weights': {
                    'unusual_gathering': 0.4,
                    'static_crowd': 0.3,
                    'concealed_activity': 0.2,
                    'abnormal_behavior': 0.1
                }
            },
            'vandalism': {
                'definition': 'Destruction or damage to property',
                'indicators': [
                    'person_near_property',
                    'destructive_motion',
                    'object_interaction',
                    'property_damage'
                ],
                'thresholds': {
                    'min_persons': 1,
                    'property_proximity': 100,
                    'confidence_threshold': 0.6
                },
                'severity_weights': {
                    'destructive_motion': 0.4,
                    'property_damage': 0.3,
                    'object_interaction': 0.2,
                    'person_near_property': 0.1
                }
            },
            'theft': {
                'definition': 'Unauthorized taking of property',
                'indicators': [
                    'covert_behavior',
                    'quick_grab_motion',
                    'concealment_attempt',
                    'suspicious_loitering'
                ],
                'thresholds': {
                    'min_persons': 1,
                    'confidence_threshold': 0.7
                },
                'severity_weights': {
                    'covert_behavior': 0.3,
                    'quick_grab_motion': 0.3,
                    'concealment_attempt': 0.2,
                    'suspicious_loitering': 0.2
                }
            }
        }
    
    def _initialize_risk_thresholds(self) -> Dict[str, Dict]:
        """
        Risk level thresholds for different crime types
        """
        return {
            'critical': {
                'confidence_range': (0.8, 1.0),
                'response_time': 'immediate',
                'notification_priority': 'high'
            },
            'high': {
                'confidence_range': (0.6, 0.8),
                'response_time': 'urgent',
                'notification_priority': 'medium'
            },
            'medium': {
                'confidence_range': (0.4, 0.6),
                'response_time': 'standard',
                'notification_priority': 'low'
            },
            'low': {
                'confidence_range': (0.2, 0.4),
                'response_time': 'monitor',
                'notification_priority': 'info'
            }
        }
    
    def _initialize_police_sops(self) -> Dict[str, Any]:
        """
        Police Standard Operating Procedures integration
        """
        return {
            'response_protocols': {
                'violence': {
                    'immediate_action': 'dispatch_patrol',
                    'backup_required': True,
                    'evidence_collection': True,
                    'crowd_control': True if 'crowd' in ['violence'] else False
                },
                'theft': {
                    'immediate_action': 'investigate',
                    'backup_required': False,
                    'evidence_collection': True,
                    'crowd_control': False
                }
            },
            'jurisdiction_rules': {
                'public_space': True,
                'private_property': 'owner_consent_required',
                'government_property': 'high_priority'
            }
        }
    
    def analyze_scene(self, detections: List[Dict], timestamp: str) -> Dict[str, Any]:
        """
        Main analysis function - applies police rules to detections
        """
        analysis_result = {
            'is_crime': False,
            'crime_type': None,
            'risk_level': 'low',
            'confidence': 0.0,
            'description': '',
            'indicators_detected': [],
            'police_response': {},
            'evidence_notes': [],
            'timestamp': timestamp
        }
        
        if not detections:
            return analysis_result
        
        # Extract person detections
        person_detections = [d for d in detections if d['class'] == 'person']
        
        if len(person_detections) == 0:
            return analysis_result
        
        # Analyze each crime type
        for crime_type, rule in self.crime_rules.items():
            crime_analysis = self._analyze_crime_type(
                crime_type, rule, detections, person_detections
            )
            
            if crime_analysis['confidence'] > rule['thresholds']['confidence_threshold']:
                if crime_analysis['confidence'] > analysis_result['confidence']:
                    analysis_result.update(crime_analysis)
                    analysis_result['crime_type'] = crime_type
                    analysis_result['is_crime'] = True
        
        # Determine risk level based on confidence
        analysis_result['risk_level'] = self._determine_risk_level(
            analysis_result['confidence']
        )
        
        # Generate police response recommendations
        if analysis_result['is_crime']:
            analysis_result['police_response'] = self._generate_police_response(
                analysis_result['crime_type'], analysis_result['risk_level']
            )
        
        return analysis_result
    
    def _analyze_crime_type(self, crime_type: str, rule: Dict, 
                           all_detections: List[Dict], person_detections: List[Dict]) -> Dict[str, Any]:
        """
        Analyze specific crime type based on police rules
        """
        analysis = {
            'confidence': 0.0,
            'indicators_detected': [],
            'description': '',
            'evidence_notes': []
        }
        
        # Check minimum person requirement
        if len(person_detections) < rule['thresholds']['min_persons']:
            return analysis
        
        # Calculate confidence based on indicators
        total_confidence = 0.0
        
        for indicator in rule['indicators']:
            indicator_confidence = self._check_indicator(
                indicator, all_detections, person_detections, rule
            )
            
            if indicator_confidence > 0:
                analysis['indicators_detected'].append(indicator)
                weight = rule['severity_weights'].get(indicator, 0.1)
                total_confidence += indicator_confidence * weight
        
        analysis['confidence'] = min(1.0, total_confidence)
        
        # Generate description
        if analysis['confidence'] > rule['thresholds']['confidence_threshold']:
            analysis['description'] = self._generate_crime_description(
                crime_type, analysis['indicators_detected'], len(person_detections)
            )
            
            # Generate evidence notes
            analysis['evidence_notes'] = self._generate_evidence_notes(
                crime_type, person_detections
            )
        
        return analysis
    
    def _check_indicator(self, indicator: str, all_detections: List[Dict], 
                        person_detections: List[Dict], rule: Dict) -> float:
        """
        Check if specific crime indicator is present
        """
        if indicator == 'close_proximity_interaction':
            return self._check_close_proximity(person_detections, rule)
        elif indicator == 'aggressive_movement':
            return self._check_aggressive_movement(person_detections)
        elif indicator == 'high_crowd_density':
            return self._check_crowd_density(person_detections, rule)
        elif indicator == 'multiple_interactions':
            return self._check_multiple_interactions(person_detections, rule)
        elif indicator == 'unusual_gathering':
            return self._check_unusual_gathering(person_detections)
        elif indicator == 'covert_behavior':
            return self._check_covert_behavior(person_detections)
        else:
            return 0.0
    
    def _check_close_proximity(self, person_detections: List[Dict], rule: Dict) -> float:
        """
        Check for close proximity between persons
        """
        if len(person_detections) < 2:
            return 0.0
        
        proximity_count = 0
        total_pairs = 0
        
        for i, person1 in enumerate(person_detections):
            for j, person2 in enumerate(person_detections[i+1:], i+1):
                total_pairs += 1
                center1 = person1['center']
                center2 = person2['center']
                
                distance = np.sqrt((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)
                
                if distance < rule['thresholds']['proximity_threshold']:
                    proximity_count += 1
        
        return proximity_count / total_pairs if total_pairs > 0 else 0.0
    
    def _check_crowd_density(self, person_detections: List[Dict], rule: Dict) -> float:
        """
        Check crowd density
        """
        if len(person_detections) < rule['thresholds']['min_persons']:
            return 0.0
        
        # Calculate total area occupied by persons
        total_person_area = sum([det['area'] for det in person_detections])
        frame_area = 1920 * 1080  # Assuming standard resolution
        
        density = total_person_area / frame_area
        
        if density > rule['thresholds']['crowd_density_threshold']:
            return min(1.0, density * 2)  # Normalize to 0-1
        
        return 0.0
    
    def _check_multiple_interactions(self, person_detections: List[Dict], rule: Dict) -> float:
        """
        Check for multiple person interactions
        """
        if len(person_detections) < rule['thresholds']['min_persons']:
            return 0.0
        
        interaction_count = 0
        proximity_threshold = 100  # pixels
        
        for i, person1 in enumerate(person_detections):
            for j, person2 in enumerate(person_detections[i+1:], i+1):
                center1 = person1['center']
                center2 = person2['center']
                
                distance = np.sqrt((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)
                
                if distance < proximity_threshold:
                    interaction_count += 1
        
        threshold = rule['thresholds']['interaction_threshold']
        return min(1.0, interaction_count / threshold) if threshold > 0 else 0.0
    
    def _check_aggressive_movement(self, person_detections: List[Dict]) -> float:
        """
        Check for aggressive movement patterns
        """
        # Simplified version - in real implementation, would use motion analysis
        # For now, return moderate confidence for demonstration
        return 0.6 if len(person_detections) > 1 else 0.0
    
    def _check_unusual_gathering(self, person_detections: List[Dict]) -> float:
        """
        Check for unusual gathering patterns
        """
        if len(person_detections) < 3:
            return 0.0
        
        # Check if people are gathered in one area
        centers = [p['center'] for p in person_detections]
        center_x = np.mean([c[0] for c in centers])
        center_y = np.mean([c[1] for c in centers])
        
        # Calculate variance from center
        variance = np.mean([(c[0] - center_x)**2 + (c[1] - center_y)**2 for c in centers])
        
        # Low variance indicates tight gathering
        return 1.0 - min(1.0, variance / 100000)  # Normalize
    
    def _check_covert_behavior(self, person_detections: List[Dict]) -> float:
        """
        Check for covert/suspicious behavior
        """
        # Simplified version - would use behavior analysis in real implementation
        return 0.4 if len(person_detections) == 1 else 0.0
    
    def _determine_risk_level(self, confidence: float) -> str:
        """
        Determine risk level based on confidence
        """
        if confidence >= 0.8:
            return 'critical'
        elif confidence >= 0.6:
            return 'high'
        elif confidence >= 0.4:
            return 'medium'
        else:
            return 'low'
    
    def _generate_crime_description(self, crime_type: str, indicators: List[str], person_count: int) -> str:
        """
        Generate human-readable crime description
        """
        descriptions = {
            'violence': f"Physical altercation detected between {person_count} individuals",
            'crowd_violence': f"Violent behavior in crowd of {person_count} persons detected",
            'suspicious_gathering': f"Unusual gathering of {person_count} persons detected",
            'vandalism': f"Property damage activity detected",
            'theft': f"Theft-related activity detected"
        }
        
        base_desc = descriptions.get(crime_type, f"Suspicious activity involving {person_count} persons")
        
        if indicators:
            indicators_str = ', '.join(indicators.replace('_', ' ') for indicators in indicators[:3])
            return f"{base_desc}. Indicators: {indicators_str}"
        
        return base_desc
    
    def _generate_evidence_notes(self, crime_type: str, person_detections: List[Dict]) -> List[str]:
        """
        Generate evidence collection notes
        """
        notes = [
            f"Number of persons involved: {len(person_detections)}",
            f"Detection confidence: {self._get_max_confidence(person_detections):.2f}",
            f"Crime type classification: {crime_type}",
            "Video evidence should be preserved",
            "Facial recognition recommended if available"
        ]
        
        return notes
    
    def _get_max_confidence(self, detections: List[Dict]) -> float:
        """
        Get maximum confidence from detections
        """
        if not detections:
            return 0.0
        
        return max([d.get('confidence', 0.0) for d in detections])
    
    def _generate_police_response(self, crime_type: str, risk_level: str) -> Dict[str, Any]:
        """
        Generate police response recommendations based on SOPs
        """
        base_response = {
            'dispatch_required': True,
            'priority': risk_level,
            'backup_needed': False,
            'evidence_preservation': True,
            'crowd_control': False
        }
        
        # Get SOPs for this crime type
        crime_sops = self.police_sops['response_protocols'].get(crime_type, {})
        
        # Merge with base response
        base_response.update(crime_sops)
        
        # Adjust based on risk level
        if risk_level == 'critical':
            base_response['backup_needed'] = True
            base_response['immediate_dispatch'] = True
        elif risk_level == 'high':
            base_response['urgent_response'] = True
        
        return base_response
