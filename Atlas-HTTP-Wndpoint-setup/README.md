# How to create an HTTPS Endpoint in Atlas

To create an HTTPs Endpoint, it's very simple on the MongoDB Atlas Console. 
1. Go to App Services and select the App you want to create the Endpoint for. If you don't have an app create yet, in this repo we explain how to create an app. On the left pane, select **HTTPS Endpoints** <img width="1684" alt="image" src="https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/3835c397-2ea9-4d9f-9f8b-fde8c02c08ea">


2. Click on **Add An Endpoint** and write the **Route** for it.
3. Scroll down, and tune the HTTP Method, the Return Type and whether or not it will respond with a result.
    * In our case, it will be a POST endpoint, with return type JSON and with the *Respond with Result* option turned off. ![image](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/153c266d-e7d3-4bd9-bc89-5d89d9fdf360)
4. Next, select the function you want the Endpoint to Activate. You can select from a list of the already created functions or create a function on the fly. 
5. Tune the Authorization Settings. To learn more about Authorization on Atlas Endpoints, [here's the documentation](https://www.mongodb.com/docs/atlas/app-services/data-api/custom-endpoints/#authorization). We offer three options:
    * No Additional Authorization. This is the option used for this demo. We strongly recommend using some authorization method if this will be in production. 
    * Payload Signature
    * Secret Parameter

6. Tune the User Settings. For this demo, both options will be turned off. More about user settings for functions [here](https://www.mongodb.com/docs/atlas/app-services/services/configure/service-webhooks/#configure-user-authentication).
![image](https://github.com/mongodb-industry-solutions/smart-factory-computer-vision-inference/assets/45240043/a6d8ba72-7268-419f-b0ee-7114a48ff909)

7. Finally, click on **Save Draft**, and then **Review Draft & Deploy** when the Endpoint is ready.



<br>
You can find the URL of the Endpoint, as well as a curl test request inside its configuration. 
<br>
<br>
<br>
<br>
And that's it! You have now created an HTTPs Endpoint in Atlas, and it's ready to use. 



