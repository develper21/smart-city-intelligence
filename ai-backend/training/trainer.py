import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import cv2
import numpy as np
import os
import json
from typing import List, Dict, Any, Tuple
from datetime import datetime
import albumentations as A
from albumentations.pytorch import ToTensorV2
from tqdm import tqdm
import matplotlib.pyplot as plt

class CrimeVideoDataset(Dataset):
    """
    Custom dataset for crime video training
    """
    
    def __init__(self, video_paths: List[str], labels: List[str], transform=None):
        self.video_paths = video_paths
        self.labels = labels
        self.transform = transform
        self.crime_types = list(set(labels))
        self.label_to_idx = {label: idx for idx, label in enumerate(self.crime_types)}
        
    def __len__(self):
        return len(self.video_paths)
    
    def __getitem__(self, idx):
        video_path = self.video_paths[idx]
        label = self.labels[idx]
        
        # Extract frames from video
        frames = self._extract_frames(video_path, max_frames=10)
        
        # Apply transforms
        if self.transform:
            frames = [self.transform(image=frame)['image'] for frame in frames]
        
        # Stack frames
        video_tensor = torch.stack(frames)
        
        # Convert label to tensor
        label_tensor = torch.tensor(self.label_to_idx[label])
        
        return video_tensor, label_tensor
    
    def _extract_frames(self, video_path: str, max_frames: int = 10) -> List[np.ndarray]:
        """
        Extract frames from video
        """
        cap = cv2.VideoCapture(video_path)
        frames = []
        
        if not cap.isOpened():
            return [np.zeros((224, 224, 3), dtype=np.uint8) for _ in range(max_frames)]
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_interval = max(1, total_frames // max_frames)
        
        frame_count = 0
        extracted_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret or extracted_count >= max_frames:
                break
                
            if frame_count % frame_interval == 0:
                # Resize and normalize frame
                frame = cv2.resize(frame, (224, 224))
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(frame)
                extracted_count += 1
                
            frame_count += 1
        
        cap.release()
        
        # Pad with zeros if not enough frames
        while len(frames) < max_frames:
            frames.append(np.zeros((224, 224, 3), dtype=np.uint8))
        
        return frames

class CrimeClassifier(nn.Module):
    """
    Neural network for crime classification
    """
    
    def __init__(self, num_classes: int, input_frames: int = 10):
        super(CrimeClassifier, self).__init__()
        
        # CNN for spatial features
        self.cnn = nn.Sequential(
            nn.Conv3d(3, 64, kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(64),
            nn.ReLU(),
            nn.MaxPool3d(kernel_size=(1, 2, 2)),
            
            nn.Conv3d(64, 128, kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(128),
            nn.ReLU(),
            nn.MaxPool3d(kernel_size=(2, 2, 2)),
            
            nn.Conv3d(128, 256, kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(256),
            nn.ReLU(),
            nn.MaxPool3d(kernel_size=(2, 2, 2)),
        )
        
        # Calculate flattened size
        self.flattened_size = self._get_flattened_size(input_frames)
        
        # LSTM for temporal features
        self.lstm = nn.LSTM(self.flattened_size, 512, batch_first=True, num_layers=2)
        
        # Classifier
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
    
    def _get_flattened_size(self, input_frames: int) -> int:
        """
        Calculate flattened size after CNN
        """
        with torch.no_grad():
            dummy_input = torch.zeros(1, 3, input_frames, 224, 224)
            dummy_output = self.cnn(dummy_input)
            return dummy_output.view(dummy_output.size(0), -1).size(1)
    
    def forward(self, x):
        # Input shape: (batch, frames, channels, height, width)
        x = x.permute(0, 2, 1, 3, 4)  # (batch, channels, frames, height, width)
        
        # Extract spatial features
        x = self.cnn(x)
        
        # Prepare for LSTM
        batch_size = x.size(0)
        x = x.view(batch_size, x.size(2), -1)  # (batch, frames, features)
        
        # Extract temporal features
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # Use last hidden state
        x = hidden[-1]  # (batch, hidden_size)
        
        # Classify
        x = self.classifier(x)
        
        return x

class ModelTrainer:
    """
    AI Model Training Pipeline
    """
    
    def __init__(self, save_dir: str = "models"):
        self.save_dir = save_dir
        os.makedirs(save_dir, exist_ok=True)
        
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.optimizer = None
        self.criterion = None
        
        # Training history
        self.train_losses = []
        self.val_losses = []
        self.train_accuracies = []
        self.val_accuracies = []
        
    def setup_model(self, num_classes: int, input_frames: int = 10):
        """
        Setup model for training
        """
        self.model = CrimeClassifier(num_classes, input_frames)
        self.model.to(self.device)
        
        self.optimizer = optim.AdamW(self.model.parameters(), lr=0.001, weight_decay=0.01)
        self.criterion = nn.CrossEntropyLoss()
        
        print(f"Model setup complete. Classes: {num_classes}, Device: {self.device}")
    
    def prepare_data(self, dataset_config: Dict[str, Any]) -> Tuple[DataLoader, DataLoader]:
        """
        Prepare training and validation data
        """
        # Data augmentation
        train_transform = A.Compose([
            A.HorizontalFlip(p=0.5),
            A.RandomBrightnessContrast(p=0.2),
            A.GaussNoise(p=0.1),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ])
        
        val_transform = A.Compose([
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ])
        
        # Load dataset paths and labels
        train_paths = dataset_config.get('train_videos', [])
        train_labels = dataset_config.get('train_labels', [])
        val_paths = dataset_config.get('val_videos', [])
        val_labels = dataset_config.get('val_labels', [])
        
        # Create datasets
        train_dataset = CrimeVideoDataset(train_paths, train_labels, train_transform)
        val_dataset = CrimeVideoDataset(val_paths, val_labels, val_transform)
        
        # Create data loaders
        train_loader = DataLoader(
            train_dataset, 
            batch_size=4, 
            shuffle=True, 
            num_workers=2
        )
        
        val_loader = DataLoader(
            val_dataset, 
            batch_size=4, 
            shuffle=False, 
            num_workers=2
        )
        
        return train_loader, val_loader
    
    def train_epoch(self, train_loader: DataLoader, epoch: int) -> Tuple[float, float]:
        """
        Train for one epoch
        """
        self.model.train()
        total_loss = 0.0
        correct = 0
        total = 0
        
        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}")
        
        for batch_idx, (videos, labels) in enumerate(pbar):
            videos, labels = videos.to(self.device), labels.to(self.device)
            
            self.optimizer.zero_grad()
            
            outputs = self.model(videos)
            loss = self.criterion(outputs, labels)
            
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
            
            # Calculate accuracy
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            # Update progress bar
            pbar.set_postfix({
                'Loss': f'{loss.item():.4f}',
                'Acc': f'{100.*correct/total:.2f}%'
            })
        
        avg_loss = total_loss / len(train_loader)
        accuracy = 100. * correct / total
        
        return avg_loss, accuracy
    
    def validate_epoch(self, val_loader: DataLoader) -> Tuple[float, float]:
        """
        Validate for one epoch
        """
        self.model.eval()
        total_loss = 0.0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for videos, labels in val_loader:
                videos, labels = videos.to(self.device), labels.to(self.device)
                
                outputs = self.model(videos)
                loss = self.criterion(outputs, labels)
                
                total_loss += loss.item()
                
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        avg_loss = total_loss / len(val_loader)
        accuracy = 100. * correct / total
        
        return avg_loss, accuracy
    
    def train(self, train_loader: DataLoader, val_loader: DataLoader, 
              epochs: int = 50, patience: int = 10) -> Dict[str, Any]:
        """
        Train the model
        """
        best_val_accuracy = 0.0
        patience_counter = 0
        
        print(f"Starting training for {epochs} epochs...")
        
        for epoch in range(epochs):
            # Training
            train_loss, train_acc = self.train_epoch(train_loader, epoch)
            
            # Validation
            val_loss, val_acc = self.validate_epoch(val_loader)
            
            # Save metrics
            self.train_losses.append(train_loss)
            self.val_losses.append(val_loss)
            self.train_accuracies.append(train_acc)
            self.val_accuracies.append(val_acc)
            
            print(f"Epoch {epoch+1}/{epochs}:")
            print(f"  Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
            print(f"  Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
            
            # Save best model
            if val_acc > best_val_accuracy:
                best_val_accuracy = val_acc
                self.save_model(f"best_model_epoch_{epoch+1}.pth")
                patience_counter = 0
            else:
                patience_counter += 1
            
            # Early stopping
            if patience_counter >= patience:
                print(f"Early stopping at epoch {epoch+1}")
                break
        
        # Save final model
        self.save_model("final_model.pth")
        
        # Save training history
        self.save_training_history()
        
        return {
            'best_val_accuracy': best_val_accuracy,
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'train_accuracies': self.train_accuracies,
            'val_accuracies': self.val_accuracies
        }
    
    def save_model(self, filename: str):
        """
        Save model checkpoint
        """
        checkpoint = {
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'train_accuracies': self.train_accuracies,
            'val_accuracies': self.val_accuracies
        }
        
        filepath = os.path.join(self.save_dir, filename)
        torch.save(checkpoint, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """
        Load model checkpoint
        """
        checkpoint = torch.load(filepath, map_location=self.device)
        
        if self.model is None:
            # Need to setup model first
            num_classes = len(checkpoint.get('class_names', ['violence', 'theft', 'vandalism']))
            self.setup_model(num_classes)
        
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        
        self.train_losses = checkpoint.get('train_losses', [])
        self.val_losses = checkpoint.get('val_losses', [])
        self.train_accuracies = checkpoint.get('train_accuracies', [])
        self.val_accuracies = checkpoint.get('val_accuracies', [])
        
        print(f"Model loaded from {filepath}")
    
    def save_training_history(self):
        """
        Save training history plots
        """
        plt.figure(figsize=(12, 4))
        
        # Loss plot
        plt.subplot(1, 2, 1)
        plt.plot(self.train_losses, label='Train Loss')
        plt.plot(self.val_losses, label='Val Loss')
        plt.title('Training and Validation Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        
        # Accuracy plot
        plt.subplot(1, 2, 2)
        plt.plot(self.train_accuracies, label='Train Acc')
        plt.plot(self.val_accuracies, label='Val Acc')
        plt.title('Training and Validation Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy (%)')
        plt.legend()
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.save_dir, 'training_history.png'))
        plt.close()
        
        # Save metrics as JSON
        history = {
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'train_accuracies': self.train_accuracies,
            'val_accuracies': self.val_accuracies
        }
        
        with open(os.path.join(self.save_dir, 'training_history.json'), 'w') as f:
            json.dump(history, f, indent=2)
    
    def evaluate_model(self, test_loader: DataLoader) -> Dict[str, Any]:
        """
        Evaluate model on test set
        """
        self.model.eval()
        all_predictions = []
        all_labels = []
        
        with torch.no_grad():
            for videos, labels in test_loader:
                videos, labels = videos.to(self.device), labels.to(self.device)
                
                outputs = self.model(videos)
                _, predicted = torch.max(outputs, 1)
                
                all_predictions.extend(predicted.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        # Calculate metrics
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
        
        accuracy = accuracy_score(all_labels, all_predictions)
        precision = precision_score(all_labels, all_predictions, average='weighted')
        recall = recall_score(all_labels, all_predictions, average='weighted')
        f1 = f1_score(all_labels, all_predictions, average='weighted')
        
        report = classification_report(all_labels, all_predictions, output_dict=True)
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'classification_report': report
        }

# Example usage function
def create_sample_dataset_config():
    """
    Create sample dataset configuration for testing
    """
    return {
        'train_videos': [
            'data/train/violence/video1.mp4',
            'data/train/violence/video2.mp4',
            'data/train/theft/video1.mp4',
            'data/train/theft/video2.mp4',
        ],
        'train_labels': [
            'violence', 'violence', 'theft', 'theft'
        ],
        'val_videos': [
            'data/val/violence/video1.mp4',
            'data/val/theft/video1.mp4',
        ],
        'val_labels': [
            'violence', 'theft'
        ]
    }
