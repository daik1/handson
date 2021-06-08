// import * as AWS from "aws-sdk";
// const testFunc = require("../../hello-world/app.ts");

// import { Handler } from "aws-lambda";

// import AWS from "aws-sdk";
const { SESV2, DynamoDB } = require("aws-sdk");
const { mocked } = require("ts-jest/utils");
jest.mock("aws-sdk");
// let mockGetSpy = jest.spyOn(
//   // @ts-ignore
//   AWS.DynamoDB.services["2012-08-10"]["__super__"].DocumentClient.prototype,
//   "query"
// );
const mockedSES = mocked(SESV2);
const sendSpy = jest.fn().mockImplementation(() => {
  return {
    promise: jest.fn().mockResolvedValue({}),
  };
});

// @ts-ignore
mockedSES.mockImplementation(() => {
  return {
    sendEmail: sendSpy,
  };
});
const mockedDynamoDB = mocked(DynamoDB);
const querySpy = jest.fn();
mockedDynamoDB.mockImplementation(() => {
  return { query: querySpy };
});
// import { mocked } from "ts-jest/utils";
// import { salesObject } from "./interface/mockInterface";

//正常系か異常系でdescribeは大きく分ける
describe("appのテスト", () => {
  let testFunc = require("../../hello-world/app");
  // let testFunc: {
  //   lambdaHandler: Handler,
  // } = require("../../hello-world/app.ts");
  describe("正常系", () => {
    let resultData;

    beforeEach(async () => {
      let event = {
        Sales: 100,
      };
      let expectData = {
        Sales: 100,
      };
      querySpy.mockReturnValue({
        promise: jest.fn().mockResolvedValue(expectData),
      });
      // @ts-ignore
      resultData = await testFunc.lambdaHandler(event);
    });
    it("dynamodbから正しい値を取得していること", () => {
      ///書ける

      expect(querySpy).toHaveBeenCalled();
      // mockGetSpy.mockReturnValue(expectData);
    });
    it("正しい引数でsesメール送信メソッドを呼んでいること", () => {
      const mailToStub = "dummyToMail";
      const mailFromStub = "dummyFromMail";
      const dummyMessage = "dummy";

      let expectedParams = {
        Destination: {
          ToAddresses: [mailToStub],
        },
        Message: {
          Body: { Text: { Data: dummyMessage } },
          Subject: { Data: "件名" },
        },
        Source: mailFromStub,
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
    // it("メ-ル送信失敗時ステータスコード500が返却されること", () => {
    //   expect(sendSpy).toHaveBeenCalled();
    //   expect(resultData).toEqual({ statusCode: 200 });
    // });
  });
  afterEach(async () => {
    querySpy.mockClear();
  });
});
