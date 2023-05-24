# Smart Factory Computer Vision Inference for Digital Twins
The aim of this repository is threefold:

1. Show how to get the images from a video camera on a Smart Factory, store them in MongoDB and take advantage of the Document Model.
2. Use the stored images to train and deploy a Computer Vision Model on Sagemaker.
3. Call the Model Endpoint to update a [Digital Twin of the Smart Factory](https://github.com/mongodb-industry-solutions/Smart-Factory-Unity-Model) utilizing Device Sync and Realm. 


In this case, our camera will be sending images of the warehouse to MongoDB and the Computer Vision model will infer what's the stock in the warehouse at any given time. Then, we will use the current state of the warehouse to inform the Digital Twin of the Factory about the state in order to sync the real and virtual Factories using Realm and Device Sync. 

<img width="1295" alt="High Level Schema for Digital Twin Sync" src="https://user-images.githubusercontent.com/45240043/236820026-dabaf3a6-ce41-44de-bdcd-d841a46fd9ea.png">

It's important to note that this is a simplified version. Regardless, a similar architecture and implementation can be used for larger and/or different problems such as: 
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
The images from the Factory are sent via MQTT as base64 encoded strings. We have selected AWS IoT Core as the MQTT broker to receive the images and send them to MongoDB for storage, as seen in the image below.
![Screenshot 2023-05-15 at 14 38 30](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/28a5eb60-81f5-4cb0-9ffa-f6d46b57260a)

AWS IoT Core allows you to connect IoT messages to other services through [Rules](https://docs.aws.amazon.com/iot/latest/developerguide/iot-rules.html) and [Rule Actions](https://docs.aws.amazon.com/iot/latest/developerguide/iot-rule-actions.html). This is how we will send MQTT messages to MongoDB.

Now, we have to set up the Factory to send MQTT messages to IoT Core, create the rules in IoT Core and set up an HTTP Endpoint in Atlas to receive the data. 

Let's check each and one of them:

#### Factory to send MQTT messages to IoT Core

[Smart Factory MQTT configuration](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/tree/main/Smart-Factory-config)

#### Set up an HTTP Endpoint in Atlas

[Set up an HTTP Endpoint in Atlas](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/tree/main/Atlas-HTTPS-Endpoint-setup)

#### Rules in AWS IoT Core

[How to create rules on IoT Core](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/tree/main/IoT-Core-Rules)




## Storing images in MongoDB
#### MongoDB Standalone
There are many ways to store images in MongoDB such as:
- **[GridFS](https://www.mongodb.com/docs/manual/core/gridfs/)** - Most efficient way to store large files within MongoDB only. Files can be larger than  16MB
- **[Binary Data](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)** - Files can't exceed [MongoDB BSON document limit of 16 MB](https://www.mongodb.com/docs/manual/core/document/#document-size-limit)
- **Base64 strings** - Our chosen method for this demo.

It's important to note that when files are too large, there are other, more cost-effective methods to store them.

#### Object Storage + MongoDB
A common solution is to store the images/videos in an object storage service such as AWS S3 or Google Cloud Storage and then store the information/metadata relevant to find and process those files in MongoDB. 

A successful implementation of this efficient architecture is [Bosch's IoT Data Storage](https://bosch-iot-insights.com/static-contents/docu/html/Data-storage.html). 


![Screenshot 2023-05-15 at 12 05 13](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/e8bfa64d-468a-4d20-bfde-cb0b36699986)

Which benefits of the reduced costs of Object storage and the fast and efficient way to use MongoDB for processing the files and manage the rest of the application. 


For the purpose of this demo, we will store the files directly as Base64 encoded strings on documents. 

## Sagemaker Computer Vision Model
### Data

We have a training sample size of 16 images, and a validation sample size of just 8 images. We are conscious that this is by a far stretch not even close to be a usable Computer Vision Model. 

Nevertheless, this repo is not intended to show how to train and validate a usable CV model, but rather to show all the steps to get an End-to-End solution to connect an IoT device with a Digital Twin and use Computer Vision to infer a specific problem. 


We are going to build a multi-label classification model with the following 3 classes:
- Blue piece is present: 0
- Red piece is present: 1
- White piece is present: 2



###### Image Sample


<img alt="Sample Validation Image" src="https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/blob/main/Model-Training-Data/all-imgs/blue%2C%20red%2C%20white.jpeg">

###### Folder Structure
```
Model-Training-Data
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
The first column, represents an incremental id to uniquely identify each sample. The second, third and fourth columns are a one-hot encoding of each class (1: the class is present in the image, 0: the class is not present.). In order: blue, red, and white. Lastly, the fifth column is the name of the image file.

More about how to generate lst files for AWS Sagemaker [here](https://sagemaker-examples.readthedocs.io/en/latest/introduction_to_amazon_algorithms/imageclassification_caltech/Image-classification-lst-format-highlevel.html), and [here](https://medium.com/@texasdave2/itty-bitty-lst-file-format-converter-for-machine-learning-image-classification-on-aws-sagemaker-b3828c7ba9cc).
### The model
The model chosen for this demo is a [pre-trained built-in multi-class image classification algorithm](https://docs.aws.amazon.com/sagemaker/latest/dg/ecr-eu-west-1.html#image-classification-eu-west-1.title) on Sagemaker. 

In order to retrieve it:

```python
from sagemaker import image_uris
train_image_uri = image_uris.retrieve(
    framework="image-classification",
    region=region, # we have chosen eu-west-1
    image_scope="training" # What the docker image will be used for. In this case for training. We will create the inference image later
)
```

The EC2 instance type we have chosen for training is: `ml.g4dn.xlarge`.

Once we have the Docker image that Sagemaker will use for training pointed in our environment, it's time to instantiate the estimator class. We do this with [`sagemaker.estimator.Estimator()`](https://sagemaker.readthedocs.io/en/stable/api/training/estimators.html#sagemaker.estimator.Estimator):

```python
clf_estimator = sagemaker.estimator.Estimator(
    image_uri=train_image_uri,
    role=arn_role,
    instance_count=1,
    instance_type=train_instance,
    volume_size=30,
    max_run=3600,
    input_mode="File",
    output_path=s3_output_path,
    sagemaker_session=session
)
```
As you can see, we have specified image URI, the ARN role, the instance type, the S3 output path and the session. 
Besides this, the other relevant arguments are:
- **Instance Count = 1** - Number of Amazon EC2 instances to use for training. If we want to do parallelized training, we can chosen more than 1 instance.
- **Volume Size = 30** - Size in GB of the storage volume to use for storing input and output data during training
- **Max Run = 3600** - Timeout in seconds for training


#### Training

Once our estimator is ready, we can tweak the hyperparameters of the model. We have decided to do this as simple as possible, and hard-type the hyperparameters. However, if this is a production algorithm, the ideal scenario would be to use some framework for optimizing hyperparameters tuning. 

```python
nclasses = 3 # the number of classes for the multi-label classification. We have 3 classes: Blue present, Red present, White present. 
nimgs_train = 16 # the number of training images
nepochs = 100 # the number of epoch we want the model to go through
mini_batch_size = 6

clf_estimator.set_hyperparameters(
    num_classes=nclasses,
    epochs=nepochs,
    image_shape="3,240,320",    
    num_training_samples=nimgs_train,
    mini_batch_size=nimgs_train,
    num_layers=18,
    use_pretrained_model=1,
    multi_label=1
)
```




![image](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/943cc7f5-41a7-4717-93e3-194fee28d7c4)
After a few checks and a confirmation of the model's parameters, the model will start to go through each epoch:


![image](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/a4700c23-8249-4b71-9d3f-2b70aeb29f5c)
#### Evaluation
When Sagemaker finds a new higher validation accuracy, it will automatically save that version of the model. In our case that happened in Epoch 83, with a validation accuracy of 0.708333:

![image](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/bf7b1057-4104-4d7f-8583-4deb14a10ecf)

When the model has gone through all the epochs, it will automatically stop training and the model version with the highest validation accuracy will be stored.



### Deployment

To deploy the model and have it available on an endpoint for inference, we have to call the [.deploy()](https://sagemaker.readthedocs.io/en/stable/api/training/estimators.html#sagemaker.estimator.Estimator.deploy) method on the estimator class. 
With this, we have to specify the instance type, the model name and the desired endpoint name.
```python
clf_predictor = clf_estimator.deploy(
    initial_instance_count=1,
    instance_type=infer_instance_type,
    endpoint_name=endpoint_name,
    model_name=model_name
)
```
In our case, the inference type is `ml.t2.medium`, the model name is the same as the parameter `job_name` passed to the estimator class when calling the [.fit()](https://sagemaker.readthedocs.io/en/stable/api/training/estimators.html#sagemaker.estimator.Estimator.fit) method, and finally, our chosen endpoint name will be `smart-factory-wh-stock-inference`.
## Computer Vision Endpoint Inference 
Now that we have the model ready and deployed on an endpoint, it's time to call it for inference. We will do this with an [Atlas Function](https://www.mongodb.com/docs/atlas/app-services/functions/).
Atlas Functions can run arbitrary JavaScript code that you define. Functions can call other functions and include a built-in client for working with data in MongoDB Atlas clusters. They also include helpful global utilities, support common Node.js built-in modules, and can import and use external packages from the npm registry. 

They are used for low-latency, short-running tasks like data movement, transformations, and validation. 

Here's the [Stock Update](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/blob/main/Atlas-App/functions/Stock_Update.js) Atlas Function which has essentially three parts:

1- Setup - Here we instantiate the Sagemaker runtime with the necessary credential and transform the base64 image into a bitmat so we can send it over the payload. 
```js
// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");


const sageMakerRuntime = new AWS.SageMakerRuntime({
region: context.values.get(`AWS_REGION`),
accessKeyId: context.values.get(`AWS_ACCESS_KEY_ID`),
secretAccessKey: context.values.get(`AWS_ACCESS_KEY`)
});

const collection = context.services.get("mongodb-atlas").db("aws").collection("factory_camera");

const doc = await collection.find({}).sort({"ts":-1}).limit(1).toArray();

const base64Data = doc[0].data
const base64Image = base64Data.split(";base64,").pop();
// Convert base64 to buffer
const bitmap_img = Buffer.from(base64Image, 'base64');
```

2- Invoking the sagemaker endpoint for inference
```js
var params = {
Body: bitmap_img,
EndpointName: "smart-factory-wh-stock-inference",
ContentType: "image/jpeg"
};

sageMakerRuntime.invokeEndpoint(params, async function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
        // CODE TO USE RESPONSE DATA FROM SAGEMAKER, PART 3
    }
  }
);

```
3- Receiving the response back and updating the collection with the new inference. 

```js 
sageMakerRuntime.invokeEndpoint(params, async function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      responseData = JSON.parse(Buffer.from(data.Body).toString());
      console.log(responseData);
      var blue_prob = responseData[0]
      var red_prob = responseData[1]
      var white_prob = responseData[2]

      var blue_present = (blue_prob > 0.85) ? true : false;
      var red_present = (red_prob > 0.85) ? true : false;
      var white_present = (white_prob > 0.85) ? true : false;


      const coll_to_update = context.services.get("mongodb atlas").db("aws").collection("sagemaker_stock_inference");
      const stock_doc = await coll_to_update.find({}).sort({"ts":-1}).limit(1).toArray();

      coll_to_update.updateOne(
        {"_id": stock_doc[0]._id},
        {"$set": {
          "ts": new Date(),
          "is_present.blue": blue_present, 
          "is_present.red":red_present, 
          "is_present.white": white_present
        }}
      ); 
    }
  }
);
```


## Digital Twin synchronization with Realm and Device Sync
