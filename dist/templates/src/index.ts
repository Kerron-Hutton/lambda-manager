import {
  APIGatewayProxyResult,
  APIGatewayProxyEvent
} from 'aws-lambda';

/**
 * AWS Lambda invokes your Lambda function via a handler object. It
 * serves as the entry point that AWS Lambda uses to execute your function code.
 * @param event contains all request data from the event source.
 * @returns returns promise containing http response.
 */
export function handler(event: APIGatewayProxyEvent) {
  console.log("Lambda has been invoked.");
  return sendResponse(200, { Message: "Created by lambda manager" });
}

/**
 * This function is used to send all responses back to the lambda function caller.
 * @param statusCode number representing the response status code. 
 * @param responseBody object containing the response body data.
 * @returns returns promise containing http response.
 */
function sendResponse(statusCode: number, responseBody: any) {
  const response = {} as APIGatewayProxyResult;
  response.body = JSON.stringify(responseBody);
  response.statusCode = statusCode;
  response.headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };

  console.log("Response was sent back to the client.");
  return Promise.resolve(response);
}
