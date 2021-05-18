const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({
  region: "ap-northeast-1", //リージョン
});
const ses = new AWS.SES({ region: "us-east-1" });
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

  let mailItem = {
    Destination: {
      ToAddresses: ["shino124sd@gmail.com"],
    },
    Message: {
      Body: { Text: { Data: request } },
      Subject: { Data: "件名" },
    },
    Source: "sample@sdfghjoiuhg.com",
  };

  // メール送信
  ses.sendEmail(mailItem, function (err, data) {
    if (err) {
      console.log(err);
      // context.fail(err);
    }
    console.log(data);
    // context.succeed(data);
  });
  // return request.Count;
};
