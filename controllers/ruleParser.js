class RuleParser
{
    static unitelParser = require('./specificRuleParsers/parser-unitel.js');
    static telavoxParser = require('./specificRuleParsers/parser-telavox.js');
    static tdcParser = require('./specificRuleParsers/parser-tdc.js');
    static teliaParser = require('./specificRuleParsers/parser-telia.js');
    static firmafonParser = require('./specificRuleParsers/parser-firmafon.js');
    static flexfoneParser = require('./specificRuleParsers/parser-flexfone.js');
    static fullrateParser = require('./specificRuleParsers/parser-fullrate.js');
    static globalconnectParser = require('./specificRuleParsers/parser-globalConnect.js');
    static ipvisionParser = require('./specificRuleParsers/parser-ipvision.js');
    static rules =
    {
        "unitel":RuleParser.unitelParser.parse,
        "telavox":RuleParser.telavoxParser.parse,
        "tdc":RuleParser.tdcParser.parse,
        "telia":RuleParser.teliaParser.parse,
        "firmafon":RuleParser.firmafonParser.parse,
        "flexfone":RuleParser.flexfoneParser.parse,
        "fullrate":RuleParser.fullrateParser.parse,
        "globalConnect":RuleParser.globalconnectParser.parse,
        "ipvision":RuleParser.ipvisionParser.parse
    };
}
module.exports = RuleParser;