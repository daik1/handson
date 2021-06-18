// import * as AWS from "aws-sdk";
// const testFunc = require("../../hello-world/app.ts");
// import { Handler } from "aws-lambda";
// import AWS from "aws-sdk";
// const AWS = require("aws-sdk");
const { SESV2, DynamoDB } = require("aws-sdk");
// 関数をインポート
jest.mock("aws-sdk");
// ライブラリをmock化,jsのライブラリをmock化
const { mocked } = require("ts-jest/utils");
// let mockQuerySpy = jest.spyOn(
//   // @ts-ignore
//   AWS.DynamoDB.services["2012-08-10"]["__super__"].DocumentClient.prototype,
//   "query"
// );

// const querySpy = jest.fn();
// const mockDynamo = mockedDynamoDB.mockImplementation(() => {
//   return { query: querySpy };
// });
// const mockedDynamoDB = mocked(DynamoDB.DocumentClient);
const querySpy = jest.fn().mockImplementation(() => {
  return {
    promise: jest.fn().mockResolvedValue({
      Item: [
        {
          Sales: 100,
        },
      ],
    }),
  };
});
// mockedDynamoDB.mockImplementation(() => {
DynamoDB.DocumentClient.mockImplementation(() => {
  return {
    query: querySpy,
  };
});

const trueValue = jest.fn().mockResolvedValue({});
//メール送信SES
const mockedSES = mocked(SESV2);
let sendSpy = jest.fn().mockImplementation(() => {
  return {
    promise: trueValue,
  };
});

// @ts-ignore
mockedSES.mockImplementation(() => {
  return {
    sendEmail: sendSpy,
  };
});

//正常系か異常系でdescribeは大きく分ける
describe("appのテスト", () => {
  let testFunc = require("../../hello-world/app");
  // let testFunc: {
  //   lambdaHandler: Handler,
  // } = require("../../hello-world/app.ts");
  describe("正常系", () => {
    let resultData;
    let event = {
      Sales: 100,
    };
    beforeEach(async () => {
      resultData = await testFunc.lambdaHandler(event);
    });
    it("dynamodbから正しい値を取得していること", () => {
      ///書ける
      let expectedQueryParam = {
        TableName: "myTableName", //テーブル名を指定
        IndexName: "myGSI", //インデックス名を指定
        ExpressionAttributeNames: { "#Sales": "Sales" },
        ExpressionAttributeValues: { ":val": event.Sales },
        KeyConditionExpression: "#Sales = :val", //上の２文はプレースホルダー
      };

      expect(querySpy).toHaveBeenCalledWith(expectedQueryParam);
    });
    it("正しい引数でsesメール送信メソッドを呼んでいること", () => {
      let expectSales = 100;

      let expectedParams = {
        Destination: {
          ToAddresses: ["shino124sd@gmail.com"],
        },
        Content: {
          Simple: {
            Body: { Text: { Data: String(expectSales) } },
            Subject: { Data: "件名" },
          },
        },
        FromEmailAddress: "daikishinohara124@gmail.com",
      };
      expect(sendSpy).toHaveBeenCalledWith(expectedParams);
    });
    it("メ-ル送信成功時ステータスコード200が返却されること", () => {
      //メール送信成功
      expect(sendSpy).toHaveBeenCalled();
      expect(resultData).toEqual({ statusCode: 200 });
      //expected
    });
  });
  describe("異常系", () => {
    let resultData;
    let event = {
      Sales: 100,
    };
    const errorValue = jest
      .fn()
      .mockResolvedValue(new Error("This is an SES error"));
    const errorSendSpy = jest.fn().mockImplementation(() => {
      return {
        promise: errorValue,
      };
    });

    // @ts-ignore
    mockedSES.mockImplementation(() => {
      return {
        sendEmail: errorSendSpy,
      };
    });

    beforeEach(async () => {
      resultData = await testFunc.lambdaHandler(event);
    });
    it("メ-ル送信失敗時ステータスコード500が返却されること", () => {
      expect(errorSendSpy).toHaveBeenCalledTimes(1);
      expect(resultData).toEqual({ statusCode: 500 });
    });
  });
  afterEach(async () => {
    querySpy.mockClear();
    sendSpy.mockClear();
    trueValue.mockClear();
    // mockedSES.mockClear();
  });
});
