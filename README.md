# Loyalty App
## General overview
### Step 1: create a REST API consisting of 3 endpoints implemented with Lambda functions:
- Lambda1: POST /loyalty-cards: create a loyalty card.
- Lambda2: GET /loyalty-cards/10: display the loyalty card you just created using the id.
- Lambda3: GET /loyalty-cards: display all loyalty cards.

### Step 2: create 2 additional Lambdas
- Lambda 4: listens to new CSV files with loyalty cards in an S3 bucket and sends them one by one to an SQS queue.
- Lambda 5: listens to new messages in the previous queue and adds them to the database.

## Implementation
To solve this challenge, I used the Serverless Framework with Node.js/Typescript. To test the function locally without needing to deploy I relied on the plugins `serverless-offline`, `serverless-s3-local`, `serverless-offline-sqs` and `serverless-dynamodb`. In order to simulate a local queue I used the [ElasticMQ docker image](https://hub.docker.com/r/softwaremill/elasticmq) connected to the offline sqs plugin. Unit testing was implemented with Jest.
In terms of architecture, I tried to apply something similar to [Uncle Bob's Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) separating controllers/listeners (Lambda function handlers) from the business logic implemented in services and data access in repositories. In other words, the controllers and listeners get the event, extract the required data and pass it to the service. The service does all the business logic like validations, instantiates the models and interacts through the repositories with data systems like database, file buckets and queues. After the service finishes interacting with repositories and additional libraries (like JSON validation) it sends a result back to the controller or throws an exception if something goes wrong. The controller decides what to respond (body and statusCode) based on what it got from the service.
### Step 1
I created the three Lambda functions all listening to `httpApi` events. I also defined the DynamoDB database to save the Loyalty Cards. I decided to use the card number as a primary key and not to use partition/sort keys since the challenge didn't require querying the objects.
The Postman Collection is included in the root of the project under the name `Loyalty APP.postman_collection.json` .

 - **POST** /loyalty-cards
	 I decided cards should follow a pattern XXXX-XXXX-XXXX-XXXX where X is a number. Points are optional, if not specified they will be zero. If the card already exists the endpoint will throw a 400 Bad Request error, same if data does not comply to the JSON schema:
	```
	{
	    "type": "object",
	    "properties": {
	      "firstName": {
	        "type": "string"
	      },
	      "lastName": {
	        "type": "string"
	      },
	      "cardNumber": {
	        "type": "string",
	        "pattern": "^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$"
	      },
	      "points": {
	        "type": "integer"
	      }
	    },
	    "required": [
	      "firstName",
	      "lastName",
	      "cardNumber"
	    ],
	    "additionalProperties": false
	  }
	```
- **GET** /loyalty-cards/:cardNumber
	:cardNumber is the exact card number of the loyalty card
	If not found it throws a 404 Not Found error.
- **GET** /loyalty-cards
	For listing I decided to include two query parameters:
	- `limit`: maximum amount of cards retrieved, default is 50.
	- `nextToken`: since DynamoDB has no pagination, the response body of this endpoint will include a `nextToken`. If it's used in the subsequent request, the response will return the next "page" of results. When the end of the table is reached, `nextToken` will be `null`. Example response:
	```
	{
    "loyaltyCards": [
        {
            "firstName": "Federico",
            "lastName": "Burgardt",
            "cardNumber": "1111-2222-3333-4444",
            "points": 200,
            "createdAt": "2023-11-15T06:00:56.305Z",
            "lastUpdatedAt": "2023-11-15T06:00:56.305Z"
        }
    ],
    "nextToken": null
    }
	```
### Step 2
- **Lambda 4**: new file listener
	I created an S3 bucket and a listener for every `ObjectCreated` event. I used the filter rule to check that the file has the `.csv` extension. The CSV files don't need to follow a specific order in the columns, but they must include the headers in the first row, with the following column names: `cardNumber`, `firstName`, `lastName` and `points`. Again, the points column is optional, if not received, all of the cards with have 0 points, but that's Lambda 5's job. A small and a big sample files are both included within the `/examples` directory in the project. This is an example, generated outside of the project with the [faker-js](https://www.npmjs.com/package/@faker-js/faker) library:
	```
	cardNumber,firstName,lastName,points
	7461-1147-4585-9327,Dewitt,Moen-Frami,663
	4047-6393-0563-3246,Magdalena,Marquardt-Luettgen,237
	5557-9560-0702-2984,Ibrahim,Durgan,576
	8596-5228-5470-4353,Shaylee,Hintz-Jenkins,787
	4436-3032-7822-3838,Baron,Toy,929
	```
	The lambda parses that file and splits the parsed rows in chunks of 1000 to push them into the SQS queue with the Batch command.
	**Note**: I wasn't able to do those pushes in parallel, because my computer would run out of memory and I didn't have enough time to keep trying.
- **Lambda 5**: new message in queue listener
	This lambda is very simple, it listens for the messages pushed from the previous function one by one and reuses the same method from Lambda 1. The main difference is that this time if the loyalty card already exists it doesn't throw an error, but it just ignores it.

## Run project locally
From the root folder of the project
1. Install packages
    ``npm install``
2. Download and run ElasticMQ (docker required)
	``npm run docker:start``
3. Create `.env` file (you can copy the contents from `.env.example`
4. Run dev environment
	``npm run dev``

-	Tests
	``npm run test``

Upload file to local bucket (aws-cli required)
1. First we need to configure a local profile to use the aws-cli
	``aws configure --profile s3local``
	
	The default creds are:
	```
	aws_access_key_id = S3RVER
	aws_secret_access_key = S3RVER
	``` 
2. To upload a file to local S3:
	```aws --endpoint http://localhost:4569 s3 cp examples/loyaltyCardsShort.csv s3://dev-loyalty-cards-bucket/uploadednewfile.csv --profile s3local```
## Room for improvement
Things I didn't have time to implement
#### Authorization
I didn't include any authorization for the REST API, and it would have been nice to add a JWT Authorizer. 
#### Dead Letter Queues
None of the functions have dead letter queues.
#### Metrics and alarms
There could be some metrics and alarms set regarding usage and health for example.
#### Integration tests
I only included unit tests, and even though they cover 100% of the modules, it would be great to include integration tests.
