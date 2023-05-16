# How to create rules on IoT Core

To create a rule, it's very simple on the AWS Console. 
1. Go to IoT Core service and on the left pane, select **Message Routing** and then **Rules** <img width="1668" alt="image" src="https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/e2eddd13-0268-4323-8ac5-20827f54af9d">
2. Click on **Create Rule** and write a name for it. 
3. Then Configure the SQL statement to select topic, a message and filter it. To know more about IoT SQL reference, check the docs [here](https://docs.aws.amazon.com/iot/latest/developerguide/iot-sql-reference.html?icmpid=docs_iot_hp_act).  
4. Now, configure the Rule Actions. For our case we have selected to send a message to an HTTP Endpoint, which will be configured in Atlas as done [here](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/blob/main/Atlas-HTTP-Wndpoint-setup/README.md), but there area many other connectors such Kafka, SNS, Kinesis, etc. 
