# Smart Factory Computer Vision Inference for Digital Twin's 
The aim of this repository is threefold:

1. Show how to get the images from a video camera on a Smart Factory, store them in MongoDB and take advantage of the Document Model.
2. Use the stored images to train and deploy a Computer Vision Model on Sagemaker.
3. Call the Model Endpoint to update a Digital Twin of the Smart Factory utilizing Device Sync and Realm. 


I this case our camera will be sending images of the warehouse to MongoDB and the Computer Vision model will infer what's the stock in the warehouse at any given time. Then, we will use the current state of the warehosue to inform the Digital Twin of the Factory about the state in order to sync the real and virtual Factories using Realm and Device Sync. 

It's important to note that this is an extremely simplified version. Regardless, a similar architecture and implementation can be used for larger and/or different problems such as: 
- Product and Quality inspection.
- Anomaly detection.
- Object detection for sorting.
- Surveillance

