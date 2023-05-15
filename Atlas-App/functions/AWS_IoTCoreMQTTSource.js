exports = function({ query, headers, body}, response) {

      // Parsing raw request body
      const message = JSON.parse(body.text());
      console.log(JSON.stringify(message));
      
    try {
      // Convert date string into date Type
      message.ts = new Date(message.ts);
      
      // Including DTPartition for ordering in Unity Model 
      if (message.topic === "f/i/order") {
        message._partition = "DTPartition"
      }
      
      // Routing MQTT Message to different collections based on the Topic
      const default_collection = "mqtt"
      const target_collection_map = {
        'i/cam' : 'factory_camera',
        'i/ldr' : 'sensors',
        'i/bme680' : 'sensors'
      }
      
      // Writing into the database
      const collection = target_collection_map[message.topic] || default_collection
      context.services.get("mongodb-atlas").db("aws").collection(collection).insertOne(message)
      
      return  "Event received";
    }
    catch (err) {
      context.services.get("mongodb-atlas").db("aws").collection("error_handling").insertOne(message)
    }
};
