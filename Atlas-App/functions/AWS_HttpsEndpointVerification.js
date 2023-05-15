exports = function({ query, headers, body}, response) {

    // To enable HTTPS endpoints for AWS IoT Core Message Routing Rules you have to verify ownership of the domain.
    // AWS provides you a workflow to run the verification here: https://docs.aws.amazon.com/iot/latest/developerguide/rule-destination.html
    // Within the verification process the HTTPS endpoint is called and a confirmation token provided as part of the message body.
    // As the token is too long for the log file output, we are going to insert it as a document into MongoDB. From there you
    // you can then copy the whole token and paste it into the verification dialog in the AWS console or through the AWS command line
    
    awsBody = JSON.parse(body.text());
    
    const doc = context.services.get("mongodb-atlas").db("aws").collection("verification").insertOne(awsBody);
};
