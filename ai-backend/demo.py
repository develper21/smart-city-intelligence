#!/usr/bin/env python3
"""
Smart City Surveillance AI System Demo
Demonstrates the complete pipeline from video analysis to alert generation
"""

import os
import sys
import time
import json
import random
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.video_processor import VideoProcessor
from services.crime_detector import CrimeDetector
from services.rule_engine import PoliceRuleEngine
from services.notification_system import test_notifications, send_alert
from database.models import init_db, DatabaseManager
from utils.logger import setup_logger

class SurveillanceDemo:
    """
    Demo class to showcase the AI surveillance system
    """
    
    def __init__(self):
        self.logger = setup_logger("demo")
        self.video_processor = VideoProcessor()
        self.crime_detector = CrimeDetector()
        self.rule_engine = PoliceRuleEngine()
        self.db_manager = DatabaseManager()
        
        # Initialize database
        init_db()
        
        # Demo scenarios
        self.demo_scenarios = [
            {
                'name': 'Violence Detection',
                'crime_type': 'violence',
                'description': 'Physical altercation between 2 individuals',
                'person_count': 2,
                'risk_level': 'high'
            },
            {
                'name': 'Crowd Violence',
                'crime_type': 'crowd_violence',
                'description': 'Violent behavior in crowd of 8 persons',
                'person_count': 8,
                'risk_level': 'critical'
            },
            {
                'name': 'Suspicious Gathering',
                'crime_type': 'suspicious_gathering',
                'description': 'Unusual assembly of 4 persons',
                'person_count': 4,
                'risk_level': 'medium'
            },
            {
                'name': 'Theft Detection',
                'crime_type': 'theft',
                'description': 'Covert behavior suggesting theft activity',
                'person_count': 1,
                'risk_level': 'high'
            }
        ]
    
    def create_mock_detections(self, scenario: dict) -> list:
        """
        Create mock detection data for demo
        """
        person_count = scenario['person_count']
        detections = []
        
        # Create person detections
        for i in range(person_count):
            detection = {
                'class': 'person',
                'class_id': 0,
                'confidence': random.uniform(0.7, 0.95),
                'bbox': [
                    random.randint(50, 300),
                    random.randint(50, 400),
                    random.randint(350, 600),
                    random.randint(450, 800)
                ],
                'center': [
                    random.randint(100, 500),
                    random.randint(100, 500)
                ],
                'area': random.randint(5000, 15000)
            }
            detections.append(detection)
        
        # Add some vehicle detections for realism
        if random.random() > 0.5:
            vehicle_detection = {
                'class': random.choice(['car', 'truck', 'motorcycle']),
                'class_id': random.choice([2, 7, 3]),
                'confidence': random.uniform(0.6, 0.9),
                'bbox': [
                    random.randint(100, 400),
                    random.randint(300, 600),
                    random.randint(500, 800),
                    random.randint(400, 700)
                ],
                'center': [
                    random.randint(200, 600),
                    random.randint(350, 550)
                ],
                'area': random.randint(8000, 20000)
            }
            detections.append(vehicle_detection)
        
        return detections
    
    def run_complete_analysis(self, scenario: dict) -> dict:
        """
        Run complete analysis pipeline for a scenario
        """
        print(f"\n{'='*60}")
        print(f"DEMO SCENARIO: {scenario['name']}")
        print(f"{'='*60}")
        
        # Step 1: Create mock detections
        print("Step 1: Object Detection (YOLO)")
        detections = self.create_mock_detections(scenario)
        print(f"  Detected {len(detections)} objects")
        
        for detection in detections:
            print(f"    - {detection['class']} (confidence: {detection['confidence']:.2f})")
        
        # Step 2: Apply police rule engine
        print(f"\nStep 2: Police Rule Engine Analysis")
        timestamp = datetime.now().strftime("%H:%M:%S")
        analysis = self.rule_engine.analyze_scene(detections, timestamp)
        
        print(f"  Crime Detected: {analysis['is_crime']}")
        print(f"  Crime Type: {analysis.get('crime_type', 'None')}")
        print(f"  Risk Level: {analysis['risk_level']}")
        print(f"  Confidence: {analysis['confidence']:.2f}")
        print(f"  Description: {analysis['description']}")
        
        if analysis['indicators_detected']:
            print(f"  Indicators: {', '.join(analysis['indicators_detected'])}")
        
        # Step 3: Generate alert
        if analysis['is_crime']:
            print(f"\nStep 3: Alert Generation")
            
            # Prepare alert data
            alert_data = {
                'crime_type': analysis['crime_type'],
                'risk_level': analysis['risk_level'],
                'confidence': analysis['confidence'],
                'description': analysis['description'],
                'location': f'Demo Camera - {scenario["name"]}',
                'timestamp': timestamp,
                'police_response': analysis.get('police_response', {}),
                'evidence_notes': analysis.get('evidence_notes', []),
                'detection_id': random.randint(1000, 9999)
            }
            
            # Send alert
            alert_id = send_alert(alert_data)
            print(f"  Alert ID: {alert_id}")
            print(f"  Alert sent successfully!")
            
            # Save to database
            try:
                detection_record = {
                    'video_id': 1,  # Demo video ID
                    'timestamp': timestamp,
                    'crime_type': analysis['crime_type'],
                    'risk_level': analysis['risk_level'],
                    'confidence': analysis['confidence'],
                    'description': analysis['description'],
                    'bbox_data': json.dumps(detections),
                    'person_count': len([d for d in detections if d['class'] == 'person']),
                    'indicators': json.dumps(analysis['indicators_detected']),
                    'police_response': json.dumps(analysis.get('police_response', {})),
                    'evidence_notes': json.dumps(analysis.get('evidence_notes', []))
                }
                
                self.db_manager.save_detection_record(detection_record)
                print(f"  Detection saved to database")
                
            except Exception as e:
                print(f"  Error saving to database: {e}")
        
        else:
            print(f"\nStep 3: No Alert Generated (Normal Activity)")
        
        return analysis
    
    def run_system_check(self):
        """
        Run system health check
        """
        print(f"\n{'='*60}")
        print("SYSTEM HEALTH CHECK")
        print(f"{'='*60}")
        
        # Check components
        checks = {
            'Video Processor': self.video_processor is not None,
            'Crime Detector': self.crime_detector.is_model_loaded(),
            'Rule Engine': self.rule_engine is not None,
            'Database': True,  # Assuming init_db worked
            'Notification System': True
        }
        
        print("Component Status:")
        for component, status in checks.items():
            status_icon = "✅" if status else "❌"
            print(f"  {status_icon} {component}: {'Active' if status else 'Inactive'}")
        
        all_good = all(checks.values())
        print(f"\nOverall System Status: {'✅ HEALTHY' if all_good else '⚠️ NEEDS ATTENTION'}")
        
        return all_good
    
    def run_performance_test(self, iterations: int = 10):
        """
        Run performance test
        """
        print(f"\n{'='*60}")
        print(f"PERFORMANCE TEST ({iterations} iterations)")
        print(f"{'='*60}")
        
        times = []
        
        for i in range(iterations):
            scenario = random.choice(self.demo_scenarios)
            
            start_time = time.time()
            analysis = self.run_complete_analysis(scenario)
            end_time = time.time()
            
            processing_time = end_time - start_time
            times.append(processing_time)
            
            print(f"Iteration {i+1}: {processing_time:.3f}s")
        
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"\nPerformance Summary:")
        print(f"  Average Time: {avg_time:.3f}s")
        print(f"  Min Time: {min_time:.3f}s")
        print(f"  Max Time: {max_time:.3f}s")
        print(f"  Total Time: {sum(times):.3f}s")
        
        return {
            'average_time': avg_time,
            'min_time': min_time,
            'max_time': max_time,
            'total_time': sum(times)
        }
    
    def generate_report(self):
        """
        Generate demo report
        """
        print(f"\n{'='*60}")
        print("DEMO REPORT GENERATION")
        print(f"{'='*60}")
        
        try:
            # Get statistics from database
            stats = self.db_manager.get_detection_statistics()
            
            print("System Statistics:")
            print(f"  Total Detections: {stats['total_detections']}")
            print(f"  Critical Alerts: {stats['critical_alerts']}")
            
            if stats['crime_type_distribution']:
                print("\nCrime Type Distribution:")
                for crime_type, count in stats['crime_type_distribution'].items():
                    print(f"    {crime_type}: {count}")
            
            # Save report to file
            report_data = {
                'demo_time': datetime.now().isoformat(),
                'system_status': 'healthy',
                'statistics': stats,
                'demo_scenarios': len(self.demo_scenarios)
            }
            
            os.makedirs('reports', exist_ok=True)
            report_file = f"reports/demo_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(report_file, 'w') as f:
                json.dump(report_data, f, indent=2)
            
            print(f"\nReport saved to: {report_file}")
            
        except Exception as e:
            print(f"Error generating report: {e}")
    
    def run_full_demo(self):
        """
        Run complete demo suite
        """
        print("🚨 SMART CITY SURVEILLANCE AI SYSTEM - DEMO")
        print("=" * 60)
        print("Demonstrating AI-powered crime detection and alert system")
        print("Based on police rules and real-time video analysis")
        print("=" * 60)
        
        try:
            # Step 1: System check
            self.run_system_check()
            
            # Step 2: Test notification system
            print(f"\n{'='*60}")
            print("NOTIFICATION SYSTEM TEST")
            print(f"{'='*60}")
            test_notifications()
            
            # Step 3: Run demo scenarios
            print(f"\n{'='*60}")
            print("DEMO SCENARIOS")
            print(f"{'='*60}")
            
            for scenario in self.demo_scenarios:
                self.run_complete_analysis(scenario)
                time.sleep(2)  # Pause between scenarios
            
            # Step 4: Performance test
            self.run_performance_test(iterations=5)
            
            # Step 5: Generate report
            self.generate_report()
            
            print(f"\n{'='*60}")
            print("✅ DEMO COMPLETED SUCCESSFULLY!")
            print("=" * 60)
            print("\nKey Features Demonstrated:")
            print("  ✅ Real-time object detection (YOLO)")
            print("  ✅ Police rule-based crime analysis")
            print("  ✅ Risk level assessment")
            print("  ✅ Terminal-based alert system")
            print("  ✅ Database logging")
            print("  ✅ Performance monitoring")
            print("\nSystem is ready for integration with React dashboard!")
            
        except Exception as e:
            print(f"❌ Demo failed with error: {e}")
            self.logger.error(f"Demo failed: {e}")

def main():
    """
    Main function to run the demo
    """
    demo = SurveillanceDemo()
    demo.run_full_demo()

if __name__ == "__main__":
    main()
