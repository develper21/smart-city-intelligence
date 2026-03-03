import json
import asyncio
from datetime import datetime
from typing import Dict, List, Any
from enum import Enum
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import DatabaseManager, AlertLog

class NotificationType(Enum):
    TERMINAL = "terminal"
    WEBSOCKET = "websocket"
    DATABASE = "database"

class RiskLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class NotificationSystem:
    """
    Terminal-based Event Notification System
    As specified in requirements: Currently via terminal
    """
    
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.terminal_colors = {
            'CRITICAL': '\033[91m',  # Red
            'HIGH': '\033[93m',      # Yellow
            'MEDIUM': '\033[94m',    # Blue
            'LOW': '\033[92m',       # Green
            'RESET': '\033[0m'       # Reset
        }
        
    def send_alert(self, detection_data: Dict[str, Any]) -> str:
        """
        Send alert notification (currently terminal-based)
        """
        alert_id = self._generate_alert_id()
        
        # Format terminal output
        terminal_output = self._format_terminal_alert(alert_id, detection_data)
        
        # Print to terminal
        print(terminal_output)
        
        # Save to database
        self._save_alert_to_database(alert_id, detection_data)
        
        # Log system event
        self.db_manager.log_system_event(
            component="notification_system",
            level="INFO",
            message=f"Alert sent: {detection_data.get('crime_type', 'unknown')}",
            details=detection_data
        )
        
        return alert_id
    
    def _generate_alert_id(self) -> str:
        """
        Generate unique alert ID
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        return f"ALT_{timestamp}_{unique_id}"
    
    def _format_terminal_alert(self, alert_id: str, detection_data: Dict[str, Any]) -> str:
        """
        Format alert for terminal output as specified in requirements
        """
        risk_level = detection_data.get('risk_level', 'unknown').upper()
        event_type = detection_data.get('crime_type', 'unknown').upper()
        confidence = detection_data.get('confidence', 0.0)
        description = detection_data.get('description', 'No description available')
        location = detection_data.get('location', 'Unknown location')
        timestamp = detection_data.get('timestamp', datetime.now().strftime("%H:%M:%S"))
        
        # Get color for risk level
        color = self.terminal_colors.get(risk_level, '')
        reset = self.terminal_colors['RESET']
        
        # Format as specified in requirements
        alert_lines = [
            f"{color}[ALERT]{reset}",
            f"Alert ID    : {alert_id}",
            f"Event Type  : {event_type}",
            f"Risk Level  : {risk_level}",
            f"Confidence  : {confidence:.2f}",
            f"Source      : {location}",
            f"Timestamp   : {timestamp}",
            f"Description : {description}",
            "-" * 50
        ]
        
        # Add police response if available
        police_response = detection_data.get('police_response', {})
        if police_response:
            alert_lines.insert(-1, "")
            alert_lines.insert(-1, f"Response Required: {police_response.get('dispatch_required', False)}")
            alert_lines.insert(-1, f"Priority: {police_response.get('priority', 'unknown')}")
            alert_lines.insert(-1, f"Backup Needed: {police_response.get('backup_needed', False)}")
        
        # Add evidence notes if available
        evidence_notes = detection_data.get('evidence_notes', [])
        if evidence_notes:
            alert_lines.insert(-1, "")
            alert_lines.insert(-1, "Evidence Notes:")
            for note in evidence_notes[:3]:  # Limit to first 3 notes
                alert_lines.insert(-1, f"  - {note}")
        
        return '\n'.join(alert_lines)
    
    def _save_alert_to_database(self, alert_id: str, detection_data: Dict[str, Any]):
        """
        Save alert to database for tracking
        """
        try:
            alert_data = {
                'detection_id': detection_data.get('detection_id', 0),
                'event_type': detection_data.get('crime_type', 'unknown'),
                'risk_level': detection_data.get('risk_level', 'low'),
                'message': detection_data.get('description', ''),
                'notification_sent': True
            }
            
            self.db_manager.save_alert_log(alert_data)
            
        except Exception as e:
            print(f"Error saving alert to database: {e}")
    
    def send_system_status(self, status_data: Dict[str, Any]):
        """
        Send system status notification
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        status_lines = [
            f"\033[96m[SYSTEM STATUS]{self.terminal_colors['RESET']}",
            f"Timestamp   : {timestamp}",
            f"System State: {status_data.get('status', 'unknown')}",
            f"Model Loaded: {status_data.get('model_loaded', False)}",
            f"Active Connections: {status_data.get('active_connections', 0)}",
            "-" * 50
        ]
        
        print('\n'.join(status_lines))
    
    def send_batch_alerts(self, detections: List[Dict[str, Any]]):
        """
        Send multiple alerts in batch
        """
        if not detections:
            return
        
        print(f"\n\033[95m[BATCH ALERT - {len(detections)} Events Detected]{self.terminal_colors['RESET']}")
        print("=" * 60)
        
        for i, detection in enumerate(detections, 1):
            print(f"\033[95mEvent {i}/{len(detections)}:{self.terminal_colors['RESET']}")
            alert_id = self.send_alert(detection)
            print()  # Add spacing between alerts
        
        print(f"\033[95m[BATCH COMPLETE]{self.terminal_colors['RESET']}")
        print("=" * 60)
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """
        Get summary of recent alerts
        """
        try:
            recent_alerts = self.db_manager.get_recent_alerts(limit=10)
            stats = self.db_manager.get_detection_statistics()
            
            summary = {
                'recent_alerts_count': len(recent_alerts),
                'total_detections': stats['total_detections'],
                'critical_alerts': stats['critical_alerts'],
                'crime_type_distribution': stats['crime_type_distribution']
            }
            
            # Print summary to terminal
            self._print_alert_summary(summary)
            
            return summary
            
        except Exception as e:
            print(f"Error generating alert summary: {e}")
            return {}
    
    def _print_alert_summary(self, summary: Dict[str, Any]):
        """
        Print alert summary to terminal
        """
        print(f"\n\033[96m[ALERT SUMMARY]{self.terminal_colors['RESET']}")
        print("-" * 30)
        print(f"Recent Alerts: {summary['recent_alerts_count']}")
        print(f"Total Detections: {summary['total_detections']}")
        print(f"Critical Alerts: {summary['critical_alerts']}")
        
        if summary['crime_type_distribution']:
            print("\nCrime Type Distribution:")
            for crime_type, count in summary['crime_type_distribution'].items():
                print(f"  {crime_type}: {count}")
        
        print("-" * 30)
    
    def test_notification_system(self):
        """
        Test the notification system with sample data
        """
        print("\n\033[93m[TESTING NOTIFICATION SYSTEM]{self.terminal_colors['RESET']}")
        print("=" * 50)
        
        test_alert = {
            'crime_type': 'violence',
            'risk_level': 'high',
            'confidence': 0.85,
            'description': 'Physical altercation detected between 2 individuals',
            'location': 'Camera ID: CAM_001',
            'timestamp': '00:07:41',
            'police_response': {
                'dispatch_required': True,
                'priority': 'high',
                'backup_needed': True,
                'evidence_preservation': True
            },
            'evidence_notes': [
                'Number of persons involved: 2',
                'Detection confidence: 0.85',
                'Video evidence should be preserved'
            ]
        }
        
        self.send_alert(test_alert)
        
        print(f"\n\033[93m[TEST COMPLETE]{self.terminal_colors['RESET']}")
        print("=" * 50)

# Singleton instance
notification_system = NotificationSystem()

# Export for use in other modules
def send_alert(detection_data: Dict[str, Any]) -> str:
    """
    Global function to send alerts
    """
    return notification_system.send_alert(detection_data)

def get_alert_summary() -> Dict[str, Any]:
    """
    Global function to get alert summary
    """
    return notification_system.get_alert_summary()

def test_notifications():
    """
    Global function to test notification system
    """
    notification_system.test_notification_system()
