const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({
  region: "ap-northeast-1", //リージョン
});
const ses = new AWS.SESV2({ region: "ap-northeast-1" });
exports.lambdaHandler = async (event) => {
  const sales = event.Sales;
  let params = {
    TableName: "myTableName", //テーブル名を指定
    IndexName: "myGSI", //インデックス名を指定
    ExpressionAttributeNames: { "#Sales": "Sales" },
    ExpressionAttributeValues: { ":val": sales },
    KeyConditionExpression: "#Sales = :val", //上の２文はプレースホルダー
  };
  const request = await dynamo.query(params).promise();
  console.log(request);

  let mailItem = {
    Destination: {
      ToAddresses: ["shino124sd@gmail.com"],
    },
    Message: {
      Body: { Text: { Data: String(request.Items[0].Sales) } },
      Subject: { Data: "件名" },
    },
    Source: "daikishinohara124@gmail.com",
  };
  try {
    ses.sendEmail(mailItem).promise();
  } catch (error) {
    return { statuscode: 500 };
  }
  return { statuscode: 200 };
};
