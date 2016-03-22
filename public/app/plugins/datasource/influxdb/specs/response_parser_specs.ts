import _ from 'lodash';
import {describe, beforeEach, it, sinon, expect} from 'test/lib/common';
import ResponseParser from '../response_parser';

describe.only("influxdb response parser", () => {
  describe("SHOW_TAGS response", () => {
    this.parser = new ResponseParser();

    describe("response from 0.10.0", () => {
      var response = {
        "results": [
          {
            "series": [
              {
                "name": "hostnameTagValues",
                "columns": ["hostname"],
                "values": [ ["server1"], ["server2"] ]
              }
            ]
          }
        ]
      };

      var result = this.parser.parse('SHOW_TAGS', response);

      it("should get two responses", () => {
        expect(_.size(result)).to.be(2);
        expect(result[0].text).to.be("server1");
        expect(result[1].text).to.be("server2");
      });
    });
  });

  describe("SHOW_FIELDS response", () => {
    describe("response from 0.10.0", () => {
      var response = {
        "results": [
          {
            "series": [
              {
                "name": "measurements",
                "columns": ["name"],
                "values": [
                  ["cpu"], ["derivative"], ["logins.count"], ["logs"], ["payment.ended"], ["payment.started"]
                ]
              }
            ]
          }
        ]
      };

      var result = this.parser.parse('SHOW_FIELDS', response);
      it("should get two responses", () => {
        expect(_.size(result)).to.be(6);
      });
    });
  });
});
