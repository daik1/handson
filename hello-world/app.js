// import { Handler } from "aws-lambda";
// import { SESV2, DynamoDB } from "aws-sdk";
// const AWS = require("aws-sdk");
const { SESV2, DynamoDB } = require("aws-sdk");
const dynamo = new DynamoDB.DocumentClient({
  region: "ap-northeast-1", //リージョン
});
const ses = new SESV2({ region: "ap-northeast-1" });

exports.lambdaHandler = async (event) => {
  // export const lambdaHandler: Handler = async (event: any) => {
  const sales = event.Sales;
  let params = {
    TableName: "myTableName", //テーブル名を指定
    IndexName: "myGSI", //インデックス名を指定
    ExpressionAttributeNames: { "#Sales": "Sales" },
    ExpressionAttributeValues: { ":val": sales },
    KeyConditionExpression: "#Sales = :val", //上の２文はプレースホルダー
  };
  const response = await dynamo.query(params).promise();
  console.log(response);
  // .promise();
  // if (!response.Items || response.Items.length === 0) {
  //   return;
  // }
  // for (const { Sales } of response.Items) {
  let mailItem = {
    Destination: {
      ToAddresses: ["shino124sd@gmail.com"],
    },
    Content: {
      Simple: {
        Body: { Text: { Data: String(response.Item[0].Sales) } },
        Subject: { Data: "件名" },
      },
    },
    FromEmailAddress: "daikishinohara124@gmail.com",
  };
  try {
    const sesResponse = await ses.sendEmail(mailItem).promise();
    console.log(sesResponse);
  } catch (error) {
    console.log(error);
    return { statusCode: 500 };
  }
  return { statusCode: 200 };
};
// console.log(response);
//dynamodbを呼び出していること
//sesが呼ばれていること
//sesが正常に呼ばれたら200を返すこと
//sesが失敗したら500エラーを返すこと
// };
