const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({
  region: "ap-northeast-1", //リージョン
});
exports.handler = async (event) => {
  const sales = event.sales;
  let params = {
    TableName: myTableName, //テーブル名を指定
    IndexName: myGSI, //インデックス名を指定
    ExpressionAttributeNames: { "#Sales": "Sales" },
    ExpressionAttributeValues: { ":val": sales },
    KeyConditionExpression: "#Sales = :val", //上の２文はプレースホルダー
  };
  const request = await dynamo.query(params).promise();
  //queryされた結果をsesでメールで送る
  // const params = {
  //   Destination: {
  //     ToAddresses: [shino124sd@gmail.com],
  //   },
  //   Message: {
  //     Body: {
  //       Text: { Data: "Test" },
  //     },

  //     Subject: { Data: "Test Email" },
  //   },
  //   Source: "SourceEmailAddress",
  // };

  // return ses.sendEmail(params).promise();

  return request.Count;
};
