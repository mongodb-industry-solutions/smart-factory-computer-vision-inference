# Smart Factory Computer Vision Inference for Digital Twins
The aim of this repository is threefold:

1. Show how to get the images from a video camera on a Smart Factory, store them in MongoDB and take advantage of the Document Model.
2. Use the stored images to train and deploy a Computer Vision Model on Sagemaker.
3. Call the Model Endpoint to update a [Digital Twin of the Smart Factory](https://github.com/mongodb-industry-solutions/Smart-Factory-Unity-Model) utilizing Device Sync and Realm. 


In this case, our camera will be sending images of the warehouse to MongoDB and the Computer Vision model will infer what's the stock in the warehouse at any given time. Then, we will use the current state of the warehouse to inform the Digital Twin of the Factory about the state in order to sync the real and virtual Factories using Realm and Device Sync. 

<img width="1295" alt="High Level Schema for Digital Twin Sync" src="https://user-images.githubusercontent.com/45240043/236820026-dabaf3a6-ce41-44de-bdcd-d841a46fd9ea.png">

It's important to note that this is an extremely simplified version. Regardless, a similar architecture and implementation can be used for larger and/or different problems such as: 
- Product and Quality inspection.
- Anomaly detection.
- Object detection for sorting.
- Surveillance


## Intro
### Setup
At the highest level, we three main components:
1. **A [Fischertechnik Factory](https://www.fischertechnik.de/en/products/industry-and-universities/training-models/567769-training-factory-industry-4-0-9v-v-2)** - Constantly generating new data either from sensors, production, or status checks.
2. **A Unity 3D Model of the [Fischertechnik Factory](https://github.com/mongodb-industry-solutions/Smart-Factory-Unity-Model)** - Which acts as the Digital Twin of the real Factory
3. **MongoDB in the middle of both** - Which acts not only as the storage layer but also as the communication layer with Realm and Device Sync, as well as the main hub to use the data after it is stored.

The Smart Factory has a camera installed which captures images and the MQTT broker sends them as Base64 encoded strings. 
### 



## Camera Images from Factory to MongoDB
The images from the Factory are sent via MQTT as base64 encoded strings. We have selected AWS IoT Core as the MQTT broker to receive the images and send them to MongoDB for storage as seen in the image below.
![Screenshot 2023-05-15 at 14 38 30](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/28a5eb60-81f5-4cb0-9ffa-f6d46b57260a)

AWS IoT Core allows you to connect IoT messages to other services through [Rules](https://docs.aws.amazon.com/iot/latest/developerguide/iot-rules.html) and [Rule Actions](https://docs.aws.amazon.com/iot/latest/developerguide/iot-rule-actions.html). This is how we will send MQTT messages to MongoDB.

Now, we have to set up the Factory to send MQTT messages to IoT Core, create the rules in IoT Core and set up an HTTP Enpoint in Atlas to receive the data. 

Let's check each and one of them:

#### Factory to send MQTT messages to IoT Core

[Smart Factory MQTT configutation](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/tree/main/Smart-Factory-config)

#### Rules in AWS IoT Core

[How to creare rules on IoT Core](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/tree/main/IoT-Core-Rules)


#### Set up an HTTP Enpoint in Atlas

[Set up an HTTP Enpoint in Atlas](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/tree/main/Atlas-HTTP-Wndpoint-setup)




## Storing images in MongoDB
#### MongoDB Standalone
There are many ways to store images in MongoDB such as:
- **[GridFS](https://www.mongodb.com/docs/manual/core/gridfs/)** - Most efficient way to store large files within MongoDB only. Files can be larger than 16MB
- **[Binary Data](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)** - Files can't exceed [MongoDB BSON document limit of 16 MB](https://www.mongodb.com/docs/manual/core/document/#document-size-limit)
- **Base64 strings** - Our chosen method for this demo.

It's important to note that when files are too large, there are other more cost-effective methods to store them.

#### Object Storage + MongoDB
A common solution is to store the images/videos in an object storage service such as AWS S3 or Google Cloud Storage and then store the information/metadata relevant to find and process those files in MongoDB. 

A successful implementation of this efficient architecture is [Bosch's IoT Data Storage](https://bosch-iot-insights.com/static-contents/docu/html/Data-storage.html). 


![Screenshot 2023-05-15 at 12 05 13](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/e8bfa64d-468a-4d20-bfde-cb0b36699986)

Which benefits of the reduced costs of Object storage and the fast and efficient way to use MongoDB for processing the files and manage the rest of the application. 


For the purpose of this demo, we will store the files directly as Base64 encoded strings on documents. 

## Sagemaker Computer Vision Model
### Data

We have a training sample size of 16 images, and a validation sample size of just 8 images. We are concious that this is by a far stretch not even close to be a usable Computer Vision Model. 

Nevertheless, this repo is not intended to show how to train and validate a usable CV model, but rather to show all the steps to get an End-to-End solution to conect you IoT device with a Digital Twin and use Computer Vision to infer a specific problem. 


We are going to build a multi-label classification model with the following 3 classes:
- Blue piece is present: 0
- Red piece is present: 1
- White piece is present: 2



###### Image Sample


<img alt="Sample Validation Image" src="https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/blob/main/Model%20Training%20Data/all-imgs/blue%2C%20red%2C%20white.jpeg">

###### Folder Structure
```
Model Training Data
│
└───all-imgs
│   │   img1.jpeg
│   │   img2.jpeg
│   │   img3.jpeg
│   │   img4.jpeg
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

###### .lst file Structure
The Sagemaker built-in model uses .lst files for the annotations. These are files where information is separated by a tab, and each line represents a sample.
Below is a sample of the file.
```
1	1	1	1	blue, red, white - dark.jpeg
2	1	1	1	blue, red, white - light.jpeg
...
16	0	1	1	red, white - light.jpeg
```
The first column, represents an incremental id to uniquely indentify each sample. The second, third and fourth columns are a one-hot encoding of each class (1: the class is present in the image, 0: the class is not present.). In order: blue, red, and white. Lastly, the fifth column is the name of the image file.

More about how to generate lst files for AWS Sagemaker [here](https://sagemaker-examples.readthedocs.io/en/latest/introduction_to_amazon_algorithms/imageclassification_caltech/Image-classification-lst-format-highlevel.html), and [here](https://medium.com/@texasdave2/itty-bitty-lst-file-format-converter-for-machine-learning-image-classification-on-aws-sagemaker-b3828c7ba9cc).
### Training

#### How model was evaluated



### Deployment


## Computer Vision Endpoint Inference 


## Digital Twin synchronization with Realm and Device Sync
