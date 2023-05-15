exports = async function(changeEvent) {
  
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
  

  var params = {
    Body: bitmap_img,
    EndpointName: "smart-factory-wh-stock-inference",
    ContentType: "image/jpeg"
  };
  
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
      
      
      const coll_to_update = context.services.get("mongodb-atlas").db("aws").collection("sagemaker-stock-inference");
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
  });

};
