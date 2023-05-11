# Smart Factory Computer Vision Inference for Digital Twins
The aim of this repository is threefold:

1. Show how to get the images from a video camera on a Smart Factory, store them in MongoDB and take advantage of the Document Model.
2. Use the stored images to train and deploy a Computer Vision Model on Sagemaker.
3. Call the Model Endpoint to update a [Digital Twin of the Smart Factory](https://github.com/mongodb-industry-solutions/Smart-Factory-Unity-Model) utilizing Device Sync and Realm. 


I this case our camera will be sending images of the warehouse to MongoDB and the Computer Vision model will infer what's the stock in the warehouse at any given time. Then, we will use the current state of the warehosue to inform the Digital Twin of the Factory about the state in order to sync the real and virtual Factories using Realm and Device Sync. 

<img width="1295" alt="High Level Schema for Digital Twin Sync" src="https://user-images.githubusercontent.com/45240043/236820026-dabaf3a6-ce41-44de-bdcd-d841a46fd9ea.png">

It's important to note that this is an extremely simplified version. Regardless, a similar architecture and implementation can be used for larger and/or different problems such as: 
- Product and Quality inspection.
- Anomaly detection.
- Object detection for sorting.
- Surveillance


## Intro
### Setup
At the highest level, we three main components:
1. A [Fischertechnik Factory](https://www.fischertechnik.de/en/products/industry-and-universities/training-models/567769-training-factory-industry-4-0-9v-v-2) that is constantly generating new data either from sensors, production, or status checks.
2. A Unity 3D Model of the [Fischertechnik Factory](https://github.com/mongodb-industry-solutions/Smart-Factory-Unity-Model) which acts as the Digital Twin of the real Factory
3. MongoDB in the middle of both. Which acts not only as the storage layer but also as the communication layer with Realm and Device Sync, as well as the main hub to use the data after it is stored. In this use case, we have connected with AWS Sagemaker in order to predict with Computer Vision the status of the warehouse of the Factory. 

The Smart Factory has a camera installed which captures images and 
### 



## Camera Images from Factory to MongoDB
The


## MongoDB image storage


## Sagemaker Computer Vision Model
### Data
###### Folder Structure
```
Model Training Data
│
└───all-imgs
│   │   img1.jpeg
│   │   img2.jpeg
|   |   ...
│   
└───train-imgs
│   │   img1.jpeg
│   │   img2.jpeg
|   |   ...
│   
└───valid-imgs
│   │   img3.jpeg
│   │   img4.jpeg
|   |   ...
│   
└───train-annots
│   │   train.lst
│   
└───valid-annots
    │   valid.lst
```
### Training
#### How model was evaluated
### Deployment


## Computer Vision Endpoint Inference 


## Digital Twin synchronization with Realm and Device Sync
