'use strict';
const AWS = require('aws-sdk')

module.exports = {
  create: async(event, context) => {
    //ensure that a valid json object is parsed
    let bodyObj = {}
    try{
      bodyObj = JSON.parse(event.body)
    } catch (jsonError){
      console.log('There was an error passing the body', jsonError); //printed to cloudwatch logs
      return {
        statusCode: 400
      }
    }

    //ensure that we have 'defined' values in the object of the body
    if (typeof bodyObj.name === 'undefined' || typeof bodyObj.age === 'undefined'){
      console.log('Missing Parameters')
      return {
        statusCode: 400
      }
    }
    
    //define the put parameters
    let putParams = {
      TableName: process.env.DYANMODB_KITTEN_TABLE,
      Item: {
        name: bodyObj.name,
        age: bodyObj.age
      }
    }

    //try and put the results
    let putResult ={}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
      putResult = await dynamodb.put(putParams).promise()
    } catch (putError) {
      console.log('There was a problem putting the kitten')
      console.log('putParams', putParams, putError)
      return {
        statusCode: 500 // server error
      }
    }

    //function should have executed successfully at this point
    return{
      statusCode: 201
    }
  },

  list: async(event, context) => {
    let scanParams = {
      TableName: process.env.DYANMODB_KITTEN_TABLE,
    }

    let scanResults = {}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
      scanResults = await dynamodb.scan(scanParams).promise()
    } catch (scanError){
      console.log('There was a problem scanning the kittens')
      console.log('putParams', putParams)
      return {
        statusCode: 500 // server error
      }
    }

    if (scanResults.Items == null || 
    !Array.isArray(scanResults.Items) ||
    scanResults.Items.length ==0) {
      return {
        statusCode: 404
      }
    }

    return{
      statusCode: 200,
      body: JSON.stringify(scanResults.Items.map(kitten => {
        return{
          name: kitten.name,
          age: kitten.age
        }
      }

      ))
    }

  },

  get: async(event, context) => {
    
    let getParams = {
      TableName: process.env.DYANMODB_KITTEN_TABLE,
      Key: {
        name: event.pathParameters.name
      }
    }
    let getResults = {}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
      getResults = await dynamodb.get(getParams).promise()
    } catch (getError){
      console.log('There was a problem scanning the kittens')
      console.log('getError', getError)
      return {
        statusCode: 500 // server error
      }
    }

    if (getResults.Items == null) {
        return {
          statusCode: 404
        }
      }
  
      return{
        statusCode: 200,
        body: JSON.stringify({
            name: kitten.name,
            age: kitten.age
          })
      }


  },
  update: async(event, context) => {

    let bodyObj = {}
    try{
      bodyObj = JSON.parse(event.body)
    } catch (jsonError){
      console.log('There was an error passing the body', jsonError); //printed to cloudwatch logs
      return {
        statusCode: 400
      }
    }

    //ensure that we have 'defined' values in the object of the body
    if (typeof bodyObj.age == 'undefined'){
      console.log('Missing Parameters')
      return {
        statusCode: 400
      }
    }

    let updateParams = {
      TableName: process.env.DYANMODB_KITTEN_TABLE,
      Key: {
        name: event.pathParameters.name
      },

      updateExpression: 'set #$age = :age',
      ExpressionAttributeName:{
        '#age': 'age'
      },

      ExpressionAttributeValue: {
        '#age': bodyObj.age
      }

    }
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
      await dynamodb.update(updateParams).promise()
    } catch (updateError){
      console.log('There was a problem scanning the kittens')
      console.log('updateError', updateError)
      return {
        statusCode: 500 // server error
      }
    }
      return{
        statusCode: 200,
      }
  },

  delete: async(event, context) => {

    let deleteParams = {
      TableName: process.env.DYANMODB_KITTEN_TABLE,
      Key: {
        name: event.pathParameters.name
      }
    }
  
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
       await dynamodb.delete(deleteParams).promise()
    } catch (deleteError){
      console.log('There was a problem deleting the kittens')
      console.log('deleteError', deleteError)
      console.log("Paramater",deleteParams.key)
      return {
        statusCode: 500 // server error
      }
    }
      return{
        statusCode: 200,
      }

  },
}